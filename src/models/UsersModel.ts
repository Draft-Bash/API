import { Request, Response } from 'express';
const db = require("../db");

class UsersModel {
    public async createUser() {
        return "Hello";
    }
}
  
module.exports = new UsersModel();