import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class OrderModel {
  async updateOrder(dataOrder) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idOrder"=${dataOrder.idOrder} RETURNING *`
      );
      const values = dataOrder;
      const statement =
        pgPromise.helpers.update(
          values,
          [
            "valueDiscount",
            "dateCreated",
            "idClient",
            "idDeliveryOrders",
            "discountOption",
            "valueChange",
            "valueClientPayed",
            "valueDelivery",
            "valueWithDiscount",
            "valueNoDiscount",
            "statusOrder",
            "qtdItens",
            "formPayment",
            "percentDiscount",
          ],
          "orders"
        ) + condition;
      const response = await client.query(statement);

      if (response.rowCount > 0) {
        return { codeStatus: 200, order: response.rows[0] };
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

  async createDeliveryOrder(dataDelivery) {
    try {
      const value = dataDelivery;
      const statement =
        pgPromise.helpers.insert(
          value,
          [
            "idClient",
            "idOrder",
            "city",
            "complement",
            "district",
            "localNumber",
            "state",
            "street",
            "valueDelivery",
            "dateCreated",
            "cep",
          ],
          "deliveryOrders"
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

  async createOrdersOutStock(infoProduct) {
    try {
      const value = infoProduct;
      const statement = pgPromise.helpers.insert(
        value,
        ["idOrder", "dateCreated", "qtdSell", "codProd", "oldQtdStock"],
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

  async createFormPayment(infoPayment) {
    try {
      const value = infoPayment;
      const statement =
        pgPromise.helpers.insert(
          value,
          [
            "dateCreated",
            "idOrder",
            "receiptDate",
            "dateUpdated",
            "value",
            "status",
            "idClient",
            "formPayment",
            "description",
          ],
          "orderPayment"
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

  async updateOrderItem(data) {
    try {
      const condition = pgPromise.as.format(
        "WHERE id_orders={id} RETURNING *",
        {
          id: this.id_orders,
        }
      );
      const statement =
        pgPromise.helpers.update(data, null, "orders") + condition;
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

  async getOrderByClient(idClient) {
    try {
      const statement = `SELECT * FROM orders WHERE "idClient" = ${idClient} ORDER BY "idOrder"`;
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

  async getOrderById(idOrder) {
    try {
      const statement = `SELECT * FROM orders WHERE "idOrder" = ${idOrder} ORDER BY "idOrder"`;
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
  async getOrderMultiIds(idOrder) {
    try {
      const infoOrders = idOrder.join(",");
      const statement = `SELECT * FROM orders WHERE "idOrder" IN (${infoOrders}) ORDER BY "idOrder"`;
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
  async getLastOrderByClient(idClient) {
    try {
      const statement = `SELECT * FROM orders WHERE "idClient" = ${idClient} ORDER BY "idOrder" DESC LIMIT 1`;
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

  async getAllOrders() {
    try {
      const statement = `SELECT * FROM orders ORDER BY "idOrder" ASC`;
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

  async getOrdersByPayment() {
    try {
      const statement = `SELECT * FROM "orderPayment" ORDER BY "formPayment" ASC`;
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

  async startOrder(infoOrder) {
    try {
      const value = infoOrder;
      const statement =
        pgPromise.helpers.insert(value, ["idOrder", "statusOrder"], "orders") +
        "RETURNING *";
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

  async getNextOrderNumber() {
    try {
      const statement = `SELECT "idOrder" FROM orders ORDER BY "idOrder" DESC LIMIT 1`;
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
}
