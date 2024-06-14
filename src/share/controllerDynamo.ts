import { QueryCommand, QueryCommandInput, ScanCommand, ScanCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Request, Response } from "express"
import clientDynamo from "../services/dynamo"

export default class processUri {
    static async getResultByDataCompleta(req: Request, res: Response) {
        const { fechaInicio,fechaFin,tramaInt } = req.query;
        
        const params: ScanCommandInput = {
            TableName: "reporteBQ",
            FilterExpression: "#fechaHoraReporte BETWEEN :startDate AND :endDate AND #tramaInt = :tramaInt",
            ExpressionAttributeNames:({
                "#fechaHoraReporte": 'fechaHoraReporte',
                "#tramaInt": 'tramaInt',
              }),

            ExpressionAttributeValues: marshall({
                ":startDate": Number(fechaInicio),
                ":endDate":  Number(fechaFin),
                ":tramaInt": Number(tramaInt),
              }),

        };
        const results = await clientDynamo.send(new ScanCommand(params));
        if (results.$metadata.httpStatusCode === 200 && results.Items) {
            let myNewDataObject = new Object({
                "count": results.Count,
                "items": results.Items.map((i) => unmarshall(i))
            });
            res.send(myNewDataObject);

        } else {
            res.status(404).send("Without connection to dynamo, check credentials ~/.aws/credentials")
        }
    }
}