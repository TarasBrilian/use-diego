"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { YieldSpread } from "@/components/dashboard/YieldSpread";
import { VaultCard } from "@/components/dashboard/VaultCard";
import { AutomationStatus } from "@/components/dashboard/AutomationStatus";
import { CREStatus } from "@/components/dashboard/CREStatus";
import { TransactionHistory } from "@/components/dashboard/TransactionHistory";
import { DepositModal } from "@/components/modals/DepositModal";
import { WithdrawModal } from "@/components/modals/WithdrawModal";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'deposit' | 'withdraw' | null;
        chain: 'arbitrum' | 'base' | null;
    }>({
        isOpen: false,
        type: null,
        chain: null,
    });

    const openModal = (type: 'deposit' | 'withdraw', chain: 'arbitrum' | 'base') => {
        setModalState({ isOpen: true, type, chain });
    };

    const closeModal = () => {
        setModalState({ ...modalState, isOpen: false });
    };

    // Stagger variants for page load
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="flex min-h-screen bg-bg-base text-primary font-ui">
            <Sidebar />

            <div className="flex-1 ml-[240px]">
                <TopBar />

                <main className="pt-[56px] p-6">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col gap-6"
                    >
                        {/* Row 1: Hero Visualization */}
                        <motion.div variants={item}>
                            <YieldSpread />
                        </motion.div>

                        {/* Row 2: Vault Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={item}>
                                <VaultCard
                                    chain="arbitrum"
                                    onDeposit={() => openModal('deposit', 'arbitrum')}
                                    onWithdraw={() => openModal('withdraw', 'arbitrum')}
                                />
                            </motion.div>
                            <motion.div variants={item}>
                                <VaultCard
                                    chain="base"
                                    onDeposit={() => openModal('deposit', 'base')}
                                    onWithdraw={() => openModal('withdraw', 'base')}
                                />
                            </motion.div>
                        </div>

                        {/* Row 3: Operational Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={item}>
                                <AutomationStatus />
                            </motion.div>
                            <motion.div variants={item}>
                                <CREStatus />
                            </motion.div>
                        </div>

                        {/* Row 4: Transaction History */}
                        <motion.div variants={item}>
                            <TransactionHistory />
                        </motion.div>
                    </motion.div>
                </main>
            </div>

            {modalState.type === 'deposit' && modalState.chain && (
                <DepositModal
                    isOpen={modalState.isOpen}
                    onClose={closeModal}
                    chain={modalState.chain}
                />
            )}

            {modalState.type === 'withdraw' && modalState.chain && (
                <WithdrawModal
                    isOpen={modalState.isOpen}
                    onClose={closeModal}
                    chain={modalState.chain}
                />
            )}
        </div>
    );
}
