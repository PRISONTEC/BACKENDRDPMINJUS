import { Router } from "express";
import processUri from "../../share/procesarUri";

class Controller {
    router: Router
    constructor() {
        this.router = Router()
        this.subRutas()
    }

    subRutas() {
        this.router.post("/validarUsuario", processUri.validarUsuario)//VALIDAR USUARIO        
    }
}

export default new Controller().router