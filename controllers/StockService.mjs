import createHttpError from "http-errors";
import ProductService from "./ProductService.mjs";
import BrandService from "./BrandService.mjs";
import StockModel from "../models/stockModel.mjs";
import StockEntryModel from "../models/stockEntryModel.mjs";
import SubProductService from "./SubProductService.mjs";

// const ProductServiceInstance = new ProductService();
const BrandServiceInstance = new BrandService();
const StockModelInstance = new StockModel();
const StockEntryModelInstance = new StockEntryModel();
const SubProductServiceInstance = new SubProductService();

export default class StockService {
  async getAllProductStock() {
    try {
      const findAllProductStock = await StockModelInstance.getAllStock();

      if (!findAllProductStock) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não existe produtos no estoque",
        });
      } else {
        const ProductServiceInstance = new ProductService();
        for (const nameProduct of findAllProductStock) {
          const infoProduct = await ProductServiceInstance.getProductByCod(
            nameProduct.codProd
          );

          if (infoProduct.codeStatus === 404) {
            const infoSubProduct =
              await SubProductServiceInstance.getCodSubProduct(
                nameProduct.codProd
              );

            let infoStockEntry =
              await StockEntryModelInstance.getItemsByIdStock(
                nameProduct.idStock
              );

            if (infoStockEntry === undefined) {
              infoStockEntry = 0;
            } else {
              nameProduct.idStockEntry = infoStockEntry.idStockEntry;
            }

            nameProduct.nameProduct = infoSubProduct.product.nameProduct;
            nameProduct.priceSell = infoSubProduct.product.priceSell;
            nameProduct.codProd = infoSubProduct.product.codProd;
          } else {
            let infoStockEntry =
              await StockEntryModelInstance.getItemsByIdStock(
                nameProduct.idStock
              );

            if (infoStockEntry === undefined) {
              infoStockEntry = 0;
            } else {
              nameProduct.idStockEntry = infoStockEntry.idStockEntry;
            }

            const infoBrand = await BrandServiceInstance.getBrandId(
              infoProduct.product.idBrand
            );
            nameProduct.brandName = infoBrand.brand.brandName;
            nameProduct.nameProduct = infoProduct.product.nameProduct;
            nameProduct.priceSell = infoProduct.product.priceSellDolar;
            // nameProduct.codProd = infoProduct.product.codProd;
          }
        }

        const allProductsOrganize = await findAllProductStock.reduce(
          (resultProduct, currentProduct) => {
            const codProd = currentProduct.codProd;
            const nameProduct = currentProduct.nameProduct;
            const brandName = currentProduct.brandName;
            const totalQtd = currentProduct.qtd;
            const totalQtdByProduct = currentProduct.qtd;
            const priceTotal = currentProduct.priceTotal;
            const priceTotalByProduct = currentProduct.priceTotal;
            const priceUnit = currentProduct.priceUnit;
            const priceSell = currentProduct.priceSell;
            const dueDateProduct = currentProduct.dueDateProduct;
            const idStockEntry = currentProduct.idStockEntry;
            const productBatch = currentProduct.productBatch;
            const isDevolution = currentProduct.isDevolution;

            if (!resultProduct[codProd]) {
              resultProduct[codProd] = {
                nameProduct: "",
                codProd: 0,
                brandName: "",
                totalQtd: 0,
                priceTotal: 0,
                priceSell: 0,
                priceUnit: 0,
                infoProduct: [],
              };
            }
            // resultProduct[id].idProduct = idProduct;
            resultProduct[codProd].codProd = codProd;
            resultProduct[codProd].nameProduct = nameProduct;
            resultProduct[codProd].brandName = brandName;
            resultProduct[codProd].totalQtd += totalQtd;
            resultProduct[codProd].priceTotal += priceTotal;
            resultProduct[codProd].priceUnit = priceUnit;
            resultProduct[codProd].priceSell = priceSell;
            resultProduct[codProd].infoProduct.push({
              productBatch: productBatch,
              priceUnit: priceUnit,
              dueDateProduct: dueDateProduct,
              idStockEntry: idStockEntry,
              priceTotalByProduct: priceTotalByProduct,
              totalQtdByProduct: totalQtdByProduct,
              isDevolution: isDevolution,
            });

            return resultProduct;
          },
          {}
        );

        const productsStock = [];
        for (const [, currentProduct] of Object.entries(allProductsOrganize)) {
          productsStock.push(currentProduct);
        }

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Os Produtos do estoque carregados com sucesso",
          productStock: productsStock,
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

  async getProductByIdStock(idStock) {
    try {
      const infoStock = idStock;

      const findIdStock = await StockModelInstance.getIdStock(infoStock);

      if (findIdStock === false) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto no estoque não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto encontrado no estoque",
          productStock: findIdStock,
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

  async getProductIdStock(idProductInfo) {
    try {
      const productInfo = idProductInfo;
      const codProd = idProductInfo.codProd;
      const findProductStockId = await StockModelInstance.getStockCodProd(
        codProd
      );
      if (productInfo === undefined || findProductStockId === false) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Item não está cadastrado no Estoque",
        });
      } else {
        const allProductsOrganized = findProductStockId.reduce(
          (resultProduct, currentProduct) => {
            const codProd = String(currentProduct.codProd);

            const {
              idStock,
              productBatch,
              qtd,
              priceTotal,
              priceUnit,
              dueDateProduct,
              isDevolution,
            } = currentProduct;

            if (!resultProduct[codProd]) {
              resultProduct[codProd] = {
                codProd,
                idProduct: productInfo.idProduct,
                nameProduct: productInfo.nameProduct,
                dueDateOption: productInfo.dueDateOption,
                totalQtd: 0,
                priceTotal: 0,
                infoProduct: [],
              };
            }

            resultProduct[codProd].totalQtd += qtd;
            resultProduct[codProd].priceTotal += priceTotal;

            resultProduct[codProd].infoProduct.push({
              idStock,
              productBatch,
              priceUnit,
              dueDateProduct,
              totalQtdByProduct: qtd,
              priceTotalByProduct: priceTotal,
              isDevolution,
            });

            return resultProduct;
          },
          {}
        );

        const productStockOrganize = [];

        for (const [, currentProduct] of Object.entries(allProductsOrganized)) {
          productStockOrganize.push(currentProduct);
        }

        const stockItem = Object.assign({}, ...productStockOrganize);

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto encontrado no estoque",
          productStock: stockItem,
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
  async getProductIdStockByBatch(idProduct) {
    try {
      const productId = idProduct.idProduct;
      const productBatchInfo = idProduct.productBatch;
      let findProductStockId =
        await StockModelInstance.getStockProductIdByBatch(
          productId,
          productBatchInfo
        );
      let allProductsOrganize, stockItem;
      // ! - Por em quanto deixar o ultimo valor do preço unitario que entrou
      if (findProductStockId) {
        allProductsOrganize = await findProductStockId.reduce(
          (resultProduct, currentProduct) => {
            const id = currentProduct.idProduct;
            const idStock = currentProduct.idStock;
            const productBatch = currentProduct.productBatch;
            const priceUnit = currentProduct.priceUnit;
            const dueDateProduct = currentProduct.dueDateProduct;
            const totalQtdByProduct = currentProduct.qtd;
            const priceTotalByProduct = currentProduct.priceTotal;
            const isDevolution = currentProduct.isDevolution;

            if (!resultProduct[id]) {
              resultProduct[id] = {
                infoProduct: [],
              };
            }
            resultProduct[id].infoProduct.push({
              idStock: idStock,
              productBatch: productBatch,
              priceUnit: priceUnit,
              dueDateProduct: dueDateProduct,
              qtd: totalQtdByProduct,
              priceTotal: priceTotalByProduct,
              isDevolution: isDevolution,
            });

            return resultProduct;
          },
          {}
        );
        const productStockOrganize = [];

        for (const [, currentProduct] of Object.entries(allProductsOrganize)) {
          productStockOrganize.push(currentProduct);
        }

        stockItem = Object.assign({}, ...productStockOrganize);
      } else {
        findProductStockId = [];
      }
      if (findProductStockId === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Item não está cadastrado no Estoque",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto encontrado no estoque",
          productStock: stockItem.infoProduct,
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

  async createProductStock(dataProduct) {
    try {
      const infoProduct = dataProduct;

      const newEntryProduct = {
        codProd: infoProduct.codProd,
        qtd: infoProduct.qtd,
        priceUnit: infoProduct.priceUnit,
        priceTotal: infoProduct.priceTotal,
      };

      const createProductStock = await StockModelInstance.createProductStock(
        newEntryProduct
      );
      if (createProductStock === false) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 403,
          message: "Erro ao cadastrar Produto, Verifique os dados",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto adicionado ao estoque",
          productStock: createProductStock,
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

  async updateProductNoBatch(dataProduct) {
    try {
      const stockProduct = dataProduct;
      let newProductStock = {
        idStock: stockProduct.idStock,
        qtd: stockProduct.totalQtdByProduct || stockProduct.qtd,
        priceTotal: stockProduct.priceTotalByProduct || stockProduct.priceTotal,
      };

      const updateItemStock = await StockModelInstance.updateProduct(
        newProductStock
      );

      if (updateItemStock === false) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto não encontrado no Estoque",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto atualizado com sucesso",
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

  async updateProductByBatch(dataProduct) {
    try {
      // ! - Somar a quantidade de estoque com a nova
      const updateProductStock = Object.assign({}, ...dataProduct);
      const infoUpdateStock = {
        updateProductStock: false,
        productUpdateCount: 0,
      };
      let updateProduct;
      if (typeof updateProductStock === "object") {
        let newProductStock = {
          idStock: updateProductStock.idStock,
          qtd: updateProductStock.totalQtdByProduct || updateProductStock.qtd,
          priceTotal: updateProductStock.priceTotalByProduct,
        };
        updateProduct = await StockModelInstance.updateProduct(newProductStock);

        if (updateProduct === true) {
          const countUpdate = infoUpdateStock.productUpdateCount;
          infoUpdateStock.updateProductStock = true;
          infoUpdateStock.productUpdateCount = countUpdate + 1;
        }
      } else {
        for await (const productsStock of updateProductStock) {
          updateProduct = await StockModelInstance.updateProduct(productsStock);

          if (updateProduct === true) {
            const countUpdate = infoUpdateStock.productUpdateCount;
            infoUpdateStock.updateProductStock = true;
            infoUpdateStock.productUpdateCount = countUpdate + 1;
          }
        }
      }

      if (infoUpdateStock.updateProductStock === false) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto não encontrado no Estoque",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto atualizado com sucesso",
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

  async updateStockByOrder(infoOrder) {
    try {
      const infoStock = {
        idStock: infoOrder.idStock,
        qtd: infoOrder.totalQtdByProduct,
        priceTotal: infoOrder.priceTotalByProduct,
      };

      const updateProductByOrder = await StockModelInstance.updateProduct(
        infoStock
      );

      if (updateProductByOrder === false) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto não encontrado no Estoque",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto atualizado com sucesso",
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

  async deleteItemByQtd(itemStock) {
    try {
      const itemStockToDelete = itemStock.idStock;

      const infoDeleteStock = await StockModelInstance.deleteProductQtdZero(
        itemStockToDelete
      );

      if (infoDeleteStock === false) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto não encontrado no Estoque",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto removido com sucesso",
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
