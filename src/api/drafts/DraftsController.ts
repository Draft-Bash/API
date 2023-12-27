import { IDraftsService } from "./contracts/IDraftsService";
import { Request, Response } from 'express';
import { UpsertDraftRequest } from "./contracts/controllerRequests/UpsertDraftRequest";
import { UpsertDraftResponse } from "./contracts/controllerResponses/UpsertDraftResponse";
import { Draft } from "./contracts/dataTypes/Draft";

export class DraftsController {

    private readonly _draftsService: IDraftsService;

    constructor(userService: IDraftsService) {
        this._draftsService = userService;
    }

    deleteDraftById = async (req: Request, res: Response) => {
        try {
            const draft_id: number = Number(req.params.draft_id);
            await this._draftsService.deleteDraftById(draft_id);
            res.sendStatus(200);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ error: error.message });
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }

    getDraftById = async (req: Request, res: Response) => {
        try {
            const draft_id: number = Number(req.params.draft_id);
            const result: Draft = await this._draftsService.getDraftById(draft_id);
            res.status(200).send(result);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message==="DraftNotFoundError") {
                    res.status(401).send({ error: error.message });
                } else {
                    res.status(500).send({ 
                        error: error.message
                    });
                }
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }

    getDraftsByUserId = async (req: Request, res: Response) => {
        try {
            const user_id: number = Number(req.query.user_id);
            const result: Draft[] = await this._draftsService.getDraftsByUserId(user_id);
            res.status(200).send(result);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ error: error.message });
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }

    createDraft = async (req: Request, res: Response) => {
        try {
            const createUserRequest: UpsertDraftRequest = req.body;
            const result: number= await this._draftsService.createDraft(createUserRequest)
            const createdUserResponse: UpsertDraftResponse = {draft_id: result};
            res.status(201).send(createdUserResponse);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ error: error.message });
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }

    updateDraft = async (req: Request, res: Response) => {
        try {
            const draft_id: number = Number(req.params.draft_id);
            const updatedDraft: UpsertDraftRequest = req.body;
            const result: number= await this._draftsService.updateDraft(updatedDraft, draft_id)
            const createdUserResponse: UpsertDraftResponse = {draft_id: result};
            res.status(201).send(createdUserResponse);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ error: error.message });
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }
}