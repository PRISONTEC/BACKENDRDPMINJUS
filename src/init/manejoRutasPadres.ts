import { Router } from "express";
import bodyParser from "body-parser";
import subRutasUsuario from "../uris/usuario/usuario"
import subRutasConexion from "../uris/conexion/conexion"
import subRutasCentralBloqueadores from "../uris/centralBQ/centralBloqueadores"
import subRutasDynamo from '../uris/dynamo/rutasDynamo';
import errorHTTP from "../uris/manejadorErroresHTTP";
import healthPage from "../uris/healthPage";
import  conexionChorrilloback from "../uris/chorrilloBack/conexionChorrilloback";
export default class manejadorRutas {
  readonly paths: Router;

  constructor() {
    this.paths = Router();
    this.rutas();
  }

  rutas() {
    this.paths.use(bodyParser.json());
    this.paths.get("/", healthPage.healthy);
    this.paths.use("/usuario", subRutasUsuario); //CREAR-VALIDAR-ELIMINAR USUARIO
    this.paths.use("/conexion", subRutasConexion);
    this.paths.use("/centralBloqueadores", subRutasCentralBloqueadores);
    this.paths.use("/dynamo", subRutasDynamo);
    this.paths.use("/penal", conexionChorrilloback);
    this.paths.use(errorHTTP.notFound);
  }
}
