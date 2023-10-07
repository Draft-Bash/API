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


module.exports = {
    createUser,
    loginUser,
    checkIfUserAuthenticated
}