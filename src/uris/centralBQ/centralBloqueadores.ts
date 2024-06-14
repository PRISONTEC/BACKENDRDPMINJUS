import { Router } from "express";
import processUri from "../../share/procesarUri";

class Controller {
    router: Router
    constructor() {
        this.router = Router()
        this.subRutas()
    }

    subRutas() {
        this.router.get("/reporte1", processUri.reporteBQ1)
        this.router.get("/indicadores", processUri.indicadores)
        this.router.get("/getNota", processUri.getNota)
        this.router.post("/addNota", processUri.addNota)
        this.router.get("/getNotasPorModulo", processUri.getNotasPorModulo)
        this.router.post("/agregarMuchasNotas", processUri.addMuchasNotas)
        this.router.post("/cerrarMuchasNotas", processUri.cerrarMuchasNotas)
        this.router.post("/getMensajeNotas", processUri.getMensajeNotas)
        this.router.post("/getWhoIsUsingTheSession", processUri.quienUsaLaSesion)
    }
}

export default new Controller().router