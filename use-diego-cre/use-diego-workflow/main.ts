import {
	bytesToHex,
	type CronPayload,
	handler,
	CronCapability,
	EVMClient,
	encodeCallMsg,
	getNetwork,
	hexToBase64,
	LAST_FINALIZED_BLOCK_NUMBER,
	Runner,
	type Runtime,
	TxStatus,
} from '@chainlink/cre-sdk'
import { type Address, decodeFunctionResult, encodeFunctionData, zeroAddress, encodeAbiParameters, parseAbiParameters } from 'viem'
import { z } from 'zod'
import { vaultManager, mockAAVEV3, useDiegoConsumer } from '../contracts/abi'


const configSchema = z.object({
	schedule: z.string(),
	evms: z.array(
		z.object({
			vaultManagerAddress: z.string(),
			consumerAddress: z.string(),
			mockAaveAddress: z.string(),
			chainSelectorName: z.string(),
			chainSelector: z.string(),
			gasLimit: z.string(),
		}),
	),
})

type Config = z.infer<typeof configSchema>
type EvmConfig = Config['evms'][0]


interface ChainYieldInfo {
	chainSelectorName: string
	chainSelector: bigint
	supplyRate: bigint
	vaultManagerAddress: string
}


const safeJsonStringify = (obj: any): string =>
	JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2)

const fetchSupplyRate = (runtime: Runtime<Config>, evmConfig: EvmConfig): bigint => {
	const network = getNetwork({
		chainFamily: 'evm',
		chainSelectorName: evmConfig.chainSelectorName,
		isTestnet: true,
	})

	if (!network) {
		throw new Error(`Network not found: ${evmConfig.chainSelectorName}`)
	}

	const evmClient = new EVMClient(network.chainSelector.selector)

	const callData = encodeFunctionData({
		abi: mockAAVEV3,
		functionName: 'getSupplyAPY',
	})

	const contractCall = evmClient
		.callContract(runtime, {
			call: encodeCallMsg({
				from: zeroAddress,
				to: evmConfig.mockAaveAddress as Address,
				data: callData,
			}),
			blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
		})
		.result()

	const supplyRate = decodeFunctionResult({
		abi: mockAAVEV3,
		functionName: 'getSupplyAPY',
		data: bytesToHex(contractCall.data),
	})

	return supplyRate as bigint
}

const fetchAllYieldRates = (runtime: Runtime<Config>): ChainYieldInfo[] => {
	const results: ChainYieldInfo[] = []

	for (const evmConfig of runtime.config.evms) {
		try {
			runtime.log(`Fetching supply rate from ${evmConfig.chainSelectorName}...`)

			const supplyRate = fetchSupplyRate(runtime, evmConfig)

			runtime.log(
				`${evmConfig.chainSelectorName} supplyRate: ${supplyRate.toString()} (${Number(supplyRate) / 1e16}%)`
			)

			results.push({
				chainSelectorName: evmConfig.chainSelectorName,
				chainSelector: BigInt(evmConfig.chainSelector),
				supplyRate,
				vaultManagerAddress: evmConfig.vaultManagerAddress,
			})
		} catch (err) {
			runtime.log(`Failed to fetch yield from ${evmConfig.chainSelectorName}: ${err}`)
		}
	}

	return results
}

const updateYieldDataOnChain = (
	runtime: Runtime<Config>,
	evmConfig: EvmConfig,
	allYieldInfos: ChainYieldInfo[],
): void => {
	const network = getNetwork({
		chainFamily: 'evm',
		chainSelectorName: evmConfig.chainSelectorName,
		isTestnet: true,
	})

	if (!network) {
		throw new Error(`Network not found: ${evmConfig.chainSelectorName}`)
	}

	const evmClient = new EVMClient(network.chainSelector.selector)

	for (const yieldInfo of allYieldInfos) {
		try {
			runtime.log(
				`Updating ${evmConfig.chainSelectorName} with chain ${yieldInfo.chainSelectorName} rate: ${Number(yieldInfo.supplyRate) / 1e16}%`
			)

			const rawReport = encodeAbiParameters(
				parseAbiParameters('uint64 chainSelector, uint256 supplyRate'),
				[yieldInfo.chainSelector, yieldInfo.supplyRate]
			)

			const reportResponse = runtime
				.report({
					encodedPayload: hexToBase64(rawReport),
					encoderName: 'evm',
					signingAlgo: 'ecdsa',
					hashingAlgo: 'keccak256',
				})
				.result()

			const resp = evmClient
				.writeReport(runtime, {
					receiver: evmConfig.consumerAddress,
					report: reportResponse,
					gasConfig: {
						gasLimit: evmConfig.gasLimit,
					},
				})
				.result()

			if (resp.txStatus !== TxStatus.SUCCESS) {
				throw new Error(`TX failed: ${resp.errorMessage || resp.txStatus}`)
			}

			runtime.log(
				`Updated ${evmConfig.chainSelectorName} with ${yieldInfo.chainSelectorName} rate. txHash: ${bytesToHex(resp.txHash || new Uint8Array(32))}`
			)
		} catch (err) {
			runtime.log(
				`Failed to update ${yieldInfo.chainSelectorName} on ${evmConfig.chainSelectorName}: ${err}`
			)
		}
	}
}

const detectAnomaly = (
	runtime: Runtime<Config>,
	current: ChainYieldInfo[],
): boolean => {
	const ANOMALY_THRESHOLD = 50e16

	for (const info of current) {
		if (info.supplyRate > BigInt(ANOMALY_THRESHOLD)) {
			runtime.log(
				`ANOMALY DETECTED on ${info.chainSelectorName}: supplyRate ${Number(info.supplyRate) / 1e16}% exceeds threshold`
			)
			return true
		}
	}

	return false
}

const pauseAllVaults = (runtime: Runtime<Config>): void => {
	for (const evmConfig of runtime.config.evms) {
		try {
			const network = getNetwork({
				chainFamily: 'evm',
				chainSelectorName: evmConfig.chainSelectorName,
				isTestnet: true,
			})

			if (!network) continue

			const evmClient = new EVMClient(network.chainSelector.selector)

			const callData = encodeFunctionData({
				abi: vaultManager,
				functionName: 'emergencyPause',
			})

			const reportResponse = runtime
				.report({
					encodedPayload: hexToBase64(callData),
					encoderName: 'evm',
					signingAlgo: 'ecdsa',
					hashingAlgo: 'keccak256',
				})
				.result()

			const resp = evmClient
				.writeReport(runtime, {
					receiver: evmConfig.vaultManagerAddress,
					report: reportResponse,
					gasConfig: {
						gasLimit: evmConfig.gasLimit,
					},
				})
				.result()

			runtime.log(
				`Emergency pause ${evmConfig.chainSelectorName}: ${resp.txStatus} txHash: ${bytesToHex(resp.txHash || new Uint8Array(32))}`
			)
		} catch (err) {
			runtime.log(`Failed to pause vault on ${evmConfig.chainSelectorName}: ${err}`)
		}
	}
}

const onCronTrigger = (runtime: Runtime<Config>, payload: CronPayload): string => {
	if (!payload.scheduledExecutionTime) {
		throw new Error('Scheduled execution time is required')
	}

	runtime.log('=== CrossYield CRE Cycle Start ===')
	runtime.log(`Scheduled at: ${payload.scheduledExecutionTime}`)
	runtime.log(`Monitoring ${runtime.config.evms.length} chains`)

	runtime.log('--- Step 1: Fetching yield rates from all chains ---')
	const allYieldInfos = fetchAllYieldRates(runtime)

	if (allYieldInfos.length === 0) {
		throw new Error('Failed to fetch yield data from all chains')
	}

	runtime.log(`Yield data fetched from ${allYieldInfos.length} chains:`)
	for (const info of allYieldInfos) {
		runtime.log(`  ${info.chainSelectorName}: ${Number(info.supplyRate) / 1e16}%`)
	}

	runtime.log('--- Step 2: Anomaly detection ---')
	const isAnomaly = detectAnomaly(runtime, allYieldInfos)

	if (isAnomaly) {
		runtime.log('Anomaly detected! Pausing all vaults...')
		pauseAllVaults(runtime)
		return JSON.stringify({ status: 'paused', reason: 'anomaly_detected' })
	}

	runtime.log('No anomaly detected, proceeding...')

	runtime.log('--- Step 3: Updating yield data on all VaultManagers ---')

	for (const evmConfig of runtime.config.evms) {
		runtime.log(`Updating UseDiegoConsumer on ${evmConfig.chainSelectorName}...`)
		updateYieldDataOnChain(runtime, evmConfig, allYieldInfos)
	}

	const summary = {
		status: 'success',
		timestamp: payload.scheduledExecutionTime,
		chainsUpdated: allYieldInfos.length,
		yieldRates: allYieldInfos.map(info => ({
			chain: info.chainSelectorName,
			apy: `${Number(info.supplyRate) / 1e16}%`,
		})),
	}

	runtime.log('=== CrossYield CRE Cycle Complete ===')
	runtime.log(safeJsonStringify(summary))

	return safeJsonStringify(summary)
}

const initWorkflow = (config: Config) => {
	const cronTrigger = new CronCapability()

	return [
		handler(
			cronTrigger.trigger({
				schedule: config.schedule,
			}),
			onCronTrigger,
		),
	]
}

export async function main() {
	const runner = await Runner.newRunner<Config>({
		configSchema,
	})
	await runner.run(initWorkflow)
}