import express from 'express'
import webServer, { wserver } from "../services/webServer";
import conDB, { DBConnection } from "../services/database";
import { parentPort } from 'worker_threads';
import paths from "./manejoRutasPadres";
import errorHTTP from "../uris/manejadorErroresHTTP";

// WATCHDOG

const TIME_KEE_ALIVE = 10 * 1000; //ms 

//SERVER CONEXION
const WebServer: wserver = new webServer();
export const DBConn: DBConnection = new conDB('190.187.248.85', 'root', 'BdD@3nt3l', 3306);
//export const DBConnChoBK: DBConnection = new conDB('192.168.169.253', 'root', 't3l3ph0nY$', 3306);
export const DBConnChoBK: DBConnection = new conDB('190.187.248.85', 'root', 't3l3ph0nY$', 9009);

WebServer.initialize(2880)
  .then((message) => {
    (async () => {
      try {
        if (!(await DBConn.getInstance())) console.log("No se conecto a la BdD Entel")
        else {
          console.log("Se conectó la BdD Entel");
          setInterval(checkCon, TIME_KEE_ALIVE);
        }

        if (!(await DBConnChoBK.getInstance())) console.log("No se conecto a la BdD ChorrillosBK")
        else {
          console.log("Se conectó la BdD ChorrillosBK");
          setInterval(checkConChorrillosBK, TIME_KEE_ALIVE);
        }


        const myPaths = new paths();
        WebServer.server.use(express.json());
        WebServer.server.use(express.urlencoded({ extended: true }));
        WebServer.server.use("/", myPaths.paths);
      } catch (error) {
        console.log(error);
        WebServer.server.use(errorHTTP.notFound);
      }

    })();
  })
  .catch((error) => {
    console.log("catchingServer... " + error);
    throw error
  });

// WATCHDOG
function checkCon() {
  const sql = 'SELECT 1';
  DBConn.conn.query(sql, (err, results) => {
    if (err) {
      console.error('Error al realizar la consulta:', err);
      parentPort!.postMessage(null);
    } else {
      //insertarFecha();
      //console.log(results);
      //parentPort.postMessage({ done: results });
    }
  })
};

function checkConChorrillosBK() {
  const sql = 'SELECT 1';
  DBConnChoBK.conn.query(sql, (err, results) => {
    if (err) {
      console.error('Error al realizar la consulta:', err);
      parentPort!.postMessage(null);
    } else {
      //insertarFecha();
      //console.log(results);
      //parentPort.postMessage({ done: results });
    }
  })
};
