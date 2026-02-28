"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { arbitrumSepolia, baseSepolia } from "@/lib/chains";
import "@rainbow-me/rainbowkit/styles.css";

const config = createConfig({
    chains: [arbitrumSepolia, baseSepolia],
    transports: {
        [arbitrumSepolia.id]: http(),
        [baseSepolia.id]: http(),
    },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#00E5C3',
                        accentColorForeground: '#0A0B0E',
                        borderRadius: 'small',
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
