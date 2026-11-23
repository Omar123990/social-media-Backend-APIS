import mongoose from "mongoose";
import { IUser } from "../../common/types/user.type";
import { boolean } from "zod";

export enum UserEnum {
  Admin,
  User,
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  age: {
    type: String,
  },
  isVerified: {
    type: boolean,
    default: false,
  },
  role: {
    type: Number,
    enum: UserEnum,
    default: UserEnum.User,
  },
});

export const userModel = mongoose.model<IUser>("user", userSchema);
