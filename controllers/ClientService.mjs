import createHttpError from "http-errors";
import ClientModel from "../models/clientModel.mjs";
const ClientModelInstance = new ClientModel();

export default class ClientService {
  //GET Busca um client baseado no ID
  async getClientInfo(docClient) {
    try {
      const findClient = await ClientModelInstance.getClientByDoc(docClient);
      if (!findClient) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Cliente Não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Cliente encontrado com sucesso",
          client: findClient,
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

  async getClientById(idClient) {
    try {
      const findClientById = await ClientModelInstance.getClientId(idClient);

      if (!findClientById) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Cliente Não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Cliente encontrado com sucesso",
          client: findClientById,
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

  //GET Busca todos os clientes
  async getAllClient() {
    try {
      const allClients = await ClientModelInstance.getAllClient();
      if (!allClients) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi encontrado nenhum Cliente",
          client: 0,
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Clientes carregados com sucesso",
          client: allClients,
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

  //POST Cria um novo cliente
  async createClient(dataClient) {
    try {
      const newClient = dataClient;
      const findClientId = await this.getClientInfo(newClient.docClient);
      if (findClientId.codeStatus !== 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 409,
          message: "Cliente já cadastrado",
        });
      } else {
        const createClient = await ClientModelInstance.createClient(newClient);
        console.log(createClient)
        if (createClient) {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Cliente Cadastrado com sucesso",
          };
        }
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async updateClient(idClient, dataClient) {
    try {
      const upClient = await ClientModelInstance.updateClient(
        idClient,
        dataClient
      );

      if (!upClient) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Cliente não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Cliente Atualizado com sucesso",
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
  async deleteClient(idCLient) {
    try {
      const downClient = await ClientModelInstance.deleteClient(idCLient);
      if (downClient.codeStatus === 500) {
        if (downClient.info.code === "23503") {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 423,
            message:
              "Esse cliente possui pedidos com seu nome e não pode ser apagado",
          };
        }
      }
      if (!downClient) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Cliente não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Cliente Apagado com sucesso",
          client: downClient,
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
