"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const error_exception_1 = require("../../common/exceptions/error.exception");
const encreption_service_1 = require("../../common/service/encreption.service");
const redis_service_1 = require("../../common/service/redis.service");
const sendEmail_service_1 = require("../../common/service/sendEmail.service");
const user_model_1 = require("../../database/model/user.model");
const database_reposatory_1 = require("../../database/reposaiory/database.reposatory");
class UserService {
    userRepo;
    constructor() {
        this.userRepo = new database_reposatory_1.DatabaseRepository(user_model_1.userModel);
    }
    async getUserById(id) {
        let user = this.userRepo.findOne({ filter: { _id: id } });
        if (!user) {
            throw new error_exception_1.NotFoundException("user not found");
        }
        return user;
    }
    async verifyAccount(body) {
        let { otp, email } = body;
        let user = await this.userRepo.findOne({ filter: { email } });
        if (!user) {
            throw new error_exception_1.NotFoundException("user not found");
        }
        if (user.isVerified) {
            throw new error_exception_1.BadRequestException("user already verified");
        }
        const otpKey = `otp::${user._id}`;
        const redisOTP = await redis_service_1.redisService.get(otpKey);
        if (redisOTP === null || redisOTP !== String(otp)) {
            throw new error_exception_1.BadRequestException("Invalid OTP");
        }
        await this.userRepo.updateOne({ email }, { $set: { isVerified: true } });
        user.isVerified = true;
        await redis_service_1.redisService.del(otpKey);
        return user;
    }
    async resetPassword(email) {
        let existedUser = await this.userRepo.findOne({ filter: { email } });
        if (!existedUser) {
            throw new error_exception_1.NotFoundException("user not found");
        }
        let otp = Math.round(Math.random() * 1000000);
        await redis_service_1.redisService.set(`otp::${existedUser._id}`, otp, 5 * 60);
        await (0, sendEmail_service_1.sendEmail)({
            to: `${email}`,
            subject: "Verify your email",
            html: `<h1>Your OTP is ${otp}</h1>`,
        });
        return "email is sent";
    }
    async confirmResetPassword(body) {
        let { otp, email, password } = body;
        let user = await this.userRepo.findOne({ filter: { email } });
        if (!user) {
            throw new error_exception_1.NotFoundException("cannot find the user");
        }
        const storedOtp = await redis_service_1.redisService.get(`otp::${user._id}`);
        if (!storedOtp || String(storedOtp) !== String(otp)) {
            throw new error_exception_1.BadRequestException("Invalid or expired OTP");
        }
        let hashedPassword = await (0, encreption_service_1.generateHash)({ planText: password });
        let updatedPassword = await this.userRepo.updateOne({ _id: user.id }, { $set: { password: hashedPassword } });
        await redis_service_1.redisService.del(`otp::${user._id}`);
        return "Password is UPDATED!";
    }
}
exports.User = new UserService();
