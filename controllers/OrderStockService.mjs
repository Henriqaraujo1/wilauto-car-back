import createHttpError from "http-errors";
import OrderModel from "../models/orderModel.mjs";
import StockService from "./StockService.mjs";
import FormatDates from "../utils/FormatDates.mjs";

const FormatDatesUtils = new FormatDates();
const OrderModelInstance = new OrderModel();
const StockServiceInstance = new StockService();

export default class OrderStockService {
  async getItemStock(infoItem) {
    try {
      const dataItem = infoItem;
      const getProductByIdStock = await StockServiceInstance.getProductIdStock(
        dataItem
      );

      if (getProductByIdStock.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          sucessStatus: false,
          codeStatus: 404,
          message: "O item não tem quantidade no estoque",
        });
      } else if (
        getProductByIdStock.codeStatus === 200 &&
        dataItem.qtd > getProductByIdStock.productStock.totalQtd
      ) {
        return createHttpError({
          errorStatus: true,
          sucessStatus: false,
          codeStatus: 404,
          message: "O item a ser vendido tem quantidade maior que no estoque",
        });
      } else {
        return {
          errorStatus: false,
          sucessStatus: true,
          codeStatus: 200,
          message: "O item a ser vendido tem quantidade no estoque",
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
  async createOrderOutStock(infoOrder) {
    try {
      // ! - Busca info no estoque para calcular a quantidade a remover
      const dataOrder = infoOrder;
      const getProductByIdStock = await StockServiceInstance.getProductIdStock(
        dataOrder
      );

      if (getProductByIdStock.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          sucessStatus: false,
          codeStatus: 404,
          message: "O item não tem quantidade no estoque",
        });
      }

      let hasSuccess = false;
      let hasError = false;
      const infoProductInStock = getProductByIdStock.productStock.infoProduct;
      const infoTotalQtd = getProductByIdStock.productStock;

      const qtdToRemove = dataOrder.qtd;
      let qtdRemoveToFirst = 0;
      const stockToUpdate = [];

      /**
       * Esse função com laço vai retirando a quantidade da venda da lista de produtos que
       * que tem no estoque, se sobrar algum item, passa para a proxima lista
       * apos o laço, atualiza o banco com os dados,
       * se tiver algum qtd zerada, ele remove do estoque
       *  */
      const removeQtdInStock = (infoStock) => {
        for (
          let i = 0;
          i < infoStock.length && qtdRemoveToFirst < qtdToRemove;
          i++
        ) {
          const currentStockItem = infoStock[i];

          // ! - Quantidade
          const qtdOver = qtdToRemove - qtdRemoveToFirst;

          if (qtdOver > 0) {
            currentStockItem.changeProduct = true;
          } else {
            currentStockItem.changeProduct = false;
          }

          const qtdFirstToRemove = Math.min(
            qtdOver,
            currentStockItem.totalQtdByProduct
          );

          currentStockItem.totalQtdByProduct -= qtdFirstToRemove;
          qtdRemoveToFirst += qtdFirstToRemove;

          currentStockItem.priceTotalByProduct =
            currentStockItem.totalQtdByProduct * currentStockItem.priceUnit;

          if (currentStockItem.changeProduct === true) {
            stockToUpdate.push(currentStockItem);
          }
        }
      };

      removeQtdInStock(infoProductInStock);

      for (const stockChange of stockToUpdate) {
        if (stockChange.totalQtdByProduct === 0) {
          const res = await StockServiceInstance.deleteItemByQtd(stockChange);
          if (res?.codeStatus === 200) hasSuccess = true;
          else hasError = true;
        } else {
          const res = await StockServiceInstance.updateStockByOrder(
            stockChange
          );
          if (res?.codeStatus === 200) hasSuccess = true;
          else hasError = true;
        }
      }

      // ! - Organizar essa data
      const dateCreated = FormatDatesUtils.getDateNoHour();
      const infoOrderOut = {
        idOrder: dataOrder.idOrder,
        codProd: dataOrder.codProd,
        oldQtdStock: infoTotalQtd.totalQtd,
        qtdSell: dataOrder.qtd,
        dateCreated: dateCreated,
      };

      await OrderModelInstance.createOrdersOutStock(infoOrderOut);


      if (hasSuccess && !hasError) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto retirado do estoque com sucesso",
        };
      }

      return createHttpError({
        errorStatus: true,
        successStatus: false,
        codeStatus: 409,
        message: "Não foi possível atualizar o estoque, verifique os dados",
      });
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
}
