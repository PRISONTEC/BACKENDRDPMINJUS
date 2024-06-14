import express, { Application } from 'express';
import cors from 'cors';

export interface wserver{
    initialize: (port: number) => Promise<any>
    server: Application
}

export default class implements wserver {
    server: Application;
    
    constructor() {
        this.server = express()
    }

    initialize(port: number) {  
        return new Promise((resolve, reject) => {
            this.server.use(cors({
                origin: '*'
            }))
            this.server.listen(port, () => {
                resolve("Server Connected on Port " + port)
            })
        })
    }  
}

