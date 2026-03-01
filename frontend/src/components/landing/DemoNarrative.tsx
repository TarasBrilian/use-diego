"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Terminal, ArrowRight } from "lucide-react";

export function DemoNarrative() {
    return (
        <section className="py-32 bg-[#0A0B0E] relative overflow-hidden border-t border-white/[0.04] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            {/* Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[300px] bg-accent-teal/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(0,229,195,0.1)]">
                        <Terminal className="text-accent-teal" size={36} />
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 leading-[1.1]">
                        Watch the vault chase yield <br className="hidden md:block" />
                        in real time.
                    </h2>

                    <p className="text-lg md:text-xl text-text-secondary/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        Experience the automated infrastructure in action. Deposit mock USDC and observe the CRE engine orchestrate cross-chain rebalancing.
                    </p>

                    <Link
                        href="/app"
                        className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white/10 text-white font-bold text-lg transition-all border border-white/10 hover:border-accent-teal hover:bg-accent-teal hover:-translate-y-1 hover:[0_0_30px_rgba(0,229,195,0.4)] shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(0,229,195,0.4)] duration-300"
                    >
                        Enter App Dashboard
                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
