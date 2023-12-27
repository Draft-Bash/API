import { IDraftsRepository } from "./contracts/IDraftsRepository";
import { IDraftsService } from "./contracts/IDraftsService";
import { Draft } from "./contracts/dataTypes/Draft";
import { DraftOrderFactory } from "../../utils/draft/draftOrder/DraftOrderFactory";
import { IDraftInviteEmailer } from "../../utils/email/IDraftInviteEmailer";
import { DraftInvite } from "./contracts/dataTypes/DraftInvite";
import { UpsertDraftRequest } from "./contracts/controllerRequests/UpsertDraftRequest";

export class DraftsService implements IDraftsService {

    private readonly _draftsRepository: IDraftsRepository;
    private readonly _draftOrderFactory: DraftOrderFactory;
    private readonly _draftInviteEmailer: IDraftInviteEmailer;

    constructor(userRepository: IDraftsRepository, draftInviteEmailer: IDraftInviteEmailer) {
        this._draftsRepository = userRepository;
        this._draftOrderFactory = new DraftOrderFactory();
        this._draftInviteEmailer = draftInviteEmailer;
    }

    async deleteDraftById(draftId: number): Promise<void> {
        await this._draftsRepository.deleteDraftById(draftId);
    }

    async getDraftById(draft_id: number): Promise<Draft> {
        const draft: Draft | null = await this._draftsRepository.getDraftById(draft_id);
        if (draft === null) {
            throw new Error('DraftNotFoundError');
        }
        return draft;
    }

    async getDraftsByUserId(user_id: number): Promise<Draft[]> {
        const drafts: Draft[] = await this._draftsRepository.getDraftsByUserId(user_id);
        return drafts;
    }

    async updateDraft(updateDraftRequest: UpsertDraftRequest, updated_draft_id: number): Promise<number> {

         const teamSize: number = (
            updateDraftRequest.powerforward_slots + updateDraftRequest.powerforward_slots
            + updateDraftRequest.smallforward_slots + updateDraftRequest.guard_slots
            + updateDraftRequest.shootingguard_slots + updateDraftRequest.pointguard_slots
            + updateDraftRequest.center_slots + updateDraftRequest.utility_slots
        );

        const draftOrder: number[] = this._draftOrderFactory
            .createDraftOrder(updateDraftRequest.draft_type)
            .generateDraftOrder(updateDraftRequest.team_count, teamSize);

        const draft_id: number = await this._draftsRepository.updateDraft(updateDraftRequest as Draft, updated_draft_id);

        await this._draftsRepository.updateDraft(updateDraftRequest as Draft, updated_draft_id);

        // Inserts the draft order into the database
        let pickNumber = 1;
        for (const teamNumber of draftOrder) {
            await this._draftsRepository.insertDraftOrderPosition(teamNumber, draft_id, pickNumber);
            pickNumber += 1;
        }

        await this._draftsRepository.insertDraftUser(draft_id, updateDraftRequest.scheduled_by_user_id);

        const inviteRecipients: DraftInvite[] = await this._draftsRepository
            .getInvitedDraftUsers(updateDraftRequest.invited_user_ids, draft_id);

        await this._draftInviteEmailer.send(inviteRecipients, updateDraftRequest.scheduled_by_username);
        
        return draft_id;
    }

    async createDraft(createDraftRequest: UpsertDraftRequest): Promise<number> {

        const teamSize: number = (
            createDraftRequest.powerforward_slots + createDraftRequest.powerforward_slots
            + createDraftRequest.smallforward_slots + createDraftRequest.guard_slots
            + createDraftRequest.shootingguard_slots + createDraftRequest.pointguard_slots
            + createDraftRequest.center_slots + createDraftRequest.utility_slots
        );

        const draftOrder: number[] = this._draftOrderFactory
            .createDraftOrder(createDraftRequest.draft_type)
            .generateDraftOrder(createDraftRequest.team_count, teamSize);

        const draft_id: number = await this._draftsRepository.insertDraft(createDraftRequest as Draft);

        // Inserts the draft order into the database
        let pickNumber = 1;
        for (const teamNumber of draftOrder) {
            await this._draftsRepository.insertDraftOrderPosition(teamNumber, draft_id, pickNumber);
            pickNumber += 1;
        }

        await this._draftsRepository.insertDraftUser(draft_id, createDraftRequest.scheduled_by_user_id);

        const inviteRecipients: DraftInvite[] = await this._draftsRepository
            .getInvitedDraftUsers(createDraftRequest.invited_user_ids, draft_id);

        await this._draftInviteEmailer.send(inviteRecipients, createDraftRequest.scheduled_by_username);
        
        return draft_id;
    }
}