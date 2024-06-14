import mysql, { Connection } from "mysql2"

export interface DBConnection {
    isAlive(): Boolean
    setState(state: boolean): void
    getInstance(): Promise<any>
    conn: Connection 
} 

export default class implements DBConnection {
    conn: Connection
    //private readonly host: string = "190.187.248.85" //192.237.253.176
    //private readonly user: string = "root"            // root
    //private readonly pass: string = "BdD@3nt3l"  // my.bdd@TelefS2
    private activeDB: Boolean = false

    constructor(host: string, user: string, pass: string, port: number) {
        this.conn = mysql.createConnection({
            host: host,
            user: user,
            password: pass,
            port: port,
        });
        this.activeDB = false;
    }

    getInstance() {
        return new Promise((resolve, reject) => {
            this.conn.connect((err) => {
                if (err) {
                    console.log(err)
                    this.activeDB = false
                    reject(this.activeDB)
                } else {
                    this.activeDB = true
                    resolve(this.activeDB) 
                }
            })
        })
    }

    isAlive() {
        return this.activeDB;
    }

    setState(state: boolean) {
        this.activeDB = state;
    }
}

