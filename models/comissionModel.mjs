import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class ComissionModel {
  async getAllComission() {
    try {
      const statement = `SELECT * FROM comission ORDER BY "idComission" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getIdComission(idComission) {
    try {
      const comissionId = [idComission];
      const statement = `SELECT * FROM comission WHERE "idComission" = ($1)`;
      const response = await client.query(statement, comissionId);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getComissionByOrder(idComission) {
    try {
      const comissionId = [idComission];
      const statement = `SELECT * FROM comission WHERE "idOrder" = ($1)`;
      const response = await client.query(statement, comissionId);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async createComission(dataComission) {
    try {
      const value = dataComission;
      const statement = pgPromise.helpers.insert(value, null, "comission");
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getComissionByEmployee(idEmployee) {
    try {
      const employeeId = [idEmployee];
      const statement = `SELECT * FROM comission WHERE "idEmployee" = ($1)`;
      const response = await client.query(statement, employeeId);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async updateComissions(data) {
    try {
      const infoComission = data.length;
      let countUpComission = 0;
      for (const group of data) {
        const { datePayment, idComission, statusPayment } = group;

        // Verificar se existem IDs para atualizar
        if (!idComission.length) continue;

        // Montar a cláusula WHERE com IN
        const condition = pgPromise.as.format(
          ` WHERE "idComission" IN ($1:list)`,
          [idComission]
        );

        // Construir a instrução de atualização
        const columnSet = new pgPromise.helpers.ColumnSet(
          ["statusPayment", "datePayment"],
          { table: "comission" }
        );

        const updateData = {
          statusPayment,
          datePayment,
        };

        const statement =
          pgPromise.helpers.update(updateData, columnSet) + condition;

        // Executar a consulta
        const response = await client.query(statement);

        if (response.rowCount > 0) {
          countUpComission++;
        }
      }

      if(countUpComission === infoComission) {
        return true
      }
    } catch (err) {
      console.error("Erro ao atualizar as comissões:", err);
      throw createHttpError({ codeStatus: 500, info: err });
    }
  }
}
