import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
    type: "mysql",
    host: "127.0.0.1", //190.187.248.85
    port: 3306,
    username: "root",
    password: "miguel", //BdD@3nt3l
    database: "videoconferencias",
    synchronize: true, // si lo ponemos en "true" quiere decir que nuestra clase siempre se va a ver reflejado en nuestra base de datos
    logging: false,
    entities: [__dirname + '/**/*.entity{.js,.ts}'] //__dirname me indica que el archivo está dentro del proyecto y si encuentra dentro
    // de esta ruta "/../**/*" un arhivo llamado .entity.{js,ts} vas a cargarlo
})

AppDataSource
    .initialize()
    .then(() => {
        console.log("Conexion establecidad para entity....!")
    })
    .catch((err) => {
        console.error("Error en la conexión para la entity", err)
    })