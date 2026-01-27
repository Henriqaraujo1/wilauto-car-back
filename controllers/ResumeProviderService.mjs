import createHttpError from "http-errors";
import ExpenseService from "./ExpenseService.mjs";
import ProviderService from "./ProviderService.mjs";
import StockEntryService from "./StockEntryService.mjs";

const ExpenseServiceInstance = new ExpenseService();
const ProviderServiceInstance = new ProviderService();
const StockEntryServiceInstance = new StockEntryService();

export default class ResumeProviderService {
  async getInfoOrdersByProvider(idProviderInfo) {
    try {
      const findEntryOrdersByProvider =
        await StockEntryServiceInstance.getEntryOrderByProvider(idProviderInfo);

      const organizeOrdersByProvider =
        await findEntryOrdersByProvider.entryOrderByProvider.reduce(
          (resultOrder, currentOrder) => {
            const dateEntry = currentOrder.dateEntry;
            const idProvider = currentOrder.idProvider;
            const idStockEntry = currentOrder.idStockEntry;
            const qtdItems = currentOrder.qtdItems;
            const valueOrder = currentOrder.valueOrder;
            const valueFinalOrder = currentOrder.valueFinalOrder;
            const statusDelivery = currentOrder.statusDelivery;
            const valueDelivery = currentOrder.valueDelivery;
            const valueDolar = currentOrder.valueDolar;

            if (!resultOrder[idStockEntry]) {
              resultOrder[idStockEntry] = {
                idProvider: 0,
                dateEntry: 0,
                idStockEntry: 0,
                valueFinalOrder: 0,
                qtdItems: 0,
                valueOrder: 0,
                valueDolar: 0,
              };
            }
            resultOrder[idStockEntry].dateEntry = dateEntry;
            resultOrder[idStockEntry].valueFinalOrder += valueFinalOrder;
            resultOrder[idStockEntry].valueOrder += valueOrder;
            resultOrder[idStockEntry].qtdItems += qtdItems;
            resultOrder[idStockEntry].valueDolar += valueDolar;
            resultOrder[idStockEntry].idProvider = idProvider;
            resultOrder[idStockEntry].idStockEntry = idStockEntry;
            resultOrder[idStockEntry].valueDelivery = valueDelivery;
            resultOrder[idStockEntry].statusDelivery = statusDelivery;

            return resultOrder;
          },

          {}
        );

      const infoProvider = await ProviderServiceInstance.getProviderById(
        idProviderInfo
      );
      const lastEntryOrderByProvider =
        await StockEntryServiceInstance.getLastEntryOrderByProvider(
          idProviderInfo
        );

      let organizeOrder = [];
      let totalBuyed = 0;

      for (const [, currentOrder] of Object.entries(organizeOrdersByProvider)) {
        totalBuyed += currentOrder.valueOrder;
        organizeOrder.push(currentOrder);
      }

      const resumeProvider = {
        lastOrder: lastEntryOrderByProvider.lastOrder.dateEntry,
        infoProvider: infoProvider.provider,
        priceTotalOrders: totalBuyed,
        totalOrders: organizeOrder.length,
        orderList: organizeOrder,
      };
      resumeProvider.orderList.sort((a, b) => b.idStockEntry - a.idStockEntry);

      if (!findEntryOrdersByProvider) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel buscar os pedidos desse Fornecedor",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Os pedidos foram carregados com sucesso",
          orders: resumeProvider,
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

  async getItemsByOrder(idStockEntry) {
    try {
      const itemsByOrder = await StockEntryServiceInstance.getItemsByOrder(
        idStockEntry
      );
      if (itemsByOrder.length > 0) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          itemsByOrder: itemsByOrder,
        };
      } else {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar items com esse pedido de compra",
        });
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getPaymentsByOrder(idStockEntry) {
    try {
      const findPaymentsByOrder = await ExpenseServiceInstance.getExpenseByStockOrder(idStockEntry)

      if(findPaymentsByOrder.codeStatus === 404) {
        return findPaymentsByOrder
      } else {
        return findPaymentsByOrder
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
