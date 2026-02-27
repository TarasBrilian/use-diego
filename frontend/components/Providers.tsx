"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@rainbow-me/rainbowkit/styles.css";
import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme,
} from "@rainbow-me/rainbowkit";
import { createConfig, WagmiProvider, http } from "wagmi";
import { arbitrumSepolia, baseSepolia } from "wagmi/chains";

const config = createConfig({
    chains: [arbitrumSepolia, baseSepolia],
    transports: {
        [arbitrumSepolia.id]: http("https://arb-sepolia.g.alchemy.com/v2/czzNRTsjnAUcR9rlDQn3zCjhkd-IT8mo"),
        [baseSepolia.id]: http("https://base-sepolia.g.alchemy.com/v2/czzNRTsjnAUcR9rlDQn3zCjhkd-IT8mo"),
    },
});

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
