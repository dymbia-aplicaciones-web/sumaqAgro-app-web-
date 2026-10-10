/**
 * Application service store for the Profiles bounded context (Angular `ProfilesStore`):
 * farmer profile, cooperative, members, technical advisors and the institutional dashboard.
 *
 * @module useProfilesStore
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ProfilesApi} from "../infrastructure/profiles-api.js";
import {FarmerProfileAssembler} from "../infrastructure/farmer-profile.assembler.js";
import {CooperativeAssembler} from "../infrastructure/cooperative.assembler.js";
import {CooperativeMemberAssembler} from "../infrastructure/cooperative-member.assembler.js";
import {CooperativeDashboardAssembler} from "../infrastructure/cooperative-dashboard.assembler.js";
import {TechnicalAdvisorAssembler} from "../infrastructure/technical-advisor.assembler.js";
import {TechnicalAdvisor} from "../domain/model/technical-advisor.entity.js";

const profilesApi = new ProfilesApi();

/**
 * Reactive store that exposes Profiles commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useProfilesStore = defineStore('profiles', () => {
    /** @type {import('vue').Ref<import('../domain/model/farmer-profile.entity.js').FarmerProfile|null>} */
    const profile = ref(null);
    /** @type {import('vue').Ref<import('../domain/model/cooperative.entity.js').Cooperative|null>} */
    const cooperative = ref(null);
    /** @type {import('vue').Ref<import('../domain/model/cooperative-member.entity.js').CooperativeMember[]>} */
    const members = ref([]);
    /** @type {import('vue').Ref<TechnicalAdvisor[]>} */
    const technicalAdvisors = ref([]);
    /** @type {import('vue').Ref<import('../domain/model/cooperative-dashboard.entity.js').CooperativeDashboard|null>} */
    const dashboard = ref(null);
    const loading = ref(false);
    const saving = ref(false);
    /** @type {import('vue').Ref<string|null>} Message of the last error. */
    const error = ref(null);
    /** Number of active members of the cooperative. */
    const activeMemberCount = computed(() => members.value.filter(member => member.active).length);

    function fail(cause) {
        console.error(cause);
        error.value = cause.message;
    }

    /**
     * Loads the contact data of a farmer.
     * @param {number} userId - Farmer.
     */
    function loadFarmerProfile(userId) {
        loading.value = true;
        error.value = null;
        profilesApi.getFarmerProfilesByUser(userId)
            .then(response => {
                const [first] = FarmerProfileAssembler.toEntitiesFromResponse(response);
                if (!first) throw new Error('Farmer profile not found.');
                profile.value = first;
            })
            .catch(fail)
            .finally(() => loading.value = false);
    }

    /**
     * Saves the phone and email of the farmer.
     * @param {{phoneNumber: string, email: string}} command - New contact data.
     * @returns {Promise<boolean>} `true` when saved.
     */
    function saveContact(command) {
        if (!profile.value) return Promise.resolve(false);
        const copy = profile.value.clone();
        try {
            copy.updateContact(command.phoneNumber, command.email);
        } catch (cause) {
            fail(cause);
            return Promise.resolve(false);
        }
        saving.value = true;
        error.value = null;
        return profilesApi.updateFarmerProfile(FarmerProfileAssembler.toResourceFromEntity(copy))
            .then(response => {
                profile.value = FarmerProfileAssembler.toEntityFromResource(response.data);
                return true;
            })
            .catch(cause => { fail(cause); return false; })
            .finally(() => saving.value = false);
    }

    /**
     * Loads the institutional indicators of the director's cooperative.
     * @param {number} directorUserId - Director.
     */
    function loadCooperativeDashboard(directorUserId) {
        loading.value = true;
        error.value = null;
        profilesApi.getDashboardsByDirector(directorUserId)
            .then(response => dashboard.value = CooperativeDashboardAssembler.toEntitiesFromResponse(response)[0] ?? null)
            .catch(fail)
            .finally(() => loading.value = false);
    }

    /**
     * Loads the cooperative of the director with its members and technical advisors.
     * @param {number} directorUserId - Director.
     */
    function loadInstitutionalData(directorUserId) {
        loading.value = true;
        error.value = null;
        profilesApi.getCooperativesByDirector(directorUserId)
            .then(response => {
                cooperative.value = CooperativeAssembler.toEntitiesFromResponse(response)[0] ?? null;
                if (!cooperative.value) return [null, null];
                return Promise.all([
                    profilesApi.getMembersByCooperative(cooperative.value.id),
                    profilesApi.getAdvisorsByCooperative(cooperative.value.id)
                ]);
            })
            .then(([membersResponse, advisorsResponse]) => {
                members.value = membersResponse ? CooperativeMemberAssembler.toEntitiesFromResponse(membersResponse) : [];
                technicalAdvisors.value = advisorsResponse ? TechnicalAdvisorAssembler.toEntitiesFromResponse(advisorsResponse) : [];
            })
            .catch(fail)
            .finally(() => loading.value = false);
    }

    /**
     * Saves the institutional data of the cooperative.
     * @param {Object} command - Legal name, RUC, region, address, email, phone and representative.
     * @returns {Promise<boolean>} `true` when saved.
     */
    function saveCooperative(command) {
        if (!cooperative.value) return Promise.resolve(false);
        const copy = cooperative.value.clone();
        try {
            copy.updateInstitutionalData(command);
        } catch (cause) {
            fail(cause);
            return Promise.resolve(false);
        }
        saving.value = true;
        error.value = null;
        return profilesApi.updateCooperative(CooperativeAssembler.toResourceFromEntity(copy))
            .then(response => {
                cooperative.value = CooperativeAssembler.toEntityFromResource(response.data);
                return true;
            })
            .catch(cause => { fail(cause); return false; })
            .finally(() => saving.value = false);
    }

    /**
     * Invites a new technical advisor to the cooperative.
     * @param {{name: string, cipCode: string, phone: string, assignedPlotsCount: number}} command - Advisor data.
     */
    function inviteTechnicalAdvisor(command) {
        const advisor = new TechnicalAdvisor({ cooperativeId: cooperative.value?.id ?? 1 });
        try {
            advisor.updateDetails(command);
        } catch (cause) {
            fail(cause);
            return;
        }
        saving.value = true;
        error.value = null;
        profilesApi.createAdvisor(TechnicalAdvisorAssembler.toResourceFromEntity(advisor))
            .then(response => technicalAdvisors.value.push(TechnicalAdvisorAssembler.toEntityFromResource(response.data)))
            .catch(fail)
            .finally(() => saving.value = false);
    }

    /**
     * Reassigns plots or edits the data of an advisor.
     * @param {TechnicalAdvisor} advisor - Advisor to change.
     * @param {{name: string, cipCode: string, phone: string, assignedPlotsCount: number}} command - New data.
     */
    function reassignTechnicalAdvisor(advisor, command) {
        const copy = advisor.clone();
        try {
            copy.updateDetails(command);
        } catch (cause) {
            fail(cause);
            return;
        }
        saving.value = true;
        error.value = null;
        profilesApi.updateAdvisor(TechnicalAdvisorAssembler.toResourceFromEntity(copy))
            .then(response => {
                const updated = TechnicalAdvisorAssembler.toEntityFromResource(response.data);
                const index = technicalAdvisors.value.findIndex(item => item.id === updated.id);
                if (index !== -1) technicalAdvisors.value[index] = updated;
            })
            .catch(fail)
            .finally(() => saving.value = false);
    }

    /**
     * Removes an advisor from the technical team.
     * @param {number} id - Advisor identifier.
     */
    function removeTechnicalAdvisor(id) {
        saving.value = true;
        error.value = null;
        profilesApi.deleteAdvisor(id)
            .then(() => technicalAdvisors.value = technicalAdvisors.value.filter(item => item.id !== id))
            .catch(fail)
            .finally(() => saving.value = false);
    }

    return {
        profile,
        cooperative,
        members,
        technicalAdvisors,
        dashboard,
        loading,
        saving,
        error,
        activeMemberCount,
        loadFarmerProfile,
        saveContact,
        loadCooperativeDashboard,
        loadInstitutionalData,
        saveCooperative,
        inviteTechnicalAdvisor,
        reassignTechnicalAdvisor,
        removeTechnicalAdvisor
    };
});

export default useProfilesStore;
