/**
 * Value object that represents an amount of money in a given currency.
 * It is immutable: every operation returns a new instance. It is used by the
 * cost ledger (expenses, total investment and breakeven price).
 *
 * @class Money
 */
export class Money {
    /**
     * @param {number} amount - Amount, it cannot be negative.
     * @param {string} [currency='PEN'] - ISO 4217 currency code.
     */
    constructor(amount, currency = 'PEN') {
        if (amount < 0) throw new Error('The amount cannot be negative.');
        this.amount = amount;
        this.currency = currency;
        Object.freeze(this);
    }

    /**
     * Adds another amount in the same currency.
     * @param {Money} other - Amount to add.
     * @returns {Money} A new amount with the sum.
     */
    add(other) {
        if (other.currency !== this.currency) throw new Error('Cannot add amounts in different currencies.');
        return new Money(this.amount + other.amount, this.currency);
    }

    /**
     * Multiplies the amount by a factor (for example, quantity × unit price).
     * @param {number} factor - Multiplier.
     * @returns {Money} A new amount with the product.
     */
    multiply(factor) {
        return new Money(this.amount * factor, this.currency);
    }

    /**
     * Formats the amount for display (for example, `S/ 14,850.00`).
     * @param {string} [locale='es-PE'] - Locale used to format the number.
     * @returns {string} Formatted amount.
     */
    format(locale = 'es-PE') {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: this.currency }).format(this.amount);
    }
}
