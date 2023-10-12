const draftsRouter = require("express").Router();
const DraftsController = require("../controllers/DraftsController");

draftsRouter.route("/")
    .get(DraftsController.getDrafts)
    .post(DraftsController.createDraft)
    .delete(DraftsController.deleteDraft)

draftsRouter.route("/invites")
    .get(DraftsController.getInvites)
    .put(DraftsController.readInvites)

draftsRouter.route("/start/:id")
    .put(DraftsController.startDraft)

draftsRouter.route("/autodraft")
    .get(DraftsController.getAutodraftStatus)
    .post(DraftsController.toggleAutodraft)

draftsRouter.route("/invite")
    .post(DraftsController.inviteUser)

draftsRouter.route("/players")
    .get(DraftsController.getPlayers)

draftsRouter.route("/picks")
    .post(DraftsController.pickPlayer)
    .get(DraftsController.getPicks)

draftsRouter.route("/members")
    .get(DraftsController.getMembers)
    .put(DraftsController.updateMember)

// When user clicks on button in email, they will send a get request that will update the invitation.
draftsRouter.route("/emails/members")
    .get(DraftsController.emailUpdateMember)

draftsRouter.route("/:id")
    .get(DraftsController.getDraft)

module.exports = draftsRouter;