import {CampaignLedger} from "../domain/model/campaign-ledger.entity.js";
import {ExpenseEntry} from "../domain/model/expense-entry.entity.js";
import {Money} from "../../shared/domain/model/money.js";
import {fromApiDate, resourcesFromResponse, toApiDate} from "../../shared/infrastructure/base-assembler.js";

/**
 * Maps cost ledger resources (with their expense entries) into domain entities and back.
 *
 * @class CampaignLedgerAssembler
 */
export class CampaignLedgerAssembler {
    /**
     * @param {Object} resource - Ledger resource.
     * @returns {CampaignLedger} Ledger entity.
     */
    static toEntityFromResource(resource) {
        const id = Number(resource.id);
        return new CampaignLedger({
            ...resource,
            id,
            frozen: resource.frozen ?? false,
            entries: (resource.entries ?? []).map(entry => new ExpenseEntry({
                ...entry,
                id: Number(entry.id),
                ledgerId: id,
                unitPrice: new Money(entry.unitPrice),
                expenseDate: fromApiDate(entry.expenseDate)
            }))
        });
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with ledger resources.
     * @returns {CampaignLedger[]} Ledger entities.
     */
    static toEntitiesFromResponse(response) {
        return resourcesFromResponse(response, 'ledgers').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {CampaignLedger} entity - Ledger entity.
     * @returns {Object} Ledger resource.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            campaignId: entity.campaignId,
            expectedYield: entity.expectedYield,
            actualYield: entity.actualYield,
            yieldUnit: entity.yieldUnit,
            frozen: entity.isFrozen(),
            entries: entity.entries.map(entry => ({
                id: entry.id,
                category: entry.category,
                description: entry.description,
                quantity: entry.quantity,
                unitPrice: entry.unitPrice.amount,
                expenseDate: toApiDate(entry.expenseDate),
                notes: entry.notes
            }))
        };
    }
}
