import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class EmployeeModel {
  async getAllEmployee() {
    try {
      const statement = `SELECT * FROM employee ORDER BY "idEmployee" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getNextCodEmployee() {
    try {
      const statement = `SELECT "idEmployee" FROM employee ORDER BY "idEmployee" DESC LIMIT 1`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows[0];
      } else {
        return 0;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  async getEmployeeById(idEmployee) {
    try {
      const employeeId = [idEmployee];
      const statement = `SELECT * FROM employee WHERE "idEmployee" = ($1)`;
      const response = await client.query(statement, employeeId);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getEmployeeByCPF(docEmployee) {
    try {
      const employeeId = [docEmployee];
      const statement = `SELECT * FROM employee WHERE cpf = ($1)`;
      const response = await client.query(statement, employeeId);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async newEmployee(dataEmployee) {
    try {
      const value = dataEmployee;
      const statement = pgPromise.helpers.insert(value, null, "employee");
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async updateEmployee(idEmployee, data) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idEmployee" = ${idEmployee}`
      );

      const statement =
        pgPromise.helpers.update(data, null, "employee") + condition;
      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async deleteEmployee(idEmployee) {
    try {
      const statement = `DELETE FROM employee WHERE "idEmployee" = ${idEmployee}`;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
