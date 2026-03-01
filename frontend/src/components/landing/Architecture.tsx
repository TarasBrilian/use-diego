"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Network, LockKeyhole, Cpu } from "lucide-react";

export function Architecture() {
    const cards = [
        {
            title: "Intelligence Layer",
            desc: "Custom Runtime Engine computing yield paths considering bridge costs, slippage, and APY durability.",
            icon: <Cpu className="text-accent-teal mb-4" size={28} />,
            delay: 0.1
        },
        {
            title: "Trigger Layer",
            desc: "Chainlink Automation listening for verifiable signals to orchestrate the rebalancing pipeline.",
            icon: <Network className="text-emerald-400 mb-4" size={28} />,
            delay: 0.2
        },
        {
            title: "Execution Layer",
            desc: "VaultManager coordinating natively burned shares and Chainlink CCIP cross-chain messaging.",
            icon: <LockKeyhole className="text-accent-orange mb-4" size={28} />,
            delay: 0.3
        },
        {
            title: "Yield Oracle",
            desc: "Decentralized consensus fetching real-time money market rates to ensure profitable reallocations.",
            icon: <ShieldAlert className="text-blue-400 mb-4" size={28} />,
            delay: 0.4
        }
    ];

    return (
        <section className="py-32 bg-[#0A0B0E] relative overflow-hidden text-center z-10 border-t border-white/[0.04] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-teal/20 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-accent-teal/[0.03] to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-4">Core Architecture</h2>
                    <p className="text-text-secondary/80 text-lg max-w-2xl font-light">Immutable infrastructure designed for cross-environment trust and automated yield optimization.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: card.delay, duration: 0.5 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md overflow-hidden text-left flex flex-col items-start"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10">
                                {card.icon}
                                <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent-teal transition-colors">{card.title}</h3>
                                <p className="text-text-secondary/80 text-sm leading-relaxed font-light">{card.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
