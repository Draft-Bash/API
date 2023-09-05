const draftsRouter = require("express").Router();
const DraftsController = require("../controllers/DraftsController");

draftsRouter.route("/")
    .get(DraftsController.getDrafts)
    .post(DraftsController.createDraft)

module.exports = draftsRouter;