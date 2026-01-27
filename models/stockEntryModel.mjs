import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class StockEntryModel {
  async createEntryProduct(dataProduct) {
    try {
      const value = dataProduct;
      const statement =
        pgPromise.helpers.insert(
          value,
          [
            "qtdItems",
            "priceTotal",
            "dateEntry",
            "idProvider",
            "statusDelivery",
            "valueDelivery",
            "typeOperation",
          ],
          "stockEntry"
        ) + "RETURNING *";
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return { create: true, data: response.rows[0] };
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

  async startStockEntry(infoStockEntry) {
    try {
      const value = infoStockEntry;
      const statement =
        pgPromise.helpers.insert(
          value,
          ["idStockEntry", "statusStock", "idProvider"],
          "stockEntry"
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

  async createRegisterEntry(dataEntry) {
    try {
      const value = dataEntry;
      const statement =
        pgPromise.helpers.insert(
          value,
          [
            "dateEntry",
            "idStockEntry",
            "qtd",
            "priceUnit",
            "priceTotal",
            "idProduct",
            "valueDolar"
          ],
          "registerEntry"
        ) + "RETURNING *";
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

  async getAllEntryStockDetail() {
    try {
      const statement = `SELECT * FROM "registerEntry" ORDER BY "idStockEntry" ASC`;
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
  async getAllEntryStock() {
    try {
      const statement = `SELECT * FROM "stockEntry" ORDER BY "idStockEntry" ASC`;
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
  async getProductEntryId(idProduct) {
    try {
      const statement = `SELECT * FROM "registerEntry" WHERE "idProduct" = ($1) ORDER BY "idRegisterEntry" ASC`;
      const codProduct = [idProduct];
      const response = await client.query(statement, codProduct);

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
  async getIdStockEntryByStockEntry(orderEntry) {
    try {
      const statement = `SELECT "idStockEntry", "idProduct" FROM "stockEntry" WHERE "orderStockEntry" = ($1)`;
      const order = [orderEntry];
      const response = await client.query(statement, order);
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

  async getStockEntryByProvider(idProvider) {
    try {
      const statement = `SELECT * FROM "stockEntry" WHERE "idProvider" = ${idProvider} ORDER BY "idStockEntry"`;
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

  async getInfoIdStock(idStockEntry) {
    try {
      const statement = `SELECT "idStockEntry" FROM "stockEntry" WHERE "idStockEntry" = ${idStockEntry}`;
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

  async getLastStockEntryByProvider(idProvider) {
    try {
      const statement = `SELECT * FROM "stockEntry" WHERE "idProvider" = ${idProvider} ORDER BY "idStockEntry" DESC LIMIT 1`;
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

  async getItemsByStockEntry(idStockEntry) {
    try {
      const statement = `SELECT * FROM "registerEntry" WHERE "idStockEntry" = ${idStockEntry}`;
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

  async getItemsByIdStock(idProduct) {
    try {
      const statement = `SELECT "idStockEntry" FROM "registerEntry" WHERE "idProduct" = ${idProduct}`;
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

  async updateProductEntry(idStockEntry, data) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idStockEntry" = ${idStockEntry}`
      );
      const statement =
        pgPromise.helpers.update(data, null, "stockEntry") + condition;
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
  async updateRegisterEntry(idStockEntry, data) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idStockEntry" = ${idStockEntry}`
      );
      const statement =
        pgPromise.helpers.update(data, null, "registerEntry") + condition;
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

  async deleteProductEntry(idProduct) {
    try {
      const statement = `DELETE FROM stockEntry WHERE id_product = ${idProduct} RETURNING *`;
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
}
