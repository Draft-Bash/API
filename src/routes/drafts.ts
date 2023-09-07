const draftsRouter = require("express").Router();
const DraftsController = require("../controllers/DraftsController");

draftsRouter.route("/")
    .get(DraftsController.getDrafts)
    .post(DraftsController.createDraft)

draftsRouter.route("/players")
    .get(DraftsController.getPlayers)

draftsRouter.route("/picks")
    .post(DraftsController.pickPlayer)
    .get(DraftsController.getPicks)

draftsRouter.route("/members")
    .get(DraftsController.getMembers)

draftsRouter.route("/unitTest")
    .get(DraftsController.unitTest)

draftsRouter.route("/:id")
    .get(DraftsController.getDraft)

module.exports = draftsRouter;