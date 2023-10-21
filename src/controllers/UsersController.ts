import { Request, Response } from 'express';
const UsersModel = require('../models/UsersModel');

const createUser = async (req: Request, res: Response) => {
    res.json(await UsersModel.createUser(req));
}

const loginUser = async (req: Request, res: Response) => {
    res.json(await UsersModel.loginUser(req));
}

const updateUser = async (req: Request, res: Response) => {
    res.json(await UsersModel.updateUser(req));
}

const checkIfUserAuthenticated = async (req: Request, res: Response) => {
    res.json(await UsersModel.checkIfUserAuthenticated(req));
}

const sendPasswordResetEmail = async (req: Request, res: Response) => {
    res.json(await UsersModel.sendResetPasswordEmail(req));
}

module.exports = {
    createUser,
    loginUser,
    checkIfUserAuthenticated,
    sendPasswordResetEmail,
    updateUser
}