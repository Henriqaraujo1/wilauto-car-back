import createHttpError from "http-errors";
import carModel from "../models/carModel.mjs";
const CarModelInstance = new carModel();

export default class CarService {
  async createCar(dataCar) {
    try {
      const newCar = dataCar;
      const findCar = await this.getCarPlate(newCar.carPlate);
      if (findCar.codeStatus !== 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 409,
          message: "Carro já cadastrado com esse codigo de barra",
        });
      } else {
        const product = await CarModelInstance.createCar(newCar);

        if (product) {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "O Carro cadastrado com sucesso",
          };
        }
      }
    } catch (err) {
      return createHttpError({
        errorStatus: true,
        successStatus: false,
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getCarPlate(carPlate) {
    try {
      const plateCar = carPlate;

      const getCodCar = await CarModelInstance.getCarPlate(plateCar);

      if (getCodCar === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Carro não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Carro encontrado com sucesso",
          car: getCodCar,
        };
      }
    } catch (err) {
      return createHttpError({
        errorStatus: true,
        successStatus: false,
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getCheckListCar(idCar) {
    try {
      const infoCar = idCar;
      let getNameProduct = await CarModelInstance.getChecklistCar(infoCar);

      if (getNameProduct === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Carro não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Carro encontrado com sucesso",
          subProduct: getNameProduct,
        };
      }
    } catch (err) {
      return createHttpError({
        errorStatus: true,
        successStatus: false,
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async getCarByIdClient(idClient) {
    try {
      const infoCar = idClient;
      let getCarsByClient = await CarModelInstance.getCarByIdClient(infoCar);

      if (getCarsByClient === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Carro não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Carros encontrados com sucesso",
          cars: getCarsByClient,
        };
      }
    } catch (err) {
      return createHttpError({
        errorStatus: true,
        successStatus: false,
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async updateCar(idCar, dataCar) {
    try {
      const upCar = await CarModelInstance.updateCar(idCar, dataCar);

      if (!upCar) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Carro não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Carro atualizado com sucesso",
          car: upCar,
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
