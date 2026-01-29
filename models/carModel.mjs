import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class CarModel {
  async createCar(dataCar) {
    try {
      const value = dataCar;
      const statement = pgPromise.helpers.insert(value, null, "car");
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return true;
      }
    } catch (err) {
      createHttpError(500, err);
    }
  }
  async getCarPlate(infoCar) {
    try {
      const statement = `SELECT * FROM car WHERE "carPlate" = ($1)`;
      const carPlate = [infoCar];
      const response = await client.query(statement, carPlate);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getCarByIdClient(infoCar) {
    try {
      const statement = `SELECT * FROM car WHERE "idClient" = ($1) ORDER BY "idCar" ASC`;
      const idClient = [infoCar];
      const response = await client.query(statement, idClient);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getChecklistCar(infoCar) {
    try {
      const statement = `SELECT * FROM car WHERE "idCar" = ($1)`;
      const carId = [infoCar];
      const response = await client.query(statement, carId);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getAllCar() {
    try {
      const statement = `SELECT * FROM product ORDER BY "idCar" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getNextCodProd() {
    try {
      const statement = `SELECT "codSubProd" FROM car ORDER BY "idCar" DESC LIMIT 1`;
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

  async updateCar(idCar, dataCar) {
    try {
      const condition = pgPromise.as.format(` WHERE "idCar" = ${idCar}`);
      const statement =
        pgPromise.helpers.update(dataCar, null, "car") + condition;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  // async deleteCar(idCaruct) {
  //   try {
  //     const statement = `DELETE FROM car WHERE "idCar" = ${idCaruct}`;
  //     const response = await client.query(statement);
  //     return response.rowCount > 0;
  //   } catch (err) {
  //     return createHttpError({ codeStatus: 500, info: err });
  //   }
  // }
}
