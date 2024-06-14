"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const procesarUri_1 = __importDefault(require("../../share/procesarUri"));
class Controller {
    constructor() {
        this.router = (0, express_1.Router)();
        this.subRutas();
    }
    subRutas() {
        this.router.post("/validarUsuario", procesarUri_1.default.validarUsuario); //VALIDAR USUARIO        
    }
}
exports.default = new Controller().router;
