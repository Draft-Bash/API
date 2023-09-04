import { Request, Response } from 'express';
const UsersModel = require('../models/UsersModel');

const createUser = async (req: Request, res: Response) => {
    res.json(await UsersModel.createUser(req));
}

const loginUser = async (req: Request, res: Response) => {
    res.json(await UsersModel.loginUser(req));
}

module.exports = {
    createUser,
    loginUser
}