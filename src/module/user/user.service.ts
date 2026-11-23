import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions/error.exception";
import { redisService } from "../../common/service/redis.service";
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

    await redisService.del(otpKey);
    return user;
  }
}

export const User = new UserService();
