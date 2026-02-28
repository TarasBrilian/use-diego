import { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DataRowProps {
    label: string;
    value: string | number | React.ReactNode;
    className?: string;
    mono?: boolean;
}

export const DataRow = ({ label, value, className, mono = true }: DataRowProps) => {
    const [isFlashing, setIsFlashing] = useState(false);

    useEffect(() => {
        setIsFlashing(true);
        const timer = setTimeout(() => setIsFlashing(false), 600);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className={cn('flex justify-between items-center py-2 border-b border-white/5', className)}>
            <span className="text-xs text-secondary">{label}</span>
            <span
                className={cn(
                    'text-sm transition-colors duration-300',
                    mono ? 'font-mono' : 'font-sans',
                    isFlashing ? 'text-teal-400' : 'text-primary'
                )}
            >
                {value}
            </span>
        </div>
    );
};
