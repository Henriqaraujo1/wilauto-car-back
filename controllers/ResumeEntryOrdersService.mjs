import createHttpError from "http-errors";
import ProviderService from "./ProviderService.mjs";
import StockEntryService from "./StockEntryService.mjs";
import StockService from "./StockService.mjs";
import FormatDates from "../utils/FormatDates.mjs";
import ExpenseService from "./ExpenseService.mjs";

const ExpenseServiceInstance = new ExpenseService();
const FormatDatesUtils = new FormatDates();
const ProviderServiceInstance = new ProviderService();
const StockEntryServiceInstance = new StockEntryService();
const StockServiceInstance = new StockService();

export default class ResumeProviderService {
  //Funções que busca debitos, pago, fornecedores, a pagar
  async getAllProvider() {
    try {
      const findAllProviders = await ProviderServiceInstance.getAllProviders();

      if (findAllProviders.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não há fornecedores cadastrados",
          allProviders: 0,
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          allProviders: findAllProviders.provider.length,
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

  async getOrdersByMonth(infoMonth) {
    try {
      const allOrders =
        await StockEntryServiceInstance.getAllProductEntryStock();

      if (!allOrders.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel buscar o resumo de compras do mes",
        });
      } else {
        // ! - Organizar essa data
        const currentMonth = infoMonth;

        const organizeOrders = {};

        allOrders.productEntry.forEach((entryOrders) => {
          const { dateEntry, valueFinalOrder } = entryOrders;

          if (!organizeOrders[dateEntry]) {
            organizeOrders[dateEntry] = {
              dateEntry: 0,
              valueBuyed: 0,
              totalEntryOrders: 0,
            };
          }

          organizeOrders[dateEntry].dateEntry = dateEntry;
          organizeOrders[dateEntry].valueBuyed += Number(
            valueFinalOrder.toFixed(2)
          );
          organizeOrders[dateEntry].totalEntryOrders++;
        });

        const organizeEntryOrders = [];

        for (const [, currentEntry] of Object.entries(organizeOrders)) {
          organizeEntryOrders.push(currentEntry);
        }

        let infoEntryOrders = {
          totalEntry: 0,
          totalBuyedEntry: 0,
        };

        organizeEntryOrders.filter((entryOrders) => {
          const dateEntry = entryOrders.dateEntry;

          const dateEntryMonth = FormatDatesUtils.formatMonth(dateEntry);

          if (
            FormatDatesUtils.compareMonthDates(dateEntryMonth, currentMonth) ===
            0
          ) {
            infoEntryOrders.totalEntry += entryOrders.totalEntryOrders;
            infoEntryOrders.totalBuyedEntry += entryOrders.valueBuyed;
          }
        });

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          totalBuyedEntry: infoEntryOrders.totalBuyedEntry,
          totalEntryOrders: infoEntryOrders.totalEntry,
        };
      }
    } catch (err) {
      console.log(err);
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getTotalInStock() {
    try {
      const valueInStock = await StockServiceInstance.getAllProductStock();

      if (valueInStock.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          totalInStock: 0,
          message: "Não foi possivel consultar o valor total em estoque",
        });
      } else {
        let totalInStock = 0;

        for (const [, priceInStock] of Object.entries(
          valueInStock.productStock
        )) {
          totalInStock += priceInStock.priceTotal;
        }

        return {
          codeStatus: 200,
          totalInStock,
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

  async getAllEntryOrders() {
    try {
      const findOrderByProvider =
        await StockEntryServiceInstance.getAllProductEntryStock();

      if (findOrderByProvider.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Erro ao buscar os pedidos dos Fornecedores",
          entryOrders: [],
        });
      } else {
        for (const provider of findOrderByProvider.productEntry) {
          // Inicializa os acumuladores se ainda não existem
          provider.expenseNotPayed = 0;
          provider.expensePayed = 0;

          const infoExpense = await ExpenseServiceInstance.getExpenseByProvider(
            provider.idProvider
          );

          for (const expense of infoExpense.infoExpense) {
            if (expense.idStockEntry === provider.idStockEntry) {
              if (expense.status === "pendente") {
                provider.expenseNotPayed += expense.value;
              } else if (expense.status === "pago") {
                provider.expensePayed += expense.value;
              }
            }
          }
        }

        const organizeByProvider = findOrderByProvider.productEntry.reduce(
          (resultProvider, currentProvider) => {
            const idProvider = currentProvider.idProvider;
            const expensePayed = currentProvider.expensePayed;
            const expenseNotPayed = currentProvider.expenseNotPayed;

            if (!resultProvider[idProvider]) {
              resultProvider[idProvider] = {
                idProvider: 0,
                expensePayed: 0,
                expenseNotPayed: 0,
                totalOrder: 0,
              };
            }
            resultProvider[idProvider].idProvider = idProvider;
            resultProvider[idProvider].expensePayed += expensePayed;
            resultProvider[idProvider].expenseNotPayed += expenseNotPayed;
            resultProvider[idProvider].totalOrder++;

            return resultProvider;
          },
          {}
        );

        let organizeOrdersByProvider = [];

        for (const [, currentOrder] of Object.entries(organizeByProvider)) {
          const infoProvider = await ProviderServiceInstance.getProviderById(
            currentOrder.idProvider
          );

          currentOrder.nameProvider = infoProvider.provider.nameProvider;
          currentOrder.cnpj = infoProvider.provider.cnpj;

          organizeOrdersByProvider.push(currentOrder);
        }
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Os pedidos dos foram carregados com sucesso",
          entryOrders: organizeOrdersByProvider,
        };
      }
    } catch (err) {
      console.log(err);
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
}
