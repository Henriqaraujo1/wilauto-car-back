import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class ReceiveModel {
  // Testar essa chamada
  async getReceiveByOrder(idOrder) {
    try {
      const statement = `SELECT * FROM "orderPayment" WHERE "idOrder" = $1 ORDER BY "idOrderPayment" ASC`;
      const response = await client.query(statement, [idOrder]);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, message: err });
    }
  }

    async updateReceive(idOrderPayment, data) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idOrderPayment" = ${idOrderPayment}`
      );
      const statement =
        (await pgPromise.helpers.update(data, null, "orderPayment")) + condition;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, message: err });
    }
  }

  // async getTypeReceive(TypeReceive) {
  //   try {
  //     const value = TypeReceive;
  //     const statement = "SELECT * FROM "orderPayment" WHERE type = $1";
  //     const response = await client.query(statement, value);
  //     if (response.rows) {
  //       return response.rows[0];
  //     }
  //   } catch (err) {
  //     return createHttpError({ codeStatus: 500, message: err });
  //   }
  // }
  // //Testar essa outra chamada
  // async getReceiveByReceiver(NameReceiver) {
  //   try {
  //     const value = NameReceiver;
  //     const statement = "SELECT * FROM "orderPayment" WHERE name_receiver = $1";
  //     const response = await client.query(statement, value);
  //     if (response.rows) {
  //       return response.rows[0];
  //     }
  //   } catch (err) {
  //     return createHttpError({ codeStatus: 500, message: err });
  //   }
  // }
  // async getAllReceive() {
  //   try {
  //     const statement = `SELECT * FROM "orderPayment" ORDER BY "idOrderPayment" ASC`;
  //     const response = await client.query(statement);
  //     if (response.rowCount > 0) {
  //       return response.rows;
  //     } else {
  //       return false;
  //     }
  //   } catch (err) {
  //     return createHttpError({ codeStatus: 500, message: err });
  //   }
  // }

  // async getReceiveByProvider(idProvider) {
  //   try {
  //     const statement = `SELECT * FROM "orderPayment" WHERE "idProvider" = $1`;
  //     const response = await client.query(statement, [idProvider]);
  //     if (response.rowCount > 0) {
  //       return response.rows;
  //     } else {
  //       return false;
  //     }
  //   } catch (err) {
  //     return createHttpError({ codeStatus: 500, message: err });
  //   }
  // }

  // async getReceiveByDueDate(dataReceive) {
  //   try {
  //     const statement = `SELECT * FROM "orderPayment" WHERE "dueDate" = $1 AND value = $2 AND type = $3`;
  //     const dueDate = dataReceive.dueDate;
  //     const value = dataReceive.value;
  //     const type = dataReceive.type;
  //     const response = await client.query(statement, [dueDate, value, type]);

  //     return response.rowCount > 0;
  //   } catch (err) {
  //     return createHttpError(500, err);
  //   }
  // }

  // async createReceive(dataReceive) {
  //   try {
  //     const data = dataReceive;
  //     const statement = pgPromise.helpers.insert(
  //       data,
  //       [
  //           "dateCreated",
  //           "idOrder",
  //           "receiptDate",
  //           "dateUpdate",
  //           "value",
  //           "status",
  //           "idClient",
  //           "formPayment",
  //           "description",
  //       ],
  //       "orderPayment"
  //     );
  //     const response = await client.query(statement);
  //     return response.rowCount > 0;
  //   } catch (err) {
  //     return createHttpError({ codeStatus: 500, err });
  //   }
  // }

  // async deleteReceive(idOrderPayment) {
  //   try {
  //     const statement = `DELETE FROM "orderPayment" WHERE "idOrderPayment" = ${idOrderPayment}`;
  //     const response = await client.query(statement);
  //     return response.rowCount > 0;
  //   } catch (err) {
  //     return createHttpError({ codeStatus: 500, message: err });
  //   }
  // }
}
