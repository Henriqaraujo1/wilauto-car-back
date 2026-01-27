import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class BudgetModel {
  async updateBudget(dataBudget) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idBudget"=${dataBudget.idBudget} RETURNING *`
      );
      const values = dataBudget;
      const statement =
        pgPromise.helpers.update(
          values,
          [
            "valueDiscount",
            "dateCreated",
            "idClient",
            "idDeliveryBudgets",
            "discountOption",
            "formPayment",
            "valueChange",
            "valueClientPayed",
            "valueDelivery",
            "valueWithDiscount",
            "valueNoDiscount",
            "statusBudget",
            "idEmployee",
            "qtdItens",
            // "percentDiscount",
          ],
          "budgetOrders"
        ) + condition;
      const response = await client.query(statement);

      if (response.rowCount > 0) {
        return { codeStatus: 200, budget: response.rows[0] };
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  async createDeliveryBudget(dataDelivery) {
    try {
      const value = dataDelivery;
      const statement =
        pgPromise.helpers.insert(
          value,
          [
            "idClient",
            "idBudget",
            "city",
            "complement",
            "district",
            "localNumber",
            "state",
            "street",
            "valueDelivery",
            "dateCreated",
          ],
          "deliveryBudget"
        ) + "RETURNING *";
      const response = await client.query(statement);

      if (response.rowCount > 0) {
        return response.rows[0];
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  async createBudgetsOutStock(infoProduct) {
    try {
      const value = infoProduct;
      const statement = pgPromise.helpers.insert(
        value,
        ["idBudget", "dateCreated", "qtdSell", "idProduct", "oldQtdStock"],
        "orderStock"
      );
      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  async updateBudgetStatus(dataBudget) {
    try {
      const idBudget = dataBudget.idBudget;
      const condition = pgPromise.as.format(` WHERE "idBudget" = ${idBudget}`);

      const statement =
        pgPromise.helpers.update(dataBudget, null, "budgetOrders") + condition;
      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getBudgetByClient(idClient) {
    try {
      const statement = `SELECT * FROM "budgetOrders" WHERE "idClient" = ${idClient} ORDER BY "idBudget"`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  async getBudgetById(idBudget) {
    try {
      const statement = `SELECT * FROM "budgetOrders" WHERE "idBudget" = ${idBudget} ORDER BY "idBudget"`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }
  async getBudgetMultiIds(idBudget) {
    try {
      const infoBudgets = idBudget.join(",");
      const statement = `SELECT * FROM "budgetOrders" WHERE "idBudget" IN (${infoBudgets}) ORDER BY "idBudget"`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  /**
   * Para selecionar o ultimo pedido do client
   *  SELECT * FROM tabela ORDER BY id DESC LIMIT 1
   */
  async getLastBudgetByClient(idClient) {
    try {
      const statement = `SELECT * FROM "budgetOrders" WHERE "idClient" = ${idClient} ORDER BY "idBudget" DESC LIMIT 1`;
      const response = await client.query(statement);
      if (response.rows) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  async getAllBudgets() {
    try {
      const statement = `SELECT * FROM "budgetOrders" ORDER BY "idBudget" ASC`;
      const response = await client.query(statement);

      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  async getBudgetsByPayment() {
    try {
      const statement = `SELECT * FROM "budgetOrders" ORDER BY "formPayment" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  async startBudget(infoBudget) {
    try {
      const value = infoBudget;
      const statement =
        pgPromise.helpers.insert(
          value,
          ["idBudget", "statusBudget"],
          "budgetOrders"
        ) + "RETURNING *";
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  async getNextBudgetNumber() {
    try {
      const statement = `SELECT "idBudget" FROM "budgetOrders" ORDER BY "idBudget" DESC LIMIT 1`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }

  async updateBudgetByClient(idClient, idBudget) {
    try {
      const condition = pgPromise.as.format(' WHERE "idBudget" = $1', [
        idBudget,
      ]);

      const statement =
        pgPromise.helpers.update({ idClient }, ["idClient"], "budgetOrders") +
        condition;
      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
