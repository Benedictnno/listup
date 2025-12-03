import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const VerifiedBadge = ({ size = 'sm', className = '' }: VerifiedBadgeProps) => {
    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 font-medium ${sizes[size]} ${className}`}
            title="Verified Seller"
        >
            <ShieldCheck className={iconSizes[size]} />
            Verified
        </span>
    );
};

export default VerifiedBadge;
