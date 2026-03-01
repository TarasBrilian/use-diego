"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { PortfolioDashboard } from "@/components/dashboard/PortfolioDashboard";

export default function PortfolioPage() {
    return (
        <div className="flex min-h-screen bg-bg-base text-primary font-ui">
            <Sidebar />

            <div className="flex-1 ml-[240px]">
                <TopBar />

                <main className="pt-[56px] p-6">
                    <PortfolioDashboard />
                </main>
            </div>
        </div>
    );
}
