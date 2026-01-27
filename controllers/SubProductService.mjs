import createHttpError from "http-errors";
import StockService from "./StockService.mjs";
import SubProductModel from "../models/subProductModel.mjs";
const SubProductModelInstance = new SubProductModel();

export default class SubProductService {
  async createSubProduct(dataSubProduct) {
    try {
      const newSubProduct = dataSubProduct;
      const findSubProduct = await this.getCodSubProduct(
        newSubProduct.codSubProd
      );
      if (findSubProduct.codeStatus !== 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 409,
          message: "Produto já cadastrado com esse codigo de barra",
        });
      } else {
        const product = await SubProductModelInstance.createSubProduct(
          newSubProduct
        );

        if (product) {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "O Produto cadastrado com sucesso",
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

  // ! - Corrigir o nome dessa função
  async getCodSubProduct(codSubProduct) {
    try {
      const productCod = codSubProduct;

      const getCodSubProduct = await SubProductModelInstance.getCodProduct(
        productCod
      );

      if (getCodSubProduct === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto não encontrado",
        });
      } else {
        // const StockServiceInstance = new StockService();
        // const qtdStockNow = await StockServiceInstance.get(
        //   getCodSubProduct
        // );

        // if (qtdStockNow.codeStatus === 200) {
        //   getCodSubProduct.qtdNow = qtdStockNow.productStock.totalQtd;
        // } else {
        //   getCodSubProduct.qtdNow = 0;
        // }
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto encontrado com sucesso",
          product: getCodSubProduct,
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

  async getSubProductByIdProduct(idSubProduct) {
    try {
      const productId = idSubProduct;
      const getSubProductByProduct =
        await SubProductModelInstance.getSubProductByIdProduct(productId);

      if (getSubProductByProduct === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto encontrado com sucesso",
          subProduct: getSubProductByProduct,
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

  async getSubProductByName(nameSubProduct) {
    try {
      const productInfo = nameSubProduct;
      let getNameProduct = await SubProductModelInstance.getProductByName(
        productInfo
      );

      if (getNameProduct === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto encontrado com sucesso",
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

  async getNewCodSubProduct() {
    try {
      const getCodSubProduct = await SubProductModelInstance.getNextCodProd();

      if (getCodSubProduct === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Novo codigo não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Codigo encontrado com sucesso",
          newCodSubProduct: getCodSubProduct.codSubProd + 1,
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

  async updateSubProduct(idSubProduct, dataSubProduct) {
    try {
      const upSubProduct = await SubProductModelInstance.updateSubProduct(
        idSubProduct,
        dataSubProduct
      );

      if (!upSubProduct) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto atualizado com sucesso",
          subProduct: upSubProduct,
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
