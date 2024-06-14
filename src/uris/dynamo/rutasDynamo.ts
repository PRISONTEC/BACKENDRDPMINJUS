import { Router } from "express";
import processUri from "../../share/controllerDynamo";


class Controller {
    router: Router
    constructor() {
        this.router = Router()
        this.subRutas()
    }

    subRutas() {
        this.router.get("/", processUri.getResultByDataCompleta)
    }
}

export default new Controller().router