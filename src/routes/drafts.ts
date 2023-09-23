const draftsRouter = require("express").Router();
const DraftsController = require("../controllers/DraftsController");

draftsRouter.route("/")
    .get(DraftsController.getDrafts)
    .post(DraftsController.createDraft)

draftsRouter.route("/autodraft")
    .get(DraftsController.getAutodraftStatus)
    .post(DraftsController.toggleAutodraft)

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