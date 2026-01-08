export const formatVES = (amountUSD: number, rate: number): string => {
    if (!rate || rate <= 0) return 'Bs. -';
    const amountVES = amountUSD * rate;

    return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'VES',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amountVES);
};
