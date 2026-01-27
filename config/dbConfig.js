import pkg from "pg";
// import { DB } from '../configs/config.js';
import dotenv from "dotenv";
const { Client } = pkg;

dotenv.config({ path: "/git/system-back/back/.env.production" });

let client = null

async function connectDB() {
  if(!client) {
    client = new Client();
    try {
      await client.connect();
      console.log("Conectado ao servidor de banco de dados")
      return client
    } catch (err) {
      console.log(`Erro ao conectar com o banco de dados: ${err}`)
      setTimeout(connectDB, 5000)
    }
  }
  return client
}

connectDB()

export default connectDB;
