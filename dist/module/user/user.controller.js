"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionName = void 0;
const functionName = async (req, res) => {
    const { id } = req.body;
    const result = await "";
    res.status(200).json({ data: result });
};
exports.functionName = functionName;
