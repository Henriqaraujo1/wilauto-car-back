import createHttpError from "http-errors";
import EmployeeModel from "../models/employeeModel.mjs";
import FormatDates from "../utils/FormatDates.mjs";
import PositionService from "./WorkPositionService.mjs";

const EmployeeModelInstance = new EmployeeModel();
const FormatDate = new FormatDates();
const PositionServiceInstance = new PositionService();

export default class EmployeeService {
  async getAllEmployees() {
    try {
      const allEmployee = await EmployeeModelInstance.getAllEmployee();

      for (const employee of allEmployee) {
        const infoPosition = await PositionServiceInstance.getIdPosition(
          employee.idPosition
        );
        employee.namePosition = infoPosition.infoPosition.namePosition;
      }

      if (!allEmployee) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi encontrado nenhum Funcionario",
          employee: 0,
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Funcionarios carregados com sucesso",
          employee: allEmployee,
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async getEmployeeCod() {
    try {
      const codEmployee = await EmployeeModelInstance.getNextCodEmployee();

      if (codEmployee === undefined || codEmployee === 0) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Funcionario Não encontrado",
          employeeCod: codEmployee + 1,
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          employeeCod: codEmployee.idEmployee + 1,
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async getEmployeeByCPF(docEmployee) {
    try {
      const findEmployee = await EmployeeModelInstance.getEmployeeByCPF(
        docEmployee
      );
      if (!findEmployee) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Funcionario Não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Funcionario encontrado com sucesso",
          employee: findEmployee,
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async getEmployeeById(idEmployee) {
    try {
      const findEmployee = await EmployeeModelInstance.getEmployeeById(
        idEmployee
      );
      if (!findEmployee) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Funcionario Não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Funcionario encontrado com sucesso",
          employee: findEmployee,
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async createEmployee(dataEmployee) {
    try {
      const newEmployee = dataEmployee;
      const findEmployeeId = await this.getEmployeeById(newEmployee.idEmployee);

      if (findEmployeeId.codeStatus !== 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 409,
          message: "Funcionario já cadastrado",
        });
      } else {
        const createEmployee = await EmployeeModelInstance.newEmployee(
          newEmployee
        );

        if (createEmployee) {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Funcionario Cadastrado com sucesso",
          };
        }
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async updateEmployee(idEmployee, dataEmployee) {
    try {
      const updateEmployeeInfo = dataEmployee;

      updateEmployeeInfo.dateUpdate = FormatDate.getDateNoHour();
      updateEmployeeInfo.dateAdmission = FormatDate.formatDateNoHour(
        updateEmployeeInfo.dateAdmission
      );

      const upEmployee = await EmployeeModelInstance.updateEmployee(
        idEmployee,
        updateEmployeeInfo
      );

      if (!upEmployee) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Funcionario não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Funcionario Atualizado com sucesso",
        };
      }
    } catch (err) {
      console.log(err)
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async deleteEmployee(idEmployee) {
    try {
      const downEmployee = await EmployeeModelInstance.deleteEmployee(
        idEmployee
      );
      if (downEmployee.codeStatus === 500) {
        if (downEmployee.info.code === "23503") {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 423,
            message:
              "Esse Funcionario possui pedidos com seu nome e não pode ser apagado",
          };
        }
      }
      if (!downEmployee) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Funcionario não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Funcionario Apagado com sucesso",
          employee: downEmployee,
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
}
