import createHttpError from "http-errors";
import StockOutModel from "../models/stockOutModel.mjs";
import StockEntryService from "./StockEntryService.mjs";
import ProductService from "./ProductService.mjs";
import StockService from "./StockService.mjs";
import FormatDates from "../utils/FormatDates.mjs";

const FormatDatesUtils = new FormatDates();
const StockOutModelInstance = new StockOutModel();
const StockServiceInstance = new StockService();
const StockEntryServiceInstance = new StockEntryService();
const ProductServiceInstance = new ProductService();
const FormatDateUtils = new FormatDates();

export default class StockOutService {
  async getAllProductOut() {
    try {
      const findAllProductOut = await StockOutModelInstance.getAllStockOut();

      if (!findAllProductOut) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          productOut: findAllProductOut,
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

  async getStockOutByMonth(infoDate) {
    try {
      const findAllProductOut = await StockOutModelInstance.getAllStockOut();

      if (!findAllProductOut) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const filterMonth = infoDate;

        const filterStockOut = findAllProductOut.filter((expense) =>
          filterMonth
            ? FormatDateUtils.compareMonthDates(
                FormatDateUtils.formatMonth(expense.dateOut),
                filterMonth
              ) === 0
            : expense
        );

        if (filterStockOut.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message:
              "Não foi possivel encontrar o resumo de produtos que sairam nessa data",
          });
        } else {
          for (const [, currentItemOut] of Object.entries(filterStockOut)) {
            const infoProduct = await ProductServiceInstance.getProductById(
              currentItemOut.idProduct
            );

            currentItemOut.nameProduct = infoProduct.product.nameProduct;
            currentItemOut.codProd = infoProduct.product.codProd;
          }

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            productOut: filterStockOut,
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

  async getProductOutId(idProduct) {
    try {
      const findProductOutId = await StockOutModelInstance.getProductStockOut(
        idProduct
      );

      for (const nameProduct of findProductOutId) {
        const infoProduct = await ProductServiceInstance.getProductById(
          nameProduct.idProduct
        );
        // nameProduct.dataOutProduct = nameProduct.dataOut
        nameProduct.nameProduct = infoProduct.product.nameProduct;
        nameProduct.codProduct = infoProduct.product.codProd;
        nameProduct.productBatchOption = infoProduct.product.productBatch;
      }

      const infoProductOut = findProductOutId.sort(
        (firstProductOut, secondProductOut) =>
          secondProductOut.idStockOut - firstProductOut.idStockOut
      );

      if (!findProductOutId) {
        return createHttpError({
          codeStatus: 404,
          message: "Saida do produto não encontrado",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Produto que saiu do estoque foi carregado com sucesso",
          productOut: infoProductOut,
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

  async createOutProduct(dataOutProduct) {
    try {
      const productOut = dataOutProduct;
      productOut.dateOut = FormatDatesUtils.getDateNoHour();
      let removeProductsByZero, updateProducts;

      const registerOutStock = {
        idProduct: productOut.idProduct,
        dateOut: productOut.dateOut,
        reason: productOut.reason,
        details: productOut.reason,
        priceUnit: productOut.priceUnit,
        valueTotalRemove: productOut.valueTotalRemove,
        oldTotalQtd: productOut.oldTotalQtd,
        productBatch: productOut.productBatch,
        dueDateProduct: productOut.dueDateProduct,
        qtdRemoveNoBatch: productOut.qtdRemoveNoBatch,
        qtdRemoveByBatch: productOut.qtdRemoveByBatch,
      };
      const insertNewProductOut =
        await StockOutModelInstance.createItemStockOut(registerOutStock);

      if (!insertNewProductOut) {
        return createHttpError({
          codeStatus: 400,
          message: "Erro ao adicionar saida do produto",
        });
      } else {
        let infoStockByBatch;
        if (productOut.productBatch.length > 0) {
          infoStockByBatch =
            await StockServiceInstance.getProductIdStockByBatch(productOut);
          //! - pegar o primeiro item e remover a quantidade
          const qtdToRemove = productOut.qtdRemoveByBatch;
          let qtdRemoveToFirst = 0;

          const productStockInfo = infoStockByBatch.productStock;

          for (
            let i = 0;
            i < productStockInfo.length && qtdRemoveToFirst < qtdToRemove;
            i++
          ) {
            //! - Comentar o processo
            const currentStockItem = productStockInfo[i];

            const qtdOver = qtdToRemove - qtdRemoveToFirst;

            const qtdFirstToRemove = Math.min(qtdOver, currentStockItem.qtd);

            currentStockItem.qtd -= qtdFirstToRemove;
            qtdRemoveToFirst += qtdFirstToRemove;

            currentStockItem.priceTotalByProduct =
              currentStockItem.qtd * currentStockItem.priceUnit;
          }

          // ! Filtra os items que forem igual a zero
          const deleteProductsQtdZero = productStockInfo.filter(
            (stockItem) => stockItem.qtd === 0
            // (stockItem) => stockItem.totalQtdByProduct === 0
          );

          // ! - Filtra items que forem maior que zero
          const updateProductByQtd = productStockInfo.filter(
            (stockItem) => stockItem.qtd > 0
            // (stockItem) => stockItem.totalQtdByProduct > 0
          );

          // ! - Remove itens com quantidade igual a zero
          if (deleteProductsQtdZero.length > 0) {
            removeProductsByZero = await StockServiceInstance.deleteItemByQtd(
              deleteProductsQtdZero
            );
          }
          // ! - Atualiza items com quantidade maior que zero
          if (updateProductByQtd.length > 0) {
            updateProducts = await StockServiceInstance.updateProductByBatch(
              updateProductByQtd
            );
          }
        } else {
          // ! - Atualiza o estoque com produto sem lote, buscando o valores (idStock e alterando qtd e valor total) que foi entregue
          const productNoBatch = productOut;
          const newQtd =
            productNoBatch.qtdSelect - productNoBatch.qtdRemoveNoBatch;

          const newTotal = newQtd * productNoBatch.priceUnit;

          const updateItemStock = {
            idStock: productNoBatch.idStock,
            idProduct: productNoBatch.idProduct,
            totalQtdByProduct: newQtd,
            priceTotalByProduct: newTotal,
          };
          // ! - Verifica se o valor for igual ao que tem no estoque, remove tudo
          if (newQtd === productNoBatch.qtdSelect) {
            removeProductsByZero = await StockServiceInstance.deleteItemByQtd(
              updateItemStock.idStock
            );
          } else {
            updateProducts = await StockServiceInstance.updateProductNoBatch(
              updateItemStock
            );
          }
        }
      }

      if (
        updateProducts.codeStatus === 200 ||
        removeProductsByZero.codeStatus === 200
      ) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto retirado do estoque com sucesso",
        };
      } else {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel atualizar o estoque, verifique os dados",
        });
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
  async updateProductOut(idStockOut, dataProductOut) {
    try {
      const stockOutInfo = idStockOut;
      const productOut = dataProductOut;

      const devolutionInfo = productOut.devolutionInfo;
      delete productOut.devolutionInfo;

      productOut.dateUpdate = FormatDatesUtils.getDateNoHour();
      let infoUpdate = {};
      // * 1 - Primeiro deve alterar o registro
      const upInfoStockOut = await StockOutModelInstance.updateItem(
        stockOutInfo,
        productOut
      );

      if (upInfoStockOut === true) {
        // * 2 - verificar se o produto é com lote ou não
        let infoStock;
        let productEqual;
        let newProductStock;
        // * - Esse if é para separar itens com lote
        if (productOut.hasOwnProperty("productBatch")) {
          infoStock = await StockServiceInstance.getProductIdStockByBatch(
            productOut
          );
          // * - Verifica se encontrou algum item
          if (infoStock.codeStatus === 200) {
            // * 3 - Verificar se tem algum produto igual
            productEqual = infoStock.productStock.filter((productInfo) => {
              return (
                productInfo.productBatch === productOut.productBatch &&
                productInfo.priceUnit === productOut.priceUnit
              );
            });

            // * - Verifica se tem algum item com lote igual.
            if (productEqual.length === 1) {
              devolutionInfo.idProduct = productOut.idProduct;
              devolutionInfo.priceUnit = productOut.priceUnit;
              devolutionInfo.orderStockEntry = 0;
              devolutionInfo.productBatch = productOut.productBatch;

              // * - Retorna que atualizou o item

              newProductStock =
                await StockEntryServiceInstance.createEntryProductByBatch(
                  devolutionInfo
                );

              if (newProductStock.codeStatus === 200) {
                infoUpdate = newProductStock;
              }
            }
          } else {
            //  * - Se não for igual, adicionar novo item ao estoque

            devolutionInfo.idProduct = productOut.idProduct;
            devolutionInfo.priceUnit = productOut.priceUnit;
            devolutionInfo.orderStockEntry = 0;
            devolutionInfo.productBatch = productOut.productBatch;

            // * - Retorna que atualizou o item

            newProductStock =
              await StockEntryServiceInstance.createEntryProductNoBatch(
                devolutionInfo
              );

            if (newProductStock.codeStatus === 200) {
              infoUpdate = newProductStock;
            }
          }
        }
        // * - Verifica se tem algum item com preço igual
        else {
          // * - 1 Verifica se tem preços iguais
          infoStock = await StockServiceInstance.getProductIdStock(productOut);

          const productEqual = infoStock.productStock.infoProduct.filter(
            (productInfo) => {
              return productInfo.priceUnit === productOut.priceUnit;
            }
          );

          if (productEqual.length === 0) {
            devolutionInfo.idProduct = productOut.idProduct;
            devolutionInfo.priceUnit = productOut.priceUnit;
            devolutionInfo.orderStockEntry = 0;
            // * - Retorna que atualizou o item

            // * - Faz a atualização do banco
            newProductStock =
              await StockEntryServiceInstance.createEntryProductNoBatch(
                devolutionInfo
              );

            if (newProductStock.codeStatus === 200) {
              infoUpdate = newProductStock;
            }
          } else {
            //  * - Se não for igual, adicionar novo item ao estoque
            delete devolutionInfo.dueDateProduct;
            devolutionInfo.idProduct = productOut.idProduct;
            devolutionInfo.priceUnit = productOut.priceUnit;
            devolutionInfo.orderStockEntry = 0;

            newProductStock =
              await StockEntryServiceInstance.createEntryProductNoBatch(
                devolutionInfo
              );
            if (newProductStock.codeStatus === 200) {
              infoUpdate = newProductStock;
            }
          }
        }
      }

      // * 5 - Retorna ao usuario
      if (infoUpdate.codeStatus === 404) {
        return createHttpError({
          codeStatus: 404,
          message: "Saida do produto não encontrada",
        });
      } else if (infoUpdate.codeStatus === 200) {
        return {
          codeStatus: 200,
          message: "Saida do produto atualizada com sucesso",
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
  async deleteProductOut(idProduct) {
    try {
      const downProductOut = await StockOutModelInstance.deleteProductOut(
        idProduct
      );
      if (!downProductOut) {
        return createHttpError({
          codeStatus: 404,
          message: "Saida do Produto não encontrada",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Produto que saiu foi deletado com sucesso",
          productOut: downProductOut,
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
