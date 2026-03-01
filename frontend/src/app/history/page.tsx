"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LandingRebalanceHistory } from "@/components/landing/LandingRebalanceHistory";

export default function HistoryPage() {
    return (
        <div className="flex min-h-screen bg-[#0A0B0E]">
            <Sidebar />
            <div className="flex-1 ml-[240px]">
                <TopBar />
                <main className="pt-[56px]">
                    <LandingRebalanceHistory />
                </main>
            </div>
        </div>
    );
}
