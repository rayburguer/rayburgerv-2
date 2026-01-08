/**
 * Utilities for phone-to-email conversion
 * Allows Supabase email auth while showing only phones to users
 */

const EMAIL_DOMAIN = '@rayburger.local';

/**
 * Convert Venezuelan phone to internal email
 * Example: +584121234567 -> +584121234567@rayburger.local
 */
export const phoneToEmail = (phone: string): string => {
    return `${phone}${EMAIL_DOMAIN}`;
};

/**
 * Extract phone from internal email
 * Example: +584121234567@rayburger.local -> +584121234567
 */
export const emailToPhone = (email: string): string => {
    return email.replace(EMAIL_DOMAIN, '');
};

/**
 * Check if email is internal (generated from phone)
 */
export const isInternalEmail = (email: string): boolean => {
    return email.endsWith(EMAIL_DOMAIN);
};
