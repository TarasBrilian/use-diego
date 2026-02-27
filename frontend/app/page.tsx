import { ConnectButton } from "@rainbow-me/rainbowkit";
import { VaultOverview } from "@/components/VaultOverview";
import { YieldTable } from "@/components/YieldTable";
import { AllocationChart } from "@/components/AllocationChart";
import { ActivityLog } from "@/components/ActivityLog";
import { DepositWithdraw } from "@/components/DepositWithdraw";
import { Shield, Zap, Globe, Cpu } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30">
      {/* Header */}
      <nav className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter leading-none">USE DIEGO</h1>
              <p className="text-[10px] font-bold text-blue-500 tracking-[0.2em] uppercase mt-1">Cross-Yield Optimizer</p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">

          {/* Left Column: Stats & Tables */}
          <div className="xl:col-span-8 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Global Overview</h2>
              </div>
              <VaultOverview />
            </section>

            <section>
              <YieldTable />
            </section>

            <section>
              <AllocationChart />
            </section>

            <section>
              <ActivityLog />
            </section>
          </div>

          {/* Right Column: Interaction & Info */}
          <div className="xl:col-span-4 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Operations</h2>
              </div>
              <DepositWithdraw />
            </section>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-6 h-6 text-blue-400" />
                <h3 className="font-bold uppercase tracking-wider text-sm">CRE Intelligence</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed italic">
                &quot;Our Chainlink Runtime Environment (CRE) continuously scans multiple L2s for yield discrepancies. When a &gt;2% delta is detected, a CCIP-backed rebalance is automatically triggered.&quot;
              </p>
              <div className="mt-4 flex gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</p>
                  <p className="text-sm font-bold text-emerald-400">+24.5%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uptime</p>
                  <p className="text-sm font-bold text-emerald-400">99.9%</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.5em]">Diego Protocol</p>
            <p className="text-xs text-slate-600 mt-2">© 2026 Powered by Chainlink. Built for Hackathon.</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest">Docs</a>
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest">GitHub</a>
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest">Governance</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
