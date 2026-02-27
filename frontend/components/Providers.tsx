"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@rainbow-me/rainbowkit/styles.css";
import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http, Config } from "wagmi";
import { arbitrumSepolia, baseSepolia } from "wagmi/chains";

const chains = [arbitrumSepolia, baseSepolia] as const;

const config = getDefaultConfig({
    appName: 'Diego Vault',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
    chains,
    transports: {
        [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL!),
        [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL!),
    },
    ssr: true,
}) as Config;

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
