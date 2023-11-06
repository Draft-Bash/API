import { Request, Response } from 'express';
import dotenv from 'dotenv';
const DraftsModel = require('../models/DraftsModel');
dotenv.config();

const getDrafts = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getDrafts(req));
}

const updateDraft = async (req: Request, res: Response) => {
    res.json(await DraftsModel.updateDraft(req));
}

const deleteDraft = async (req: Request, res: Response) => {
    res.json(await DraftsModel.deleteDraft(req));
}

const inviteUser = async (req: Request, res: Response) => {
    res.json(await DraftsModel.inviteUser(req));
}

const getDraft = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getDraft(req));
}

const createDraft = async (req: Request, res: Response) => {
    res.json(await DraftsModel.createDraft(req));
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

const getDraftGrade = async (req: Request, res: Response) => {
    res.json(await DraftsModel.getDraftGrade(req));
}

const sendDraftSummaryEmail = async (req: Request, res: Response) => {
    res.json(await DraftsModel.sendDraftSummaryEmail(req));
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
    deleteDraft,
    updateDraft,
    getDraftGrade,
    sendDraftSummaryEmail
}