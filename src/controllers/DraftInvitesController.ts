import { Request, Response } from 'express';
import dotenv from 'dotenv';
const DraftInvitesModel = require('../models/DraftInvitesModel');
dotenv.config();

// Gets all invites a user has.
const getInvites = async (req: Request, res: Response) => {
    res.json(await DraftInvitesModel.getInvites(req));
}

const updateInviteThruEmail = async (req: Request, res: Response) => {
    const jsonData = await DraftInvitesModel.updateInviteThruEmail(req);
    res.status(302);
    res.setHeader('Location', process.env.CLIENT_URL + '/modules/drafts');
    res.json(jsonData);
  }

const deleteInvite = async (req: Request, res: Response) => {
    res.json(await DraftInvitesModel.deleteInvite(req));
}

const acceptInvite = async (req: Request, res: Response) => {
    res.json(await DraftInvitesModel.acceptInvite(req));
}

const readInvites = async (req: Request, res: Response) => {
    res.json(await DraftInvitesModel.readInvites(req));
}

const isUserReal = async (req: Request, res: Response) => {
    res.json(await DraftInvitesModel.IsUserReal(req));
}

module.exports = {
    getInvites,
    updateInviteThruEmail,
    deleteInvite,
    acceptInvite,
    readInvites,
    isUserReal
}