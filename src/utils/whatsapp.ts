import type { CartItem } from '../types';

export const generateWhatsAppMessage = (
    items: CartItem[],
    totalUSD: number,
    totalVES: number,
    customerName: string,
    deliveryMethod: string,
    address: string = ''
) => {
    let message = `*¡Hola RayBurger!* 🍔\n`;
    message += `Mi nombre es *${customerName}*.\n`;
    message += `Quiero pedir:\n\n`;

    items.forEach((item) => {
        message += `▪️ ${item.quantity}x *${item.name}*`;
        if (item.selectedVariant) message += ` (${item.selectedVariant})`;

        // Add extras details
        const extras = item.selectedExtras ? Object.keys(item.selectedExtras) : [];
        if (extras.length > 0) {
            message += `\n   + ${extras.join(', ')}`;
        }

        // Calculate item total line price
        const itemPrice = (Number(item.price) +
            (item.selectedVariant && item.customizations?.variants?.find(v => v.name === item.selectedVariant)?.price || 0) +
            Object.values(item.selectedExtras || {}).reduce((a, b) => a + b, 0)) * item.quantity;

        message += ` - $${itemPrice.toFixed(2)}\n`;
    });

    message += `\n*Total: $${totalUSD.toFixed(2)} (Bs. ${totalVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})*\n`;
    message += `\n*Entrega:* ${deliveryMethod}`;

    if (deliveryMethod === 'Delivery' && address) {
        message += `\n*Ubicación:* ${address}`;
    }

    return encodeURIComponent(message);
};

export const openWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
};
