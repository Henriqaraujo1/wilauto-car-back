import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class DeliveryProvider {
  async getNameDelivery(infoDistrict, infoCity) {
    try {
      const statement = `SELECT * FROM "deliveryPrices" WHERE "districtName" = $1 AND "cityName" = $2`;
      const districtName = infoDistrict;
      const cityName = infoCity;
      const response = await client.query(statement, [districtName, cityName]);
      if (response.rowCount > 0) {
        return response.rows[0];
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getDeliveryByIdOrder(idOrder) {
    try {
      const statement = `SELECT * FROM "deliveryOrders" WHERE "idOrder" = $1 ORDER BY "idDeliveryOrder"`;
      const response = await client.query(statement, [idOrder]);
      if (response.rowCount > 0) {
        return response.rows[0];
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getAllDelivery() {
    try {
      const statement = `SELECT * FROM "deliveryPrices" ORDER BY "idDelivery" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async createDelivery(dataDelivery) {
    try {
      const value = dataDelivery;
      const statement =
        pgPromise.helpers.insert(value, null, "deliveryPrices") + "RETURNING *";
      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async updateDelivery(idDelivery, data) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idDelivery" = ${idDelivery}`
      );
      const statement =
        pgPromise.helpers.update(data, null, "deliveryPrices") + condition;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async deleteDelivery(idDelivery) {
    try {
      const statement = `DELETE FROM "deliveryPrices" WHERE "idDelivery" = ${idDelivery}`;
      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
