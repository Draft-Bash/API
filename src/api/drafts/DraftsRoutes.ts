import { Router } from "express";
import { DraftsRepository } from "./DraftsRepository";
import { DraftsService } from "./DraftsService";
import { DraftsController } from "./DraftsController";
import { DraftInviteEmailer } from "../../utils/email/DraftInviteEmailer";
const draftsRouter = Router();

// Create the layers and inject the dependencies from one layer into the next.
const draftEmailer: DraftInviteEmailer = new DraftInviteEmailer(); // Sends emails to users
const draftsRepository: DraftsRepository = new DraftsRepository(); // Central class for executing the raw SQL queries
const draftsService: DraftsService = new DraftsService(draftsRepository, draftEmailer); // Performs business logic
const draftsController: DraftsController = new DraftsController(draftsService); // Handles HTTP requests

// Define the routes for user endpoints
draftsRouter.route("/")
    .post(draftsController.createDraft)
    .get(draftsController.getDraftsByUserId);

export default draftsRouter;