import createHttpError from "http-errors";
import BrandService from "./BrandService.mjs";
import StockService from "./StockService.mjs";
import ProductModel from "../models/productModel.mjs";
import SubProductModel from "../models/subProductModel.mjs";

const ProductModelInstance = new ProductModel();
const SubProductModelInstance = new SubProductModel();
const BrandServiceInstance = new BrandService();

export default class ProductService {
  async createProduct(dataProduct) {
    try {
      const newProduct = dataProduct;
      const findProduct = await this.getCodProduct(newProduct.codProd);

      if (findProduct.codeStatus !== 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 409,
          message: "Produto já cadastrado com esse codigo de barra",
        });
      } else {
        const product = await ProductModelInstance.createProduct(newProduct);

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

  // ! - Melhor função para utilizar para buscar produto e sub-produto
  async getCodProduct(codProduct) {
    try {
      const productCod = codProduct;
      let infoProduct = false;

      let getCodProduct = await ProductModelInstance.getCodProduct(productCod);

      if (getCodProduct === undefined) {
        getCodProduct = await SubProductModelInstance.getCodProduct(productCod);
      }

      if (getCodProduct === undefined) {
        infoProduct = true;
      }

      if (infoProduct) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto não encontrado",
        });
      } else {
        const StockServiceInstance = new StockService();
        const qtdStockNow = await StockServiceInstance.getProductIdStock(
          getCodProduct
        );

        if (qtdStockNow.codeStatus === 200) {
          getCodProduct.qtdNow = qtdStockNow.productStock.totalQtd;
        } else {
          getCodProduct.qtdNow = 0;
        }
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto encontrado com sucesso",
          product: getCodProduct,
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
  async getProductById(idProduct) {
    try {
      const productId = idProduct;
      const getIdProduct = await ProductModelInstance.getProductById(productId);
      if (getIdProduct === undefined) {
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
          product: getIdProduct,
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
  async getProductByCod(codProd) {
    try {
      const productCod = codProd;
      const getCodProduct = await ProductModelInstance.getCodProduct(
        productCod
      );

      if (getCodProduct === undefined) {
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
          product: getCodProduct,
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
  async getProductByName(nameProduct) {
    try {
      const productInfo = nameProduct;
      let getIdProduct = {};
      if (productInfo.hasOwnProperty("nameProduct")) {
        getIdProduct = await ProductModelInstance.getProductByName(
          productInfo.nameProduct.toLowerCase()
        );
      } else if (productInfo.hasOwnProperty("codProduct")) {
        getIdProduct = await ProductModelInstance.getCodProduct(
          productInfo.codProduct
        );
      }

      if (getIdProduct === undefined) {
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
          product: getIdProduct,
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
  async getNewCodProduct() {
    try {
      const getCodProduct = await ProductModelInstance.getNextCodProd();

      if (getCodProduct === undefined) {
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
          newCodProduct: getCodProduct.codProd + 1,
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

  async getAllProduct() {
    try {
      const allProduct = await ProductModelInstance.getAllProduct();

      if (!allProduct) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Erro ao carregar Produtos",
        });
      } else {
        for (const product of allProduct) {
          const infoBrand = await BrandServiceInstance.getBrandId(
            product.idBrand
          );
          product.nameBrand = infoBrand.brand.brandName;
        }

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produtos carregados com sucesso",
          product: allProduct,
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

  async updateProduct(idProduct, dataProduct) {
    try {
      delete dataProduct.nameBrand;
      const upProduct = await ProductModelInstance.updateProduct(
        idProduct,
        dataProduct
      );

      if (!upProduct) {
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
          product: upProduct,
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

  async deleteProduct(idProduct) {
    try {
      const downProduct = await ProductModelInstance.deleteProduct(idProduct);
      if (downProduct.codeStatus === 500) {
        if (downProduct.info.code === "23503") {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 423,
            message:
              "Esse produto possui pedidos ou registros no estoque com seu nome e não pode ser apagado",
          };
        }
      }
      if (!downProduct) {
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
          message: "Produto apagado com sucesso",
          product: downProduct,
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
}
