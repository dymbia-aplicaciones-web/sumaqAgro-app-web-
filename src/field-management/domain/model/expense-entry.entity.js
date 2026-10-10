/**
 * One expense of the cost ledger: inputs, labor or freight (US-37 to US-39).
 *
 * @class ExpenseEntry
 */
export class ExpenseEntry {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Expense identifier.
     * @param {?number} [params.ledgerId=null] - Cost ledger.
     * @param {string} params.category - Expense category.
     * @param {string} [params.description=''] - Input, task or route.
     * @param {number} params.quantity - Quantity (workers × days for labor).
     * @param {import('../../../shared/domain/model/money.js').Money} params.unitPrice - Unit price.
     * @param {Date} params.expenseDate - Date of the expense.
     * @param {string} [params.notes=''] - Notes.
     */
    constructor({ id = null, ledgerId = null, category, description = '', quantity, unitPrice, expenseDate,
                    notes = '' }) {
        if (quantity <= 0) throw new Error('The quantity must be greater than zero.');
        this.id = id;
        this.ledgerId = ledgerId;
        this.category = category;
        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.expenseDate = expenseDate;
        this.notes = notes;
    }

    /** @returns {import('../../../shared/domain/model/money.js').Money} Quantity × unit price. */
    total() {
        return this.unitPrice.multiply(this.quantity);
    }
}
