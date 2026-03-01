"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export function LandingNav() {
    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-0 w-full z-50 border-b border-white/[0.04] bg-[#0A0B0E]/60 backdrop-blur-xl"
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-teal/20 to-transparent border border-accent-teal/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,195,0.15)]">
                        <span className="text-accent-teal font-bold font-mono text-sm leading-none pt-[1px]">UD</span>
                    </div>
                    <span className="text-primary font-medium tracking-wide">Use Diego</span>
                </div>
                <Link
                    href="/app"
                    className="px-6 py-2.5 rounded-full bg-white/10 text-white font-semibold hover:bg-accent-teal hover:border-accent-teal transition-all duration-300 border border-white/10 hover:border-accent-teal shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,229,195,0.4)] hover:-translate-y-0.5"
                >
                    Launch App
                </Link>
            </div>
        </motion.nav>
    );
}
