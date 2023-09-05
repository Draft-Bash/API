import { Request, Response } from 'express';
const DraftsModel = require('../models/DraftsModel');

const getDrafts = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getDrafts(req));
}

const createDraft = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getDrafts(req));
}

module.exports = {
    getDrafts,
    createDraft
}