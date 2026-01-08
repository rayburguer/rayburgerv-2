import type { InputHTMLAttributes } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function PhoneInput({ value, onChange, error, ...props }: PhoneInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove all non-digits
        const digits = e.target.value.replace(/\D/g, '');

        // Remove leading zero if present
        const withoutZero = digits.startsWith('0') ? digits.slice(1) : digits;

        // Limit to 10 digits
        const limited = withoutZero.slice(0, 10);

        // Format as +58XXXXXXXXXX
        const formatted = limited ? `+58${limited}` : '';

        onChange(formatted);
    };

    // Display value without +58 prefix for user input
    const displayValue = value.startsWith('+58') ? value.slice(3) : value;

    return (
        <div className="space-y-1">
            <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
                    +58
                </div>
                <input
                    {...props}
                    type="tel"
                    value={displayValue}
                    onChange={handleChange}
                    className={`w-full bg-black/40 border ${error ? 'border-red-500' : 'border-white/10'
                        } rounded-xl py-3 pl-20 pr-4 text-white focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-all font-mono`}
                    placeholder="4121234567"
                />
            </div>
            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
        </div>
    );
}

export const validateVenezuelanPhone = (phone: string): boolean => {
    const regex = /^\+58\d{10}$/;
    return regex.test(phone);
};
