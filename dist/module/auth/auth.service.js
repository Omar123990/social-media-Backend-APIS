"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const error_exception_1 = require("../../common/exceptions/error.exception");
const user_model_1 = require("../../database/model/user.model");
const database_reposatory_1 = require("../../database/reposaiory/database.reposatory");
class AuthService {
    authRepository;
    constructor() {
        this.authRepository = new database_reposatory_1.DatabaseRepository(user_model_1.userModel);
    }
    async login(data) {
        let { email, password } = data;
        let existedUser = await this.authRepository.findOne({ filter: { email } });
        if (!existedUser) {
            throw new error_exception_1.ConflictException("User not found");
        }
        return data;
    }
    async signup(data) {
        let { email } = data;
        let existedUser = await this.authRepository.findOne({ filter: { email } });
        if (existedUser) {
            throw new error_exception_1.ConflictException("User already exists");
        }
        return data;
    }
}
exports.authService = new AuthService();
