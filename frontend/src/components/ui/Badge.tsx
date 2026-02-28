import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'active' | 'paused' | 'rebalancing' | 'stale';
    className?: string;
}

export const Badge = ({ children, variant = 'active', className }: BadgeProps) => {
    const variants = {
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        paused: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        rebalancing: 'bg-teal-500/10 text-teal-400 border-teal-500/20 animate-pulse',
        stale: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };

    return (
        <span
            className={cn(
                'px-2 py-0.5 rounded-full text-[10px] uppercase font-mono border tracking-wider',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
};
