import express from "express";
import Services from "./services/index.mjs";
import dotenv from "dotenv";
import client from "./config/dbConfig.js";
import errorService from "./middlewares/errorServices.mjs";

let app = express();
dotenv.config({ path: "/back/.env.production" });

let PORT = process.env.PORT;

async function startServer() {
  try {
    await client;
    Services(app);

    app.use(errorService);

    app.listen(PORT, () => {
      console.log(`Servidor está rodando na url http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Erro ao conectar ao banco", err);
  }
}

startServer();
