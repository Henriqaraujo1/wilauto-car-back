import createHttpError from "http-errors";
import ProviderModel from "../models/providerModel.mjs";
const ProviderModelInstance = new ProviderModel();

export default class ProviderService {
  //GET Fornecedor pelo CNPJ
  async getProvider(idProvider) {
    try {
      const cnpjProvider = idProvider;
      const findProviderId = await ProviderModelInstance.getProvider(
        cnpjProvider
      );

      if (!findProviderId) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Fornecedor não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          provider: findProviderId,
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
  //Get busca fornecedor pelo ID
  async getProviderById(idProvider) {
    try {
      const findProviderId = await ProviderModelInstance.getProviderById(
        idProvider
      );

      if (!findProviderId) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Fornecedor não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Fornecedor encontrado com sucesso",
          provider: findProviderId,
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

  //GET Busca todos os Fornecedores
  async getAllProviders() {
    try {
      const allProviders = await ProviderModelInstance.getAllProvider();

      if (!allProviders) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Erro ao carregar fornecedores",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Fornecedores carregado com sucesso",
          provider: allProviders,
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

  //POST Cria um novo provedor
  async createProvider(dataProvider) {
    try {
      const newProvider = dataProvider;
      // Testar essa funcionalidade
      const findProvider = await this.getProvider(newProvider.cnpj);
      if (findProvider.codeStatus !== 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 409,
          message: `Fornecedor ja criado com esse CNPJ`,
        });
      } else {
        const createProvider = await ProviderModelInstance.createProvider(
          newProvider
        );
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Fornecedor criado com sucesso",
          provider: createProvider,
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

  //PUT Atualiza um fornecedor
  async updateProvider(idProvider, dataProvider) {
    try {
      const upProvider = await ProviderModelInstance.updateProvider(
        idProvider,
        dataProvider
      );

      if (!upProvider) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Fornecedor não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Fornecedor atualizado com sucesso",
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

  //DELETE um fornecedor já existente
  async deleteProvider(idProvider) {
    try {
      const downProvider = await ProviderModelInstance.deleteProvider(
        idProvider
      );
      if (downProvider.codeStatus === 500) {
        if (downProvider.info.code === "23503") {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 423,
            message:
              "Esse fornecedor possui pedidos com seu nome e não pode ser apagado",
          };
        }
      }
      if (!downProvider) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Fornecedor não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Fornecedor apagado com sucesso",
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
