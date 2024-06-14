import { Router } from "express";
import processUri from "../../share/procesarUri";

class Controller {
    router: Router
    constructor() {
        this.router = Router()
        this.subRutas()
    }

    subRutas() {
        this.router.post("/iniciar", processUri.abrirConexionRDP)//INICIAR CONEXION
        this.router.post("/validar", processUri.validarConexionRDP)//VALIDAR USUARIO      
        this.router.post("/cambiarClave", processUri.changePassword)//VALIDAR USUARIO        
    }
}

export default new Controller().router