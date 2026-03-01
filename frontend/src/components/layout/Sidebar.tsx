"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LayoutDashboard, Droplets, History, Settings, ExternalLink, Wallet } from 'lucide-react';
import Image from 'next/image';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Faucet', href: '/faucet', icon: Droplets },
    { name: 'Rebalance History', href: '/history', icon: History },
    { name: 'Portfolio', href: '/portfolio', icon: Wallet },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-[240px] bg-bg-surface border-r border-border flex flex-col z-50">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-accent-teal flex items-center justify-center text-bg-base font-bold text-xl">
                        <Image src="/assets/logo-use-diego1.png" alt="Logo" width={32} height={32} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-primary">UseDiego</span>
                </Link>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 group',
                                    isActive
                                        ? 'bg-accent-teal/10 text-accent-teal'
                                        : 'text-text-secondary hover:bg-white/5 hover:text-primary'
                                )}
                            >
                                <Icon className={cn('w-4 h-4', isActive ? 'text-accent-teal' : 'group-hover:text-primary')} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 space-y-4">
                <div className="p-4 rounded-lg bg-bg-elevated border border-border">
                    <div className="text-[10px] text-text-muted uppercase font-mono mb-2">Protocol Stats</div>
                    <div className="flex justify-between items-end">
                        <span className="text-xs text-text-secondary">Total TVL</span>
                        <span className="text-sm font-mono text-accent-teal">$1.24M</span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                    <span>v1.0.4-stable</span>
                    <Link href="https://github.com" className="hover:text-text-secondary flex items-center gap-1">
                        Docs <ExternalLink className="w-2 h-2" />
                    </Link>
                </div>
            </div>
        </aside >
    );
};
