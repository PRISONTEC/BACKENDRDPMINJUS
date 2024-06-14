import { Request, Response } from "express";


export default class {
    static healthy(req: Request, res: Response): void {
        res.status(202).send("Page is alive")
    }
}