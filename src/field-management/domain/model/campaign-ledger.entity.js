import {Money} from "../../../shared/domain/model/money.js";
import {CropType, ExpenseCategory, YieldUnit} from "./field-management.enums.js";
import {ExpenseEntry} from "./expense-entry.entity.js";

/**
 * Cost ledger of a campaign: expenses, total investment, breakeven and
 * suggested price (US-16 to US-19, US-37 to US-40).
 *
 * @class CampaignLedger
 */
export class CampaignLedger {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Ledger identifier.
     * @param {?number} [params.campaignId=null] - Campaign of the ledger.
     * @param {ExpenseEntry[]} [params.entries=[]] - Expenses.
     * @param {number} [params.expectedYield=0] - Expected harvest.
     * @param {?number} [params.actualYield=null] - Actual harvest.
     * @param {string} [params.yieldUnit=YieldUnit.SACK] - Unit of the harvest.
     * @param {boolean} [params.frozen=false] - `true` when the campaign was closed.
     * @param {string} [params.currency='PEN'] - Currency.
     */
    constructor({ id = null, campaignId = null, entries = [], expectedYield = 0, actualYield = null,
                    yieldUnit = YieldUnit.SACK, frozen = false, currency = 'PEN' }) {
        this.id = id;
        this.campaignId = campaignId;
        this.entries = [...entries].sort((a, b) => b.expenseDate.getTime() - a.expenseDate.getTime());
        this.expectedYield = expectedYield;
        this.actualYield = actualYield;
        this.yieldUnit = yieldUnit;
        this.frozen = frozen;
        this.currency = currency;
    }

    /** @returns {boolean} `true` when the campaign was closed and the ledger cannot change. */
    isFrozen() {
        return this.frozen;
    }

    /** @returns {Money} Sum of all expenses. */
    totalInvestment() {
        return this.entries.reduce((sum, entry) => sum.add(entry.total()), new Money(0, this.currency));
    }

    /**
     * @param {string} category - Expense category.
     * @returns {Money} Sum of the expenses of the category.
     */
    totalByCategory(category) {
        return this.entries.filter(entry => entry.category === category)
            .reduce((sum, entry) => sum.add(entry.total()), new Money(0, this.currency));
    }

    /**
     * @param {string} category - Expense category.
     * @returns {number} Share of the category in the total investment (0–100).
     */
    percentageByCategory(category) {
        const total = this.totalInvestment().amount;
        return total === 0 ? 0 : (this.totalByCategory(category).amount / total) * 100;
    }

    /** @returns {Money} Total investment divided by the actual yield, or by the expected one. */
    breakevenPrice() {
        const yieldQuantity = this.actualYield ?? this.expectedYield;
        if (yieldQuantity <= 0) return new Money(0, this.currency);
        return this.totalInvestment().multiply(1 / yieldQuantity);
    }

    /**
     * @param {number} [marginPercentage=0] - Profit margin.
     * @returns {Money} Breakeven plus the margin, rounded up to whole soles.
     */
    suggestedPrice(marginPercentage = 0) {
        const price = this.breakevenPrice().amount * (1 + marginPercentage / 100);
        return new Money(Math.ceil(price), this.currency);
    }

    /**
     * Records an input expense: product, quantity and unit price (US-37).
     * @param {{inputName: string, quantity: number, unitPrice: number, expenseDate: Date}} command - Expense data.
     */
    recordInputExpense(command) {
        this.#addEntry(ExpenseCategory.INPUTS, command.inputName, command.quantity, command.unitPrice, command.expenseDate);
    }

    /**
     * Records a labor expense: task, workers, days and daily wage (US-38).
     * @param {{activity: string, workers: number, days: number, dailyWage: number, expenseDate: Date}} command - Expense data.
     */
    recordDailyLaborExpense(command) {
        this.#addEntry(ExpenseCategory.LABOR, command.activity, command.workers * command.days, command.dailyWage, command.expenseDate);
    }

    /**
     * Records a freight expense: route and cost (US-39).
     * @param {{route: string, cost: number, expenseDate: Date}} command - Expense data.
     */
    recordFieldFreightExpense(command) {
        this.#addEntry(ExpenseCategory.FREIGHT, command.route, 1, command.cost, command.expenseDate);
    }

    /**
     * Changes the expected yield, which updates the breakeven price (US-40).
     * @param {number} expectedYield - Expected harvest.
     * @param {string} unit - Unit of the harvest.
     * @throws {Error} When the ledger is closed or the yield is not positive.
     */
    setExpectedYield(expectedYield, unit) {
        if (this.frozen) throw new Error('The cost ledger is closed.');
        if (expectedYield <= 0) throw new Error('The expected yield must be greater than zero.');
        this.expectedYield = expectedYield;
        this.yieldUnit = unit;
    }

    /** @returns {CampaignLedger} Copy used to try a change; the shown ledger only changes when the API confirms. */
    clone() {
        return new CampaignLedger({...this});
    }

    /**
     * Coffee is sold by quintal; potato by sack.
     * @param {string} cropType - Crop.
     * @returns {string} Yield unit.
     */
    static yieldUnitOf(cropType) {
        return cropType === CropType.SPECIALTY_COFFEE ? YieldUnit.QUINTAL : YieldUnit.SACK;
    }

    #addEntry(category, description, quantity, unitPrice, expenseDate) {
        if (this.frozen) throw new Error('The cost ledger is closed.');
        const nextId = Math.max(0, ...this.entries.map(entry => entry.id)) + 1;
        this.entries = [...this.entries, new ExpenseEntry({
            id: nextId, ledgerId: this.id, category, description: description.trim(), quantity,
            unitPrice: new Money(unitPrice, this.currency), expenseDate
        })].sort((a, b) => b.expenseDate.getTime() - a.expenseDate.getTime());
    }
}
