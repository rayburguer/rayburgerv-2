import { useState, useRef, useEffect } from 'react';
import { Trophy, Star } from 'lucide-react';

interface ScratchCardProps {
    onReveal: (code: string) => void;
}

export function ScratchCard({ onReveal }: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [rewardCode, setRewardCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Pre-fetch a reward
        fetchReward();
    }, []);

    const fetchReward = async () => {
        try {
            // Logic to get a random unredeemed reward or generate one
            // For now, we simulate a code. In backend we would pick one from 'rewards' table.
            // Using a simple deterministic one for demo or 10% chance of winning
            const won = Math.random() > 0.7; // 30% chance
            if (won) {
                // In real implementation, this would be an RPC call to claim a reward securely
                setRewardCode('BURGER-PROMO-2026');
            } else {
                setRewardCode('SUERTE-PROXIMA');
            }
        } catch (e) {
            console.error(e);
            setRewardCode('ERROR-TRY-AGAIN');
        } finally {
            setLoading(false);
            initCanvas();
        }
    };

    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill with silver scratch layer
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add text "RASPA AQUÍ"
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#808080';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('RASPA AQUÍ', canvas.width / 2, canvas.height / 2);

        // Add scratching logic
        let isDrawing = false;

        const getMousePos = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const scratch = (x: number, y: number) => {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();
            checkRevealProgress();
        };

        const checkRevealProgress = () => {
            // Simple check of how many pixels are transparent
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparent = 0;
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) transparent++;
            }

            if (transparent > (pixels.length / 4) * 0.5 && !isRevealed) {
                // 50% revealed
                setIsRevealed(true);
                if (rewardCode) onReveal(rewardCode);
            }
        };

        canvas.addEventListener('mousedown', () => isDrawing = true);
        canvas.addEventListener('touchstart', () => isDrawing = true);

        window.addEventListener('mouseup', () => isDrawing = false);
        window.addEventListener('touchend', () => isDrawing = false);

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const { x, y } = getMousePos(e);
            scratch(x, y);
        });

        canvas.addEventListener('touchmove', (e) => {
            if (!isDrawing) return;
            e.preventDefault(); // Prevent scrolling
            const { x, y } = getMousePos(e);
            scratch(x, y);
        }, { passive: false });
    };

    if (loading) return null;

    return (
        <div className="relative w-64 h-32 rounded-xl overflow-hidden shadow-xl mx-auto my-6 select-none">
            {/* Underlying Reward */}
            <div className={`absolute inset-0 bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-col p-4 text-center ${isRevealed ? 'animate-pulse' : ''}`}>
                {rewardCode === 'SUERTE-PROXIMA' ? (
                    <>
                        <Star className="text-white mb-1" />
                        <span className="font-bold text-white text-lg">¡Intenta de nuevo!</span>
                        <span className="text-white/80 text-xs">Gracias por tu compra</span>
                    </>
                ) : (
                    <>
                        <Trophy className="text-white mb-1" />
                        <span className="font-black text-white text-xl">{rewardCode}</span>
                        <span className="text-white/80 text-xs">¡Premio Ganado!</span>
                    </>
                )}
            </div>

            {/* Scratch Layer */}
            <canvas
                ref={canvasRef}
                width={256}
                height={128}
                className={`absolute inset-0 cursor-crosshair transition-opacity duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            />
        </div>
    );
}
