import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LiveDotProps {
    status?: 'active' | 'warning' | 'error' | 'inactive';
    className?: string;
}

export const LiveDot = ({ status = 'active', className }: LiveDotProps) => {
    const colors = {
        active: 'bg-teal-400',
        warning: 'bg-orange-400',
        error: 'bg-red-400',
        inactive: 'bg-slate-500',
    };

    return (
        <div className={cn('relative flex h-2 w-2', className)}>
            <span
                className={cn(
                    'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                    colors[status]
                )}
            ></span>
            <span className={cn('relative inline-flex rounded-full h-2 w-2', colors[status])}></span>
        </div>
    );
};
