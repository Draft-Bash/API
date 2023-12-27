import { UpsertDraftRequest } from "./controllerRequests/UpsertDraftRequest";
import { Draft } from "./dataTypes/Draft";

export interface IDraftsService {
    deleteDraftById(draftId: number): Promise<void>;
    getDraftById(draft_id: number): Draft | PromiseLike<Draft>;
    getDraftsByUserId(user_id: number): Promise<Draft[]>;
    createDraft(createDraftRequest: UpsertDraftRequest): Promise<number>;
    updateDraft(updateDraftRequest: UpsertDraftRequest, updated_draft_id: number): Promise<number>;
}