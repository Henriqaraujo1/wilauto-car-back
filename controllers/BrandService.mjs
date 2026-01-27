//import packages
import createHttpError from "http-errors";
import BrandModel from "../models/brandModel.mjs";

// Brand model instance
const BrandModelInstance = new BrandModel();

export default class BrandService {
  //Get Id da Categoria do Produto
  async getBrandId(idBrand) {
    try {
      const findBrand = await BrandModelInstance.getBrandById(idBrand);
      if (!findBrand) {
        return createHttpError({
          codeStatus: 404,
          message: "Categoria do Produto não encontrada",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Categoria do Produto encontrada",
          brand: findBrand,
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
  //Get Name da Categoria do Produto
  async getNameBrand(nameBrand) {
    try {
      const findBrand = await BrandModelInstance.getBrandInfo(
        nameBrand.toLowerCase()
      );

      if (!findBrand) {
        return createHttpError({
          codeStatus: 404,
          message: "Categoria do Produto não encontrada",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Categoria do Produto encontrada",
          brand: findBrand,
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
  //Get todos os Categoria do Produtos
  async getAllBrand() {
    try {
      const allBrands = await BrandModelInstance.getAllBrand();
      if (!allBrands) {
        return createHttpError({
          codeStatus: 404,
          message: "Erro ao carregar todos os Categoria do Produtos",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Todos os Categoria do Produtos foram carregadas",
          brands: allBrands,
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
  //POST uma nova Categoria do Produto
  async createBrand(dataBrand) {
    try {
      const newBrand = dataBrand;
      const getBrand = await BrandModelInstance.getBrandInfo(newBrand);
      if (getBrand !== undefined) {
        return createHttpError({
          codeStatus: 403,
          message: "Categoria do Produto ja cadastrada",
        });
      } else {
        const createBrand = await BrandModelInstance.createBrand(newBrand);
        return {
          codeStatus: 200,
          message: "Categoria do Produto Cadastrada com sucesso",
          brand: createBrand,
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
  //Atualiza uma Categoria do Produto
  async updateBrand(idBrand, dataBrand) {
    try {
      const upBrand = await BrandModelInstance.updateBrand(dataBrand);
      if (!upBrand) {
        return createHttpError({
          codeStatus: 404,
          message: "Categoria do Produto não encontrado",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Categoria do Produto atualizado com sucesso",
          brand: upBrand,
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
  //Deleta uma Categoria do Produto
  async deleteBrand(idBrand) {
    try {
      const downBrand = await BrandModelInstance.deleteBrand(idBrand);
      if (downBrand.codeStatus === 500) {
        if (downBrand.info.code === "23503") {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 423,
            message:
              "Essa Categoria do Produto possui produtos com sua Categoria do Produto e não pode ser apagada",
          };
        }
      }
      if (!downBrand) {
        return createHttpError({
          codeStatus: 404,
          message: "Categoria do Produto não encontrada",
        });
      } else {
        return {
          codeStatus: 200,
          message: "A Categoria do Produto foi deletada",
          brand: downBrand,
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
