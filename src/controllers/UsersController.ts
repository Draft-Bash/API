import { Request, Response } from 'express';
const UsersModel = require('../models/UsersModel');

const createUser = async (req: Request, res: Response) => {
    res.json(await UsersModel.createUser(req));
}

const loginUser = async (req: Request, res: Response) => {
    res.json(await UsersModel.loginUser(req));
}

const checkIfUserAuthenticated = async (req: Request, res: Response) => {
    res.json(await UsersModel.checkIfUserAuthenticated(req));
}

const sendResetPasswordEmail = async (req: Request, res: Response) => {
    res.json(await UsersModel.sendResetPasswordEmailreq);
}

const changePassword = async (req: Request, res: Response) => {
    const passwordChanged = await UsersModel.changePassword(req);
    if (passwordChanged) {
        res.json({ success: true, message: "Password changed successfully." });
    } else {
        res.status(401).json({ success: false, message: "Password change failed. Please check your credentials." });
    }
}

module.exports = {
    createUser,
    loginUser,
    checkIfUserAuthenticated,
    changePassword,
    sendResetPasswordEmail
}