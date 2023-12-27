import { User } from "../../users/contracts/dataTypes/User";
import { Draft } from "./dataTypes/Draft";
import { DraftInvite } from "./dataTypes/DraftInvite";

export interface IDraftsRepository {
    deleteDraftById(draftId: number): Promise<void>;
    getDraftById(draft_id: number): Promise<Draft | null>;
    getDraftsByUserId(user_id: number): Promise<Draft[]>;
    insertDraft(draft: Draft): Promise<number>;
    updateDraft(draft: Draft, draft_id: number): Promise<number>;
    deleteDraftOrder(draft_id: number): Promise<void>;
    insertDraftOrderPosition(draft_id: number, user_id: number, team_number: number): Promise<void>;
    getInvitedDraftUsers(user_ids: number[], draft_id: number): Promise<DraftInvite[]>;
    updateUserDraftPosition(draft_id: number, user_id: number, team_number: number): Promise<void>;
    insertDraftUser(draft_id: number, user_id: number): Promise<void>;
}