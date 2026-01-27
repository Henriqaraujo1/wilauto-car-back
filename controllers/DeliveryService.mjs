import createHttpError from "http-errors";
import DeliveryModel from "../models/deliveryModel.mjs";
import ClientService from "./ClientService.mjs";
const DeliveryModelInstance = new DeliveryModel();
const ClientServiceInstance = new ClientService();

export default class DeliveryService {
  async getIdDelivery(dataDelivery) {
    try {
      const districtName = dataDelivery.districtName;
      const cityName = dataDelivery.cityName;

      const findDistrict = await DeliveryModelInstance.getNameDelivery(
        districtName,
        cityName
      );

      if (!findDistrict) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Endereço não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Bairro carregado com sucesso",
          districtDelivery: findDistrict,
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
  async getAllDelivery() {
    try {
      const findAllDistrict = await DeliveryModelInstance.getAllDelivery();
      if (!findAllDistrict) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi encontrado nenhum endereço",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Endereços carregados com sucesso",
          allDeliverys: findAllDistrict,
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

  async getDeliveryByOrder(idOrder) {
    try {
      const findDelivery = await DeliveryModelInstance.getDeliveryByIdOrder(
        idOrder
      );

      const infoClient = await ClientServiceInstance.getClientById(
        findDelivery.idClient
      );

      if (infoClient.codeStatus === 200) {
        findDelivery.nameClient =
          infoClient.client.clientName + " " + infoClient.client.lastName;
      }

      if (!findDelivery) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Endereço não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Bairro carregado com sucesso",
          delivery: findDelivery,
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

  async createDelivery(dataDelivery) {
    try {
      const newDistrict = dataDelivery;
      const findDistrict = await this.getIdDelivery(newDistrict);
      if (findDistrict.codeStatus !== 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 409,
          message: "Endereço já cadastrado",
        });
      } else {
        const createDistrict = await DeliveryModelInstance.createDelivery(
          newDistrict
        );
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Endereço criado com sucesso",
          newDistrict: createDistrict,
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
  async updateDelivery(idDelivery, data) {
    try {
      const upDistrict = await DeliveryModelInstance.updateDelivery(
        idDelivery,
        data
      );
      if (!upDistrict) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Endereço não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Endereço Atualizado com sucesso",
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
  async deleteDelivery(idDelivery) {
    try {
      const downDistrict = await DeliveryModelInstance.deleteDelivery(
        idDelivery
      );
      if (downDistrict.codeStatus === 500) {
        if (downDistrict.info.code === "23503") {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 423,
            message:
              "Esse cliente possui pedidos com seu nome e não pode ser apagado",
          };
        }
      }
      if (!downDistrict) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Endereço não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Endereço apagado com sucesso",
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
