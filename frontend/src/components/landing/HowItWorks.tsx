"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Zap, ArrowRightLeft } from "lucide-react";

export function HowItWorks() {
    const steps = [
        {
            icon: <BrainCircuit size={28} className="text-accent-teal" />,
            title: "Compute",
            desc: "CRE monitors cross-chain lending markets and computes net yield."
        },
        {
            icon: <Zap size={28} className="text-emerald-400" />,
            title: "Trigger",
            desc: "Chainlink Automation securely orchestrates the rebalance logic."
        },
        {
            icon: <ArrowRightLeft size={28} className="text-blue-400" />,
            title: "Rebalance",
            desc: "VaultManager uses CCIP to bridge and deposit into higher-yields."
        }
    ];

    return (
        <section id="how-it-works" className="py-32 bg-[#0A0B0E] relative">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6"
                    >
                        How It Works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-text-secondary/80 text-lg max-w-2xl mx-auto font-light"
                    >
                        A modular, institutional-grade pipeline utilizing Chainlink infrastructure to chase the highest stablecoin yield.
                    </motion.p>
                </div>

                <div className="relative">
                    {/* Horizontal Connector Line for Desktop */}
                    <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-white/0 via-white/10 to-white/0" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="relative flex flex-col items-center text-center group"
                            >
                                <div className="w-24 h-24 rounded-full bg-[#0A0B0E] flex items-center justify-center mb-8 relative border border-white/[0.08] shadow-[0_0_30px_rgba(255,255,255,0.02)] group-hover:border-accent-teal/30 group-hover:shadow-[0_0_40px_rgba(0,229,195,0.1)] transition-all duration-500">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
                                    {step.icon}
                                    {/* Number Badge */}
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0A0B0E] border border-white/10 flex items-center justify-center text-sm font-mono text-white/50">
                                        0{idx + 1}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-primary mb-4">{step.title}</h3>
                                <p className="text-text-secondary/80 leading-relaxed font-light px-4">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
