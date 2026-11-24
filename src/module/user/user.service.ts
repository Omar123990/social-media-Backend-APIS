import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions/error.exception";
import { generateHash } from "../../common/service/encreption.service";
import { redisService } from "../../common/service/redis.service";
import { sendEmail } from "../../common/service/sendEmail.service";
import { IUser } from "../../common/types/user.type";
import { userModel } from "../../database/model/user.model";
import { DatabaseRepository } from "../../database/reposaiory/database.reposatory";

class UserService {
  [x: string]: any;
  private userRepo: DatabaseRepository<IUser>;
  constructor() {
    this.userRepo = new DatabaseRepository<IUser>(userModel);
  }

  public async getUserById(id: string) {
    let user = this.userRepo.findOne({ filter: { _id: id } });
    if (!user) {
      throw new NotFoundException("user not found");
    }
    return user;
  }

  public async verifyAccount(body: {
    otp: number;
    email: string;
  }): Promise<IUser> {
    let { otp, email } = body;
    let user = await this.userRepo.findOne({ filter: { email } });
    if (!user) {
      throw new NotFoundException("user not found");
    }
    if (user.isVerified) {
      throw new BadRequestException("user already verified");
    }
    const otpKey = `otp::${user._id}`;
    const redisOTP = await redisService.get(otpKey);

    if (redisOTP === null || redisOTP !== String(otp)) {
      throw new BadRequestException("Invalid OTP");
    }

    await this.userRepo.updateOne({ email }, { $set: { isVerified: true } });
    user.isVerified = true;
    await redisService.del(otpKey);
    return user;
  }

  public async resetPassword(email: string) {
    let existedUser = await this.userRepo.findOne({ filter: { email } });
    if (!existedUser) {
      throw new NotFoundException("user not found");
    }
    let otp = Math.round(Math.random() * 1000000);
    await redisService.set(`otp::${existedUser._id}`, otp, 5 * 60);
    await sendEmail({
      to: `${email}`,
      subject: "Verify your email",
      html: `<h1>Your OTP is ${otp}</h1>`,
    });
    return "email is sent";
  }

  public async confirmResetPassword(body: {
    otp: number | string;
    email: string;
    password: string;
  }) {
    let { otp, email, password } = body;
    let user = await this.userRepo.findOne({ filter: { email } });
    if (!user) {
      throw new NotFoundException("cannot find the user");
    }
    const storedOtp = await redisService.get(`otp::${user._id}`);
    if (!storedOtp || String(storedOtp) !== String(otp)) {
      throw new BadRequestException("Invalid or expired OTP");
    }
    let hashedPassword = await generateHash({ planText: password });
    let updatedPassword = await this.userRepo.updateOne(
      { _id: user.id },
      { $set: { password: hashedPassword } },
    );
    await redisService.del(`otp::${user._id}`);
    return "Password is UPDATED!";
  }
}

export const User = new UserService();
