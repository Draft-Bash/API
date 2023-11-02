const draftInvitesRouter = require("express").Router();
const DraftInvitesController = require("../controllers/DraftInvitesController");

draftInvitesRouter.route("/")
    .get(DraftInvitesController.getInvites)
    .post(DraftInvitesController.isUserReal)
    .put(DraftInvitesController.acceptInvite)
    .delete(DraftInvitesController.deleteInvite)

draftInvitesRouter.route("/read")
    .put(DraftInvitesController.acceptInvite)

draftInvitesRouter.route("/emails")
    .get(DraftInvitesController.updateInviteThruEmail)


module.exports = draftInvitesRouter;