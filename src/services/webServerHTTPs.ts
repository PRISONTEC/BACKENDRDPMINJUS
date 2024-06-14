import express, { Application, Router } from 'express';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import cors from 'cors';

export interface wserver{
    initializeExpress: (port: number, paths: Router) => Promise<any>
    server: any
    express: Application
}

export default class implements wserver {
    server: any;
    express: Application;
    
    constructor() {
        this.express = express()
        this.express.use(cors({
            origin: '*'
        }))
    }

    initializeExpress(port: number, paths: Router) {  
        return new Promise((resolve, reject) => {
            this.express.use("/", paths);

            /* const key = fs.readFileSync('/etc/letsencrypt/live/c38a2aa7ab14314e787920ba8d82ebd525145228.prisontec.xyz/privkey.pem');
            const cert = fs.readFileSync('/etc/letsencrypt/live/c38a2aa7ab14314e787920ba8d82ebd525145228.prisontec.xyz/cert.pem');
            this.server = https.createServer({ key, cert }, this.express); */
            this.server = http.createServer({}, this.express); 
            this.server.listen(port, (err:any) => {
                resolve("Server Connected on Port " + port)
                if (err) {
                    reject(err)
                }
            })
        })
    }  
}
