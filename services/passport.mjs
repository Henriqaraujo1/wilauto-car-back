import passport from "passport";
import AuthService from "../controllers/AuthService.mjs";
import LocalStrategy from "passport-local";

let AuthServiceInstance = new AuthService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    process.nextTick(function () {
      done(null, {
        id: user.infoUser.idUser,
        username: user.infoUser.username,
      });
    });
  });

  passport.deserializeUser((user, done) => {
    process.nextTick(function () {
      return done(null, user);
    });
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const userLogin = await AuthServiceInstance.LoginUser({
        username: username,
        password,
      });
      
      switch (userLogin.codeStatus) {
        case 401:
          return done(null, false, userLogin);
        case 404:
          return done(null, false, userLogin);
        case 200:
          return done(null, userLogin);

        default:
          break;
      }
    })
  );
  return passport;
};
