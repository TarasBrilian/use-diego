"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";

export function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-[#0A0B0E]">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-[800px] h-[800px] bg-accent-teal/10 rounded-full blur-[120px] mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] mix-blend-screen"
                />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_30%,transparent_100%)] opacity-40 mix-blend-overlay" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-accent-teal text-xs font-mono mb-10 shadow-[0_0_20px_rgba(0,229,195,0.1)]"
                >
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-teal"></span>
                    </div>
                    <span>CRE Engine Operating Externally</span>
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-8 leading-[1.1]">
                    Cross-Chain Yield.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-emerald-400">Automated.</span>
                </h1>

                <p className="text-xl md:text-2xl text-text-secondary/80 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                    Deposit stablecoin once. CRE monitors yield across chains and automatically reallocates capital using Chainlink CCIP.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
                    <Link
                        href="/app"
                        className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/10 text-white font-bold text-lg transition-all border border-white/10 hover:border-accent-teal hover:bg-accent-teal hover:shadow-[0_0_20px_rgba(0,229,195,0.4)] hover:-translate-y-1 w-full sm:w-auto shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(0,229,195,0.4)] duration-300"
                    >
                        Launch App
                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <a
                        href="#how-it-works"
                        className="px-8 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-primary font-medium hover:bg-white/[0.08] transition-all hover:-translate-y-1 w-full sm:w-auto backdrop-blur-md"
                    >
                        Explore Architecture
                    </a>
                </div>
            </motion.div>
        </section>
    );
}

