import { Request, Response } from 'express';
const DraftsModel = require('../models/DraftsModel');

const getDrafts = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getDrafts(req));
    
}

const inviteUser = async (req: Request, res: Response) => {
    res.json(await DraftsModel.inviteUser(req));
}

const readInvites = async (req: Request, res: Response) => {
    res.json(await DraftsModel.readInvites(req));
}

const getDraft = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getDraft(req));
}

const updateMember = async (req: Request, res: Response) => {
    res.json(await DraftsModel.updateMember(req));
}

const emailUpdateMember = async (req: Request, res: Response) => {
    res.json(await DraftsModel.emailUpdateMember(req));
}

const createDraft = async (req: Request, res: Response) => {
    res.json(await DraftsModel.createDraft(req));
}

const getInvites = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getInvites(req));
}

const startDraft = async (req: Request, res: Response) => {
    res.json(await DraftsModel.startDraft(req));
}

const getAutodraftStatus = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getAutodraftStatus(req));
}

const toggleAutodraft = async (req: Request, res: Response) => {
    res.json(await DraftsModel.toggleAutodraft(req));
}

const getMembers = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getMembers(req));
}

const getPlayers = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getPlayers(req));
}

const pickPlayer = async (req: Request, res: Response) => {
    res.json(await DraftsModel.pickPlayer(req));
}

const getPicks = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getPicks(req));
}

module.exports = {
    getDrafts,
    createDraft,
    getDraft,
    getMembers,
    getPlayers,
    pickPlayer,
    getPicks,
    getAutodraftStatus,
    toggleAutodraft,
    inviteUser,
    startDraft,
    getInvites,
    readInvites,
    updateMember,
    emailUpdateMember
}