import createHttpError from "http-errors";
import CashierServices from "./CashierService.mjs";
import ClientsService from "./ClientService.mjs";
import StockEntryService from "./StockEntryService.mjs";
import StockService from "./StockService.mjs";
import FinancialService from "./FinancialService.mjs";
import StockOutService from "./StockOutService.mjs";
import ProductService from "./ProductService.mjs";
import ProviderService from "./ProviderService.mjs";
import DeliveryService from "./DeliveryService.mjs";
import BrandService from "./BrandService.mjs";
import ExpenseService from "./ExpenseService.mjs";
import OrderService from "./OrderService.mjs";
import FormatDates from "../utils/FormatDates.mjs";

const CashierServicesInstance = new CashierServices();
const ClientsServiceInstance = new ClientsService();
const ExpenseServiceInstance = new ExpenseService();
const ProductServiceInstance = new ProductService();
const ProviderServiceInstance = new ProviderService();
const BrandServiceInstance = new BrandService();
const DeliveryServiceInstance = new DeliveryService();
const StockServiceInstance = new StockService();
const StockEntryServiceInstance = new StockEntryService();
const StockOutServiceInstance = new StockOutService();
const FinancialServiceInstance = new FinancialService();
const OrderServiceInstance = new OrderService();
const FormatDate = new FormatDates();

export default class HomeService {
  async getOrdersToday() {
    try {
      const infoDate = FormatDate.getDateNoHour()
      const financialToday = await FinancialServiceInstance.getFinancialDay(
        infoDate
      );


      return financialToday;
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async getFinancialMonth(dataMonth) {
    try {
      const formatMonth = dataMonth;

      const financialMonth = await FinancialServiceInstance.getFinancialMonth(
        formatMonth
      );

      const expenseMonth = await ExpenseServiceInstance.getExpensePayedByMonth(
        formatMonth
      );
      const expenseNoPayMonth =
        await ExpenseServiceInstance.getExpenseNoPayByMonth(formatMonth);

      if (
        financialMonth.codeStatus === 404 &&
        expenseMonth.codeStatus === 404 &&
        expenseNoPayMonth.codeStatus === 404
      ) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Nâo tem resumo nessa data",
          resumeMonth: 0,
        });
      } else {
        const organizeExpense = [];

        if (expenseMonth.codeStatus === 200) {
          organizeExpense.push({
            nameExpense: expenseMonth.expensesPay.titleExpense,
            totalExpense: expenseMonth.expensesPay.totalPayed || 0,
            color: true,
          });
        } else {
          organizeExpense.push({
            nameExpense: "Despesas Pagas",
            totalExpense: 0,
            color: true,
          });
        }

        if (expenseNoPayMonth.codeStatus === 200) {
          organizeExpense.push({
            nameExpense: expenseNoPayMonth.expensesNoPay.titleExpense,
            totalExpense: expenseNoPayMonth.expensesNoPay.totalNoPay || 0,
            color: false,
          });
        } else {
          organizeExpense.push({
            nameExpense: "Despesas a Pagar",
            totalExpense: 0,
            color: false,
          });
        }

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          expensesInfo: organizeExpense,
          financialMonth: financialMonth.totalByOrders || 0,
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

  async getFinancialByPayment(infoDate) {
    try {
      const financialByPayment = await FinancialServiceInstance.getOrdersByCard(
        infoDate
      );

      if (financialByPayment.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          resumePayments: 0,
        });
      } else {
        return financialByPayment;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  // ! - Resumo do lucro por mes
  async getProfitByMonth(infoDate) {
    try {
      const ordersValue = await OrderServiceInstance.getAllOrders();

      const expenseValue = await ExpenseServiceInstance.getExpensePayedByMonth(
        infoDate
      );

      const stockOrders = await StockEntryServiceInstance.getEntryOrdersByMonth(
        infoDate
      );

      if (ordersValue.codeStatus === 404) {
        return ordersValue;
      } else {
        const formatMonth = infoDate;
        const organizeOrders = [];

        ordersValue.orders.forEach((orders) => {
          const { valueNoDiscount, valueWithDiscount } = orders;

          const dateCreated = FormatDate.formatMonth(orders.dateCreated);

          if (!organizeOrders[dateCreated]) {
            organizeOrders[dateCreated] = {
              dateCreated: 0,
              totalSell: 0,
            };
          }

          if (valueWithDiscount < valueNoDiscount) {
            organizeOrders[dateCreated].dateCreated = dateCreated;
            organizeOrders[dateCreated].totalSell += Number(
              valueWithDiscount.toFixed(2)
            );
          } else {
            organizeOrders[dateCreated].dateCreated = dateCreated;
            organizeOrders[dateCreated].totalSell += Number(
              valueNoDiscount.toFixed(2)
            );
          }
        });

        const ordersByDate = [];

        for (const [, currentOrder] of Object.entries(organizeOrders)) {
          ordersByDate.push(currentOrder);
        }

        const filterOrders = ordersByDate.filter((orders) =>
          formatMonth
            ? FormatDate.compareMonthDates(orders.dateCreated, formatMonth) >= 0
            : orders
        );

        const infoOrders = {
          totalSold: 0,
        };

        for (const order of filterOrders) {
          const totalSold = parseFloat(order.totalSell);
          infoOrders.totalSold = totalSold;
        }

        if (filterOrders.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo de vendas nessa data",
          });
        } else {
          let expenseValueTotal = 0;
          let stockValueTotal = 0;
          if (expenseValue.codeStatus === 200) {
            expenseValueTotal = expenseValue.expensesPay.totalPayed;
          }
          if (stockOrders.codeStatus === 200) {
            stockValueTotal = stockOrders.totalStockEntry;
          }

          const profitValue =
            infoOrders.totalSold - (expenseValueTotal + stockValueTotal);

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            profitMonth: profitValue,
            stockOrders: stockValueTotal,
            expenseTotal: expenseValueTotal,
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

  // //Melhorar a forma de filtrar esses clientes, com o status ativo
  async getAllClients() {
    try {
      const findAllClients = await ClientsServiceInstance.getAllClient();

      if (findAllClients.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          client: 0,
        });
      } else {
        return findAllClients;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  // //   //Melhorar a forma de filtrar esses produtos, com o status ativo
  async getAllProviders() {
    try {
      const findAllProviders = await ProviderServiceInstance.getAllProviders();

      if (findAllProviders.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          provider: 0,
        });
      } else {
        return findAllProviders;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getAllProducts() {
    try {
      const findAllProducts = await ProductServiceInstance.getAllProduct();

      if (findAllProducts.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          product: 0,
        });
      } else {
        return findAllProducts;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getAllBrands() {
    try {
      const findAllBrands = await BrandServiceInstance.getAllBrand();

      if (findAllBrands.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          brands: 0,
        });
      } else {
        return findAllBrands;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getAllDeliverys() {
    try {
      const findAllDeliverys = await DeliveryServiceInstance.getAllDelivery();

      if (findAllDeliverys.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          allDistricts: 0,
        });
      } else {
        return findAllDeliverys;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getStockNow() {
    try {
      const findAllStockNow = await StockServiceInstance.getAllProductStock();

      if (findAllStockNow.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          productStock: 0,
        });
      } else {
        return findAllStockNow;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getCashier() {
    try {
      const today = FormatDate.getDateNoHour();

      const cashierInfo = await CashierServicesInstance.getCashierDay(today);

      const changeInfo = await FinancialServiceInstance.getOrdersByChange(
        today
      );
      const ordersInfo = await FinancialServiceInstance.getOrdersByCardByDay(
        today
      );
      const expenseInfo = await ExpenseServiceInstance.getExpensePayByDay(
        today
      );

      let changeDay = 0;
      let resumePaymentDay = 0;
      let resumeExpenseDay = 0;
      let cashierValueOpen = 0;

      changeDay = changeInfo.resumeToday.valueChange || 0;
      resumePaymentDay = ordersInfo.resumeByPaymentByDay.totalClientPayed || 0;
      resumeExpenseDay = expenseInfo.resumeExpenseDay.money || 0;
      cashierValueOpen = cashierInfo.cashierInfo.cashierToday.initialValueOpen || 0;

      let cashierNow =
        cashierValueOpen + resumePaymentDay - (resumeExpenseDay + changeDay);

      if (cashierInfo.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          cashierInfo: 0,
        });
      } else {
        if (cashierInfo.cashierInfo.cashierToday.status === true) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 400,
            cashierInfo: 0,
            message: "O Caixa não foi aberto",
          });
        } else {
          return {
            errorStatus: cashierInfo.errorStatus,
            successStatus: cashierInfo.successStatus,
            codeStatus: cashierInfo.codeStatus,
            message: "Aberto",
            cashierNow: cashierNow,
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

  async getEntryStock(infoMonth) {
    try {
      const findAllEntryStock =
        await StockEntryServiceInstance.getEntryOrdersByMonth(infoMonth);

      if (findAllEntryStock.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          productEntry: 0,
        });
      } else {
        return findAllEntryStock;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getOutStock(infoMonth) {
    try {
      const findAllOutStock = await StockOutServiceInstance.getStockOutByMonth(
        infoMonth
      );

      if (findAllOutStock.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          productOut: 0,
        });
      } else {
        return findAllOutStock;
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
