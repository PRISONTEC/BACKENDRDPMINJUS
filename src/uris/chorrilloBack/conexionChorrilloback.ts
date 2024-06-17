import { Router } from "express";
import processUri from "../../share/procesarUri";

class Controller {
    router: Router
    constructor() {
        this.router = Router()
        this.subRutas()
    }

    subRutas() {
        this.router.get("/idInvetario", processUri.inventario);
        this.router.get("/bloqueador", processUri.obtenerDatosPorBloqueador);      
    }
}

export default new Controller().router