import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exceptions/error.exception";
import {
  compareHash,
  generateHash,
} from "../../common/service/encreption.service";
import { redisService } from "../../common/service/redis.service";
import { sendEmail } from "../../common/service/sendEmail.service";
import { generateToken } from "../../common/service/token.service";
import { IUser } from "../../common/types/user.type";
import { userModel } from "../../database/model/user.model";
import { DatabaseRepository } from "../../database/reposaiory/database.reposatory";
import { LoginResponse, SignupResponse } from "./dto/auth.dto";

class AuthService {
  private authRepository: DatabaseRepository<IUser>;
  constructor() {
    this.authRepository = new DatabaseRepository<IUser>(userModel);
  }

  public async login(data: IUser): Promise<LoginResponse> {
    let { email, password } = data;
    let existedUser = await this.authRepository.findOne({ filter: { email } });
    if (!existedUser) {
      throw new NotFoundException("User not found");
    }
    let passwordMatched = await compareHash({
      planText: password,
      hashedPassword: existedUser.password,
    });
    if (!passwordMatched) {
      throw new BadRequestException("password not matched");
    }
    let { token, refreshToken } = generateToken(existedUser);
    return {
      message: "Login successful",
      data: { token, refreshToken },
    };
  }
  public async signup(data: IUser): Promise<SignupResponse> {
    let { phone, email, name, password, confirmPassword, age, gender } = data;
    if (password !== confirmPassword) {
      throw new BadRequestException("confirmPassword is not matched");
    }
    let existedUser = await this.authRepository.findOne({ filter: { email } });
    if (existedUser) {
      throw new ConflictException("User already exists");
    }
    let hashedPassword = await generateHash({ planText: password });
    if (!hashedPassword) {
      throw new BadRequestException("something went wrong");
    }
    let otp = Math.round(Math.random() * 1000000);
    let user = await this.authRepository.create({
      email,
      name,
      password: hashedPassword,
      age,
      phone,
      gender,
    });
    await redisService.set(`otp::${user._id}`, otp, 5 * 60);
    await sendEmail({
      to: `${user.email}`,
      subject: "Verify your email",
      html: `<h1>Your OTP is ${otp}</h1>`,
    });
    return {
      message: "Signup successful",
      data: { email, name, age, gender, phone },
    };
  }
}

export const authService = new AuthService();
