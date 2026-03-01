"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Zap, Coins } from "lucide-react";

export function ValueProp() {
    const props = [
        {
            title: "Deposit Once",
            desc: "Provide liquidity on your preferred chain. Diego handles the complex bridging and routing.",
            icon: <Coins size={20} className="text-accent-teal" />
        },
        {
            title: "Automated Rebalancing",
            desc: "Never manually chase yield again. The vault migrates funds the moment a better sustained APY appears.",
            icon: <Zap size={20} className="text-emerald-400" />
        },
        {
            title: "Net-Yield Aware",
            desc: "CRE calculates CCIP bridging costs, slippage, and gas to ensure migrations are strictly profitable.",
            icon: <CheckCircle2 size={20} className="text-accent-orange" />
        },
        {
            title: "Chainlink Native",
            desc: "Secured by the industry standard. Utilizing CCIP for routing and Automation for triggers.",
            icon: <ShieldCheck size={20} className="text-blue-400" />
        }
    ];

    return (
        <section className="py-32 bg-[#0A0B0E] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(0,229,195,0.03),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(0,229,195,0.03),transparent_50%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="max-w-xl"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-[1.1] mb-8">
                            Maximize capital efficiency <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-emerald-400">without the operational overhead.</span>
                        </h2>
                        <p className="text-lg text-text-secondary/80 leading-relaxed font-light mb-8">
                            Cross-chain yield farming traditionally requires constant monitoring, vulnerable bridging, and manual execution. Use Diego abstracts this entire lifecycle into a single, automated vault.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                    >
                        {props.map((prop, idx) => (
                            <div key={idx} className="group relative bg-white/[0.02] p-8 rounded-2xl border border-white/[0.06] backdrop-blur-md overflow-hidden hover:bg-white/[0.04] transition-colors duration-300">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    {prop.icon}
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                                    {prop.icon}
                                </div>
                                <h4 className="text-primary font-bold mb-3 text-lg">{prop.title}</h4>
                                <p className="text-text-secondary/80 text-sm font-light leading-relaxed">{prop.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
