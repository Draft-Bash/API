const draftsRouter = require("express").Router();
const DraftsController = require("../controllers/DraftsController");

draftsRouter.route("/")
    .get(DraftsController.getDrafts)
    .post(DraftsController.createDraft)
    .delete(DraftsController.deleteDraft)
    .put(DraftsController.updateDraft)

draftsRouter.route("/start/:id")
    .put(DraftsController.startDraft)

draftsRouter.route("/autodraft")
    .get(DraftsController.getAutodraftStatus)
    .post(DraftsController.toggleAutodraft)

draftsRouter.route("/grades")
    .get(DraftsController.getDraftGrade)
    .post(DraftsController.sendDraftSummaryEmail)

draftsRouter.route("/players")
    .get(DraftsController.getPlayers)

draftsRouter.route("/picks")
    .post(DraftsController.pickPlayer)
    .get(DraftsController.getPicks)

draftsRouter.route("/members")
    .get(DraftsController.getMembers)

draftsRouter.route("/:id")
    .get(DraftsController.getDraft)

module.exports = draftsRouter;