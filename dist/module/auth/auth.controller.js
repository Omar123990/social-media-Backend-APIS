"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const success_response_1 = require("../../common/exceptions/success.response");
const auth_validation_1 = require("./auth.validation");
const validation_service_1 = require("../../common/service/validation.service");
const router = (0, express_1.Router)();
router.post("/login", async (req, res) => {
    let data = await auth_service_1.authService.login(req.body);
    (0, success_response_1.successResponse)({ res, message: "Login successful", statusCode: 200, data });
});
router.post("/signup", (0, validation_service_1.validation)(auth_validation_1.signupSchema), async (req, res) => {
    let data = await auth_service_1.authService.signup(req.body);
    (0, success_response_1.successResponse)({
        res,
        message: "Signup successful",
        statusCode: 201,
        data,
    });
});
exports.default = router;
