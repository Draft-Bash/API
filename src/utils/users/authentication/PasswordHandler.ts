import { IPasswordHandler } from "./IPasswordHandler";
import * as bcrypt from 'bcryptjs';

export class PasswordHandler implements IPasswordHandler {

    public hash(password: string) {
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const bcryptPassword = bcrypt.hashSync(password, salt);
        return bcryptPassword;
    }

    public compare(password: string, hashedPassword: string) {
        return bcrypt.compareSync(password, hashedPassword);
    }
}