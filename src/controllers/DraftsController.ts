import { Request, Response } from 'express';
const DraftsModel = require('../models/DraftsModel');

const getDrafts = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getDrafts(req));
}

const getDraft = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getDraft(req));
}

const createDraft = async (req: Request, res: Response) => {
    await DraftsModel.createDraft(req);
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
    getPicks
}