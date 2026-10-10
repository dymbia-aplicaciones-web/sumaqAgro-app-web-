/**
 * Formatting helpers of the views (Angular `DecimalPipe`, `DatePipe`, `CurrencyPipe`).
 */

/**
 * @param {string} locale - App locale (`es` or `en`).
 * @returns {string} Intl locale.
 */
export const intlLocale = (locale) => locale === 'en' ? 'en-US' : 'es-PE';

/**
 * Formats a number with a range of decimals (Angular `number: '1.min-max'`).
 * @param {number} value - Number to format.
 * @param {string} locale - App locale.
 * @param {number} [maximumFractionDigits=2] - Maximum decimals.
 * @param {number} [minimumFractionDigits=0] - Minimum decimals.
 * @returns {string} Formatted number.
 */
export function formatNumber(value, locale, maximumFractionDigits = 2, minimumFractionDigits = 0) {
    return new Intl.NumberFormat(intlLocale(locale), { minimumFractionDigits, maximumFractionDigits }).format(value ?? 0);
}

/**
 * Formats a date (`YYYY-MM-DD`, ISO text or `Date`).
 * @param {string|Date} value - Date to format.
 * @param {string} locale - App locale.
 * @param {Intl.DateTimeFormatOptions} [options] - Format options.
 * @returns {string} Formatted date.
 */
export function formatDate(value, locale, options = { dateStyle: 'medium' }) {
    if (!value) return '';
    const date = value instanceof Date ? value
        : /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(intlLocale(locale), options).format(date);
}

/**
 * Formats an amount in Peruvian soles.
 * @param {number} value - Amount.
 * @returns {string} Formatted amount.
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value ?? 0);
}
