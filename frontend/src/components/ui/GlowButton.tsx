import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
}

export const GlowButton = ({ children, variant = 'primary', className, ...props }: GlowButtonProps) => {
    const variants = {
        primary: 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-[0_0_20px_rgba(0,229,195,0.2)] hover:shadow-[0_0_30px_rgba(0,229,195,0.4)]',
        secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-white/10',
        danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
    };

    return (
        <button
            className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
