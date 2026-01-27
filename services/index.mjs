import expressLoader from "./express.mjs";
import passportLoader from "./passport.mjs";
import routeLoader from "../routes/index.mjs";
import errorHandler from "../middlewares/errorServices.mjs"; // Importe o seu middleware de erro

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default function Services(app) {
  let expressApp = expressLoader(app);

  let passport = passportLoader(expressApp);

  routeLoader(app, passport);

  // Middleware de erro
  app.use(errorHandler); // Adicione o errorHandler após todas as rotas

  // app.use((err, req, res, next) => {
  //   let { message, status } = err;
  //   return res.status(status).send({ message });
  // });
}
