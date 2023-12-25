export class UserUniqueViolationError extends Error {
    isUsernameUnique: boolean;
    isEmailUnique: boolean;

    constructor(isUsernameUnique: boolean, isEmailUnique: boolean, message?: string,  ) {
        super(message);
        this.name = 'UserUniqueViolationError';
        this.isUsernameUnique = isUsernameUnique;
        this.isEmailUnique = isEmailUnique;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}