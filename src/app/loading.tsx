import BurgerSpinner from "@/components/BurgerSpinner";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
            <BurgerSpinner size="xl" />
            <p className="text-amber-500 font-bold mt-4 animate-pulse">Cocinando...</p>
        </div>
    )
}
