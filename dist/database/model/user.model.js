"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const userSchema = new mongoose_1.default.Schema({
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
        type: zod_1.boolean,
        default: false,
    },
});
exports.userModel = mongoose_1.default.model("user", userSchema);
