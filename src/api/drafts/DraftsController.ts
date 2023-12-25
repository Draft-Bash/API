import { IDraftsService } from "./contracts/IDraftsService";
import { Request, Response } from 'express';
import { CreateDraftRequest } from "./contracts/controllerRequests/CreateDraftRequest";
import { CreateDraftResponse } from "./contracts/controllerResponses/CreateDraftResponse";
import { Draft } from "./contracts/dataTypes/Draft";

export class DraftsController {

    private readonly _draftsService: IDraftsService;

    constructor(userService: IDraftsService) {
        this._draftsService = userService;
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
            const createUserRequest: CreateDraftRequest = req.body;
            const result: number= await this._draftsService.createDraft(createUserRequest)
            const createdUserResponse: CreateDraftResponse = {draft_id: result};
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