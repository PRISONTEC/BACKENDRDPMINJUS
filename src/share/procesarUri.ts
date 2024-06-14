
import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import { exec } from "child_process";
import * as util from 'util';

import { Credenciales } from "../interfaces/interface"
import gettingResponses from "./getResponses";


export default class processUri {

    //VALIDAR USUARIO PARA EL LOGIN
    static validarUsuario(req: Request, res: Response) {
        const sql = "call sesionesBloqueoRDP.validacionUsuario ('" + req.body.usuario + "');"
        gettingResponses.getResponse(sql, (result: any) => {
            try {
                let credenciales: Credenciales = result[0][0].resultado;
                if (credenciales.resultado == "OK") {
                    bcrypt.compare(req.body.contrasena, credenciales.contrasena!,
                        function (err, res1) {
                            if (res1) {
                                res.send({
                                    resultado: "OK",
                                    idUsuario: credenciales.idUsuario
                                })
                            } else {
                                res.status(200).json({ 'respuesta': 'KO' })
                            }
                        }
                    );
                } else {
                    res.status(200).json({ 'respuesta': 'KO' })
                }
                //res.send(result[0][0].resultado) 
            } catch (error) {
                res.status(200).json({ 'respuesta': 'KO', error: result.error })
            }
        })
    };

    static changePassword(req: Request, res: Response) {
        const saltRounds = 10;
        const myPlaintextPassword = req.body.clave;
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
                // Store hash in your password DB.
                const sql = "call sesionesBloqueoRDP.changePassword ('" + req.body.usuario + "','" + hash +"');"
                gettingResponses.getResponse(sql, (result: any) => {
                    try {
                        res.send(result[0][0].rpta);
                    } catch (error) {
                        res.status(200).json({ 'respuesta': 'KO', error: result.error })
                    }
                });
            });
        });

    };


    static abrirConexionRDP(req: Request, res: Response) {
        const execPromise = util.promisify(exec);
        async function ejecutarScript(): Promise<void> {
            try {
                const { stdout, stderr } = await execPromise(`/usr/bin/sh /root/searchPortRDP.sh ${req.body.prefijo} ${req.body.ipPublica}`);

                if (stderr) {
                    console.error(`Error: ${stderr}`);
                    throw new Error(stderr);
                }
                //res.send({resultado:"OK", message: stdout})
                const rptaShell = JSON.parse(stdout);
                if (rptaShell.resultado == "OK") {
                    const sql = "call sesionesBloqueoRDP.agregarNuevaSesion ('" + req.body.usuario + "'," +
                        rptaShell.port + "," + req.body.prefijo + ",'" + rptaShell.salto + "','" + req.body.ipPublica + "');"
                    gettingResponses.getResponse(sql, (result: any) => {
                        if (result[0][0].resultado.resultado == "OK") {
                            res.send({ resultado: "OK", puerto: rptaShell.port })
                        } else {
                            res.send({ resultado: 'KO', message: "error BDD registrando conexión" })
                        }
                    });
                } else {
                    res.send({ resultado: "KO", message: rptaShell.message })
                }
                // ...resto de tu código aquí...
            } catch (error) {
                console.error(`Error: ${error}`);
                res.send({ respuesta: "KO", message: error })
                // Manejar errores aquí
            }
        }

        // Llamar a la función
        ejecutarScript();

    }
    static validarConexionRDP(req: Request, res: Response) {
        const execPromise = util.promisify(exec);
        async function ejecutarScript(): Promise<void> {
            try {
                const { stdout, stderr } = await execPromise(`if timeout 1 ping -c 1 ${req.body.ip} > /dev/null 2>&1; then echo "1" ;else echo "0" ;fi`);

                if (stderr) {
                    console.error(`Error: ${stderr}`);
                    throw new Error(stderr);
                }

                // hay ping
                if (stdout.trim() == "1") {
                    const sql = "call sesionesBloqueoRDP.validarSesion ('" + req.body.usuario + "'," + req.body.prefijo + ");"
                    gettingResponses.getResponse(sql, (result: any) => {
                        res.send(result[0][0].resultado)
                    });
                } else {
                    res.send({ resultado: "KO", puerto: "" })
                }
            } catch (error) {
                console.error(`Error: ${error}`);
                res.send({ respuesta: "KO", message: error })
                // Manejar errores aquí
            }
        }
        // Llamar a la función
        ejecutarScript();
    }

    static reporteBQ1(req: Request, res: Response) {
        const sql = "call centralBloqueadores.reporte1BQ('" + req.query.fechaHora + "');"
        gettingResponses.getResponseChorrillosBK(sql, (result: any) => {
            try {
                result = { 'diferencias': result[1], 'consolidado': result[0][0].reporte1 }
                res.send(result)
            } catch (error) {
                res.status(200).json({ 'respuesta': 'KO', error: result.error })
            }
        })
    }

    static indicadores(req: Request, res: Response) {
        const sql = "call centralBloqueadores.consultarIndicadoresFechas(" + req.query.fechaHoraInicio + "," + req.query.fechaHoraFin + ");"

        gettingResponses.getResponseChorrillosBK(sql, (result: any) => {
            try {
                let porZona = result[0][0].porZona;
                let porPenal = result[1][0].porPenal;
                let porPais = result[2][0].Pais;
                res.send({ 'porZona': porZona, 'porPenal': porPenal, 'porPais': porPais });
            } catch (error) {
                res.status(200).json({ 'respuesta': 'KO', error: result.error })
            }
        })
    }

    static getNota(req: Request, res: Response) {

        let idInventario = req.query.idInventario
        const sql = "call centralBloqueadores.getNotaAlarma(" + idInventario + ");"


        gettingResponses.getResponseChorrillosBK(sql, (result: any) => {
            try {
                res.send(result[0][0].rpta);
            } catch (error) {
                res.status(200).json({ 'respuesta': 'KO', error: result.error })
            }
        })
    }

    static addNota(req: Request, res: Response) {

        let usuario = req.query.usuario
        let idInventario = req.query.idInventario
        let nota = req.query.nota
        let estado = req.query.estado
        const sql = "call centralBloqueadores.addNotaAlarma('" + usuario + "'," + idInventario + ",'" + nota + "'," + estado + ");"
        //console.log(sql)
        gettingResponses.getResponseChorrillosBK(sql, (result: any) => {
            try {
                res.send(result[0][0]);
            } catch (error) {
                res.status(200).json({ 'respuesta': 'KO', error: result.error })
            }
        })
    }

    // se envía el módulo "idInventario" y te devuelve la historia
    static getNotasPorModulo(req: Request, res: Response) {
        let idInventario = req.query.idInventario
        let fhInicio = req.query.fhInicio
        let fhFin = req.query.fhFin
        const sql = "call centralBloqueadores.getNotasPorModulo(" + fhInicio + "," + fhFin + "," + idInventario + ");"
        gettingResponses.getResponseChorrillosBK(sql, (result: any) => {
            try {
                res.send({ respuesta: 'OK', notas: result[0][0].rpta });
            } catch (error) {
                res.status(200).json({ 'respuesta': 'KO', error: result.error })
            }
        })
    }

    static addMuchasNotas(req: Request, res: Response) {
        const sql = "call centralBloqueadores.addMuchasNotasAlarma('" + JSON.stringify(req.body.jsonNotas) + "');"
        gettingResponses.getResponseChorrillosBK(sql, (result: any) => {
            try {
                res.send(result[0][0].respuesta);
            } catch (error) {
                res.status(200).json({ 'respuesta': 'KO', error: result.error })
            }
        })
    }

    static cerrarMuchasNotas(req: Request, res: Response) {
        const sql = "call centralBloqueadores.cerrarMuchasNotasAlarma('" + JSON.stringify(req.body.jsonNotas) + "');"
        //console.log(sql)
        gettingResponses.getResponseChorrillosBK(sql, (result: any) => {
            try {
                res.send(result[0][0].respuesta);
            } catch (error) {
                res.status(200).json({ 'respuesta': 'KO', error: result.error })
            }
        })
    }

    // se envía un json con los idNota de varios módulos diferentes y te devuelve los mensajes
    static getMensajeNotas(req: Request, res: Response) {
        const sql = "call centralBloqueadores.getMensajeNotas('" + JSON.stringify(req.body.jsonIdNotas) + "');"
        gettingResponses.getResponseChorrillosBK(sql, (result: any) => {
            try {
                res.send(result[0][0].rpta);
            } catch (error) {
                res.status(200).json({ 'respuesta': 'KO', error: result.error })
            }
        })
    }
    static quienUsaLaSesion(req: Request, res: Response) {
        const sql = "call sesionesBloqueoRDP.quienUsaLaSesion(" + req.body.prefijo + ");"
        gettingResponses.getResponse(sql, (result: any) => {
            try {
                res.send(result[0][0].rpta);
            } catch (error) {
                res.status(200).json({ 'respuesta': 'KO', error: result.error })
            }
        })
    }
}



// POST>>CREAR UN RECURSO O INSERTAR
// GET--->>OBTNER RECURSO
// PUT -->>ACTUALIZAR
// PATCH-->>ACTUALIZAR PARCIALMENTE
// DELETE --->> REMOVER RECURSO
