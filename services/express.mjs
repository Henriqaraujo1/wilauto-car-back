import pkg from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import compression from "compression";
import errorHandler from "../middlewares/errorServices.mjs"; // Importa o middleware de erro
let { json, urlencoded } = pkg;

dotenv.config({ path: "/git/system-back/back/.env.production" });

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  let corsOptions = {
    origin: "https://will-auto.worldsoft-inc.com",
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  };

  app.use(
    compression({
      level: 9, // Nível de compactação (0-9). Padrão é 6.
      threshold: 1024, // Compacta apenas respostas maiores que 1KB
    }),
  );

  app.use(cors(corsOptions));

  app.use(json());

  app.use(urlencoded({ extended: true }));

  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  // app.use(errorHandler);

  return app;
};
