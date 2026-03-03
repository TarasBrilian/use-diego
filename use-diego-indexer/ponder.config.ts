import { createConfig } from "ponder";

import { VaultManagerAbi } from "./abis/VaultManagerAbi";

export default createConfig({
  chains: {
    baseSepolia: {
      id: 84532,
      rpc: process.env.PONDER_RPC_URL_84532!,
      ethGetLogsBlockRange: 500
    },
    arbitrumSepolia: {
      id: 421614,
      rpc: process.env.PONDER_RPC_URL_421614!,
      ethGetLogsBlockRange: 500
    },
  },
  contracts: {
    VaultManagerBase: {
      chain: "baseSepolia",
      abi: VaultManagerAbi,
      address: "0x5aAe96534Aa5f481A1B92eC8dD48f7A5423b13C4",
      startBlock: 38316695,
    },
    VaultManagerArb: {
      chain: "arbitrumSepolia",
      abi: VaultManagerAbi,
      address: "0xA1DE025b706687b9A4ec40A3958aa5dC60BF1B66",
      startBlock: 246234917,
    },
  }
});
