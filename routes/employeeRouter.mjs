import { Router } from "express";
import EmployeeService from "../controllers/EmployeeService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const EmployeeServiceInstance = new EmployeeService();
const router = Router();

export default (app) => {
  app.use("/api/employee", router);

  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseEmployee =
          await EmployeeServiceInstance.getAllEmployees();

        switch (responseEmployee.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
              employee: responseEmployee.employee,
            });
            break;

          default:
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.get("/cod-employee", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseEmployee = await EmployeeServiceInstance.getEmployeeCod();

        switch (responseEmployee.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
              employeeCod: responseEmployee.employeeCod,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: true,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
              employeeCod: responseEmployee.employeeCod,
            });
            break;

          default:
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.get("/:docEmployee", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const docEmployee = req.params.docEmployee;

        const responseEmployee = await EmployeeServiceInstance.getEmployeeByCPF(
          docEmployee
        );

        switch (responseEmployee.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: true,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
              employee: responseEmployee.employee,
            });
            break;

          default:
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.post("/new-employee", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const employee = req.body;

        const responseEmployee = await EmployeeServiceInstance.createEmployee(
          employee
        );

        switch (responseEmployee.codeStatus) {
          case 409:
            res.status(409).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
            });
            break;

          default:
            res.status(500).json({
              responseEmployee,
            });
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.put("/:idEmployee", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idEmployee = parseInt(req.params.idEmployee);
        const data = req.body;
        const responseEmployee = await EmployeeServiceInstance.updateEmployee(
          idEmployee,
          data
        );

        switch (responseEmployee.codeStatus) {
          case 409:
            res.status(409).json(responseEmployee);
            break;
          case 404:
            res.status(404).json(responseEmployee);
            break;
          case 200:
            res.status(200).json(responseEmployee);
            break;

          default:
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.delete("/:idEmployee", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idEmployee = parseInt(req.params.idEmployee);
        const responseEmployee = await EmployeeServiceInstance.deleteEmployee(
          idEmployee
        );
        switch (responseEmployee.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: true,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
              employee: responseEmployee.employee,
            });
            break;

          default:
            res.status(responseEmployee.codeStatus).json({
              errorStatus: responseEmployee.errorStatus,
              successStatus: responseEmployee.successStatus,
              codeStatus: responseEmployee.codeStatus,
              message: responseEmployee.message,
            });
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
};
