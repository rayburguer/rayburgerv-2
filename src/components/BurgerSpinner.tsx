'use client'

export default function BurgerSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    }

    return (
        <div className={`relative ${sizeClasses[size]} animate-spin-burger`}>
            {/* SVG simple de una hamburguesa */}
            <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
                {/* Top Bun */}
                <path d="M448 224C448 153.298 390.702 96 320 96H192C121.298 96 64 153.298 64 224H448Z" fill="#F59E0B" />
                <path d="M448 224H64V240C64 248.837 71.1634 256 80 256H432C440.837 256 448 248.837 448 240V224Z" fill="#D97706" />

                {/* Lettuce */}
                <path d="M64 256H448V272C448 280.837 440.837 288 432 288H80C71.1634 288 64 280.837 64 272V256Z" fill="#22C55E" />

                {/* Meat */}
                <path d="M64 288H448V320C448 328.837 440.837 336 432 336H80C71.1634 336 64 328.837 64 320V288Z" fill="#78350F" />

                {/* Cheese */}
                <path d="M64 336H448V352C448 360.837 440.837 368 432 368H80C71.1634 368 64 360.837 64 352V336Z" fill="#FCD34D" />

                {/* Bottom Bun */}
                <path d="M64 368H448V384C448 401.673 433.673 416 416 416H96C78.327 416 64 401.673 64 384V368Z" fill="#F59E0B" />

                {/* Seeds */}
                <circle cx="150" cy="150" r="8" fill="#FDE68A" />
                <circle cx="220" cy="130" r="8" fill="#FDE68A" />
                <circle cx="300" cy="140" r="8" fill="#FDE68A" />
                <circle cx="370" cy="160" r="8" fill="#FDE68A" />
            </svg>
        </div>
    )
}
