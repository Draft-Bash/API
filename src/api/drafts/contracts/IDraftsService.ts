import { CreateDraftRequest } from "./controllerRequests/CreateDraftRequest";
import { Draft } from "./dataTypes/Draft";

export interface IDraftsService {
    getDraftsByUserId(user_id: number): Promise<Draft[]>;
    createDraft(createDraftRequest: CreateDraftRequest): Promise<number>;
    updateDraft(updateDraftRequest: CreateDraftRequest, updated_draft_id: number): Promise<number>;
}