import { QueryCommand,QueryCommandInput  } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Request, Response } from "express"
import dynamo from '../services/dynamo';
import clientDynamo from "../services/dynamo"

/* export default class processUri {
    static async getResultByDataCompleta(req: Request, res: Response) {
        console.log("ingreso getResultByDataCompleta")
        const { fechaInicio, fechaFin, idInventario, tramaInt } = req.query;
        if (!fechaInicio || !fechaFin || !idInventario) {
            res.status(400).send("Missing required query parameters: fechaInicio, fechaFin, idInventario");
            return;
        }
        
        const params = {
            TableName: "reporteBQ",
            IndexName: 'idInventario-fechaHoraReporte-index',
            KeyConditionExpression: "#idInventario  =:idInventario  AND #fechaHoraReporte BETWEEN :startDate AND :endDate ",
            ExpressionAttributeNames:({
                "#fechaHoraReporte": 'fechaHoraReporte',
                "#idInventario": 'idInventario',
              }),

            ExpressionAttributeValues: marshall({
                ":startDate": Number(fechaInicio),
                ":endDate": Number(fechaFin),
                ":idInventario": idInventario,
              }),

        };
            const results = await dynamo.send(new QueryCommand(params));
            if (results.$metadata.httpStatusCode === 200 && results.Items) {
                const myNewDataObject = {
                    count: results.Count,
                    items: results.Items.map(item => unmarshall(item))
                };
                res.send(myNewDataObject);
            } else {
                res.status(404).send("Without connection to DynamoDB, check credentials ~/.aws/credentials");
            }
    }
} */ 
    export default class processUri {
        static async getResultByDataCompleta(req: Request, res: Response) {
            const { fechaInicio, fechaFin, idInventario, tramaInt } = req.query;
            if (!fechaInicio || !fechaFin || !idInventario) {
                res.status(400).send("Missing required query parameters: fechaInicio, fechaFin, idInventario");
                return;
            }
    
            let lastEvaluatedKey: any = null;
            let allItems: any[] = [];
            const limit = 1000; // Ajusta el límite para forzar la paginación
    
            try {
                do {
                    const params: QueryCommandInput = {
                        TableName: "reporteBQ",
                        IndexName: 'idInventario-fechaHoraReporte-index',
                        KeyConditionExpression: "#idInventario  = :idInventario  AND #fechaHoraReporte BETWEEN :startDate AND :endDate",
                        ExpressionAttributeNames: {
                            "#fechaHoraReporte": 'fechaHoraReporte',
                            "#idInventario": 'idInventario',
                        },
                        ExpressionAttributeValues: marshall({
                            ":startDate": Number(fechaInicio),
                            ":endDate": Number(fechaFin),
                            ":idInventario": idInventario,
                        }),
                        ExclusiveStartKey: lastEvaluatedKey,
                        Limit: limit,
                    };
    
                    const results = await clientDynamo.send(new QueryCommand(params));
                    if (results.$metadata.httpStatusCode === 200 && results.Items) {
                        allItems = allItems.concat(results.Items.map(item => unmarshall(item)));
                        lastEvaluatedKey = results.LastEvaluatedKey || null;
                    } else {
                        res.status(404).send("Without connection to DynamoDB, check credentials ~/.aws/credentials");
                        return;
                    }
                } while (lastEvaluatedKey);
    
                // Envía todos los ítems recopilados
                res.send({
                    count: allItems.length,
                    items: allItems
                });
    
            } catch (error) {
                res.status(500).send(`Error fetching data from DynamoDB: ${error}`);
            }
        }
    }