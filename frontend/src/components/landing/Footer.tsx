export function Footer() {
    return (
        <footer className="bg-[#0A0B0E] py-12 relative">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center gap-3 mb-4 md:mb-0 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-teal/20 to-transparent border border-accent-teal/30 flex items-center justify-center">
                        <span className="text-accent-teal font-bold font-mono text-xs">UD</span>
                    </div>
                    <span className="text-primary font-medium tracking-wide text-sm">Use Diego</span>
                </div>

                <div className="text-xs text-text-secondary/60 font-mono tracking-wider">
                    BUILT FOR CROSS-CHAIN YIELD // SECURED BY CHAINLINK
                </div>
            </div>
        </footer>
    );
}
