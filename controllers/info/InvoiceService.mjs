import createHttpError from "http-errors";
import CashierModel from "../../models/cashierModel.mjs";
import ExpensesServices from "../../controllers/ExpenseService.mjs";
import FormatDates from "../../utils/FormatDates.mjs";
import FormatValues from "../../utils/FormatValues.mjs";
import OrderModel from "../../models/orderModel.mjs";
import ProviderService from "../ProviderService.mjs";
import ReceiveService from "../ReceiveService.mjs";
import StockEntryServices from "../../controllers/StockEntryService.mjs";

const CashierModelInstance = new CashierModel();
const ExpenseServiceInstance = new ExpensesServices();
const OrderModelInstance = new OrderModel();
const ProviderServiceInstance = new ProviderService();
const ReceiveServiceInstance = new ReceiveService();
const StockEntryInstance = new StockEntryServices();
const FormatDate = new FormatDates();
const FormatText = new FormatValues();

export default class InvoiceService {
  async getCashierResume(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }

      const allCashier = await CashierModelInstance.getAllCashier();

      if (!allCashier) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const allDatesCashier = {};

        // ! - Organizar atributos do caixa que serão usados
        allCashier.forEach((cashier) => {
          const { dateClosed, valueClosed } = cashier;

          if (!allDatesCashier[dateClosed]) {
            allDatesCashier[dateClosed] = {
              dateClosed: 0,
              totalCashier: 0,
            };
          }

          if (cashier.status === "fechado") {
            allDatesCashier[dateClosed].dateClosed = dateClosed;
            allDatesCashier[dateClosed].totalCashier += valueClosed;
          }
        });

        const organizeCashier = [];

        for (const [, currentCashier] of Object.entries(allDatesCashier)) {
          organizeCashier.push(currentCashier);
        }

        // ! - Filtro para o caixa
        const filterCashier = organizeCashier
          .filter((cashiers) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  cashiers.dateClosed,
                  formatStartDate
                ) >= 0
              : cashiers
          )
          .filter((cashiers) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  cashiers.dateClosed,
                  formatFinishDate
                ) <= 0
              : cashiers
          );

        const infoCashier = {
          totalCashiers: 0,
        };

        for (const [, cashier] of Object.entries(filterCashier)) {
          const totalCashier = parseFloat(cashier.totalCashier);

          infoCashier.totalCashiers += totalCashier;
        }

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          cashiers: infoCashier,
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
  async getResumeOrders(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const totalOrders = await OrderModelInstance.getAllOrders();

      for (const orders of totalOrders) {
        const infoFormPayment = await ReceiveServiceInstance.getReceiveByOrder(
          orders.idOrder
        );

        const infoPayments =
          await ReceiveServiceInstance.getResumeReceiveByOrder(orders.idOrder);

        if (infoFormPayment.codeStatus === 200) {
          orders.formPayment = infoFormPayment.infoReceive[0].formPayment;
        }
        if (infoPayments.codeStatus === 200) {
          orders.paymentsInfo = infoPayments.resumeReceive;
        }
      }

      if(totalOrders.paymentsInfo) {
        console.log(totalOrders)
      }

      if (!totalOrders) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo de vendas nessa data",
        });
      } else {
        const ordersAccount = [];
        const ordersMoney = [];
        totalOrders.filter((orders) => {
          if (orders.formPayment !== "dinheiro") {
            ordersAccount.push(orders);
          } else {
            ordersMoney.push(orders);
          }
        });

        const allTotalAccount = {};
        const allTotalMoney = {};
        const allOrders = {};

        // ! - Organizar atributos de pedidos na conta
        ordersAccount.forEach((orders) => {
          const {
            dateCreated,
            formPayment,
            valueNoDiscount,
            valueWithDiscount,
            paymentsInfo,
          } = orders;

          if (!allTotalAccount[dateCreated]) {
            allTotalAccount[dateCreated] = {
              dateCreated: 0,
              totalSell: 0,
              qtdSell: 0,
              totalToReceive: 0,
              totalPayed: 0,
              formPayment: "",
            };
          }

          if (valueWithDiscount < valueNoDiscount) {
            allTotalAccount[dateCreated].dateCreated = dateCreated;
            allTotalAccount[dateCreated].totalSell +=
              parseFloat(valueWithDiscount);
          } else {
            allTotalAccount[dateCreated].dateCreated = dateCreated;
            allTotalAccount[dateCreated].totalSell +=
              parseFloat(valueNoDiscount);
          }

          allTotalAccount[dateCreated].qtdSell++;
          allTotalAccount[dateCreated].formPayment = formPayment;
          if (paymentsInfo) {
            allTotalAccount[dateCreated].totalToReceive +=
              paymentsInfo.totalToReceive;
            allTotalAccount[dateCreated].totalPayed +=
              paymentsInfo.totalToPayed;
          }
        });

        // ! - Organizar atributos de pedidos em dinheiro
        ordersMoney.forEach((orders) => {
          const {
            dateCreated,
            formPayment,
            valueNoDiscount,
            valueWithDiscount,
          } = orders;

          if (!allTotalMoney[dateCreated]) {
            allTotalMoney[dateCreated] = {
              dateCreated: 0,
              totalSell: 0,
              qtdSell: 0,
              formPayment: "",
            };
          }

          if (valueWithDiscount < valueNoDiscount) {
            allTotalMoney[dateCreated].totalSell +=
              parseFloat(valueWithDiscount);
          } else {
            allTotalMoney[dateCreated].dateCreated = dateCreated;
            allTotalMoney[dateCreated].totalSell += parseFloat(valueNoDiscount);
          }

          allTotalMoney[dateCreated].qtdSell++;
          allTotalMoney[dateCreated].formPayment = formPayment;
        });
        // ! - Organizar todos os pedidos por dia
        totalOrders.forEach((orders) => {
          const {
            dateCreated,
            valueNoDiscount,
            valueWithDiscount,
            valueChange,
            valueClientPayed,
            valueDiscount,
          } = orders;

          if (!allOrders[dateCreated]) {
            allOrders[dateCreated] = {
              dateCreated: 0,
              totalSell: 0,
              qtdSell: 0,
              totalChange: 0,
              totalPayed: 0,
              totalDiscount: 0,
            };
          }

          if (valueWithDiscount < valueNoDiscount) {
            allOrders[dateCreated].totalSell += parseFloat(valueWithDiscount);
            allOrders[dateCreated].totalDiscount += valueDiscount;
            allOrders[dateCreated].totalChange += valueChange;
            allOrders[dateCreated].totalPayed += valueClientPayed;
          } else {
            allOrders[dateCreated].dateCreated = dateCreated;
            allOrders[dateCreated].totalSell += parseFloat(valueNoDiscount);
            allOrders[dateCreated].totalPayed += valueClientPayed;
            allOrders[dateCreated].totalChange += valueChange;
          }

          allOrders[dateCreated].qtdSell++;
        });
        // ! - Resumo detalhado com mais informações das vendas

        const organizeOrdersAccount = [];
        const organizeOrdersMoney = [];
        const organizeAllOrders = [];
        const organizeDetailOrders = [];

        for (const [, currentOrder] of Object.entries(allTotalAccount)) {
          organizeOrdersAccount.push(currentOrder);
        }

        for (const [, currentOrder] of Object.entries(allTotalMoney)) {
          organizeOrdersMoney.push(currentOrder);
        }

        for (const [, currentOrder] of Object.entries(allOrders)) {
          organizeAllOrders.push(currentOrder);
        }
        for (const [, currentOrder] of Object.entries(totalOrders)) {
          organizeDetailOrders.push(currentOrder);
        }

        // ! - Filtro para o Pedidos em contas
        const filterOrdersAccount = organizeOrdersAccount
          .filter((orders) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatStartDate
                ) >= 0
              : orders
          )
          .filter((orders) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatFinishDate
                ) <= 0
              : orders
          );

        // ! - Filtro para o Pedidos em dinheiro
        const filterOrdersMoney = organizeOrdersMoney
          .filter((orders) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatStartDate
                ) >= 0
              : orders
          )
          .filter((orders) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatFinishDate
                ) <= 0
              : orders
          );
        // ! - Filtro para pedidos resumidos
        const filterAllOrders = organizeAllOrders
          .filter((orders) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatStartDate
                ) >= 0
              : orders
          )
          .filter((orders) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatFinishDate
                ) <= 0
              : orders
          );
        // ! - Filtro para todos os pedidos
        const filterDetailOrders = organizeDetailOrders
          .filter((orders) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatStartDate
                ) >= 0
              : orders
          )
          .filter((orders) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatFinishDate
                ) <= 0
              : orders
          );

        if (
          filterOrdersMoney.length === 0 &&
          filterOrdersAccount.length === 0 &&
          filterAllOrders.length === 0 &&
          filterDetailOrders.length === 0
        ) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo de vendas nessa data",
          });
        } else {
          const getHighSell = (orders, prop) => {
            return orders.reduce(
              (max, order) => (order[prop] > max ? order[prop] : max),
              0
            );
          };

          const highSellMoney = getHighSell(filterOrdersMoney, "totalSell");
          const highSellAccount = getHighSell(filterOrdersAccount, "totalSell");
          // const highSell = getHighSell(filterAllOrders, "totalSell");

          const infoOrders = {
            totalSold: 0,
            qtdSell: 0,
            cashSale: 0,
            saleAccount: 0,
            // highSell: highSell,
            highSellMoney: highSellMoney,
            highSellAccount: highSellAccount,
          };

          for (const [, orders] of Object.entries(filterOrdersAccount)) {
            const totalAccount = parseFloat(orders.totalSell);

            infoOrders.totalSold += totalAccount;
            infoOrders.saleAccount += totalAccount;
            infoOrders.qtdSell += orders.qtdSell;
          }

          for (const [, ordersMoneyInfo] of Object.entries(filterOrdersMoney)) {
            const totalMoney = parseFloat(ordersMoneyInfo.totalSell);

            infoOrders.totalSold += totalMoney;
            infoOrders.cashSale += totalMoney;
            infoOrders.qtdSell += ordersMoneyInfo.qtdSell;
          }

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            orders: infoOrders,
            ordersByDays: filterAllOrders,
            detailOrders: filterDetailOrders,
          };
        }
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
  async getResumeStockIn(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }

      const totalStockEntry =
        await StockEntryInstance.getAllProductEntryStock();

      totalStockEntry.productEntry.forEach(async (itemStock) => {
        const nameProvider = await ProviderServiceInstance.getProviderById(
          itemStock.idProvider
        );

        itemStock.nameProvider = nameProvider.provider.nameProvider;
      });

      if (!totalStockEntry) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo do estoque nessa data",
        });
      } else {
        const allTotalEntryStock = {};

        // ! - Organizar atributos das entrada do estoque que serão usados
        totalStockEntry.productEntry.forEach((itemStock) => {
          const { valueFinalOrder, dateEntry } = itemStock;

          if (!allTotalEntryStock[dateEntry]) {
            allTotalEntryStock[dateEntry] = {
              dateEntry: 0,
              valueFinalOrder: 0,
              totalOrderStock: 0,
            };
          }

          allTotalEntryStock[dateEntry].dateEntry = dateEntry;
          allTotalEntryStock[dateEntry].valueFinalOrder += valueFinalOrder;
          allTotalEntryStock[dateEntry].totalOrderStock++;
        });

        const organizeOrdersStock = [];

        for (const [, currentOrderStock] of Object.entries(
          allTotalEntryStock
        )) {
          organizeOrdersStock.push(currentOrderStock);
        }

        const organizeDate = organizeOrdersStock.sort(
          (dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.dateEntry,
              dateSecond.dateEntry
            );
          }
        );

        // ! - Filtro para a entrada no estoque
        const filterOrdersStock = organizeDate
          .filter((ordersStock) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  ordersStock.dateEntry,
                  formatStartDate
                ) >= 0
              : ordersStock
          )
          .filter((ordersStock) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  ordersStock.dateEntry,
                  formatFinishDate
                ) <= 0
              : ordersStock
          );

        const filterDetailStockIn = totalStockEntry.productEntry
          .filter((ordersStock) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  ordersStock.dateEntry,
                  formatStartDate
                ) >= 0
              : ordersStock
          )
          .filter((ordersStock) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  ordersStock.dateEntry,
                  formatFinishDate
                ) <= 0
              : ordersStock
          );

        if (filterOrdersStock.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message:
              "Não foi possivel encontrar o resumo do estoque nessa data",
          });
        } else {
          const infoStockEntry = {
            totalMoviments: 0,
            totalStockEntry: 0,
          };

          for (const [, orderStock] of Object.entries(filterOrdersStock)) {
            const totalOrderStock = parseFloat(orderStock.valueFinalOrder);

            infoStockEntry.totalStockEntry += totalOrderStock;
            infoStockEntry.totalMoviments = orderStock.totalOrderStock;
          }

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            stockEntry: infoStockEntry,
            stockOrdersByDay: filterOrdersStock,
            stockInDetail: filterDetailStockIn,
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

  async getResumeExpenses(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }

      const allExpenses = await ExpenseServiceInstance.getAllExpense();

      if (allExpenses.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo de despesas nessa data",
        });
      } else {
        const allExpenseOrganize = {};
        const expensePayed = [];

        allExpenses.expense.filter((expenses) => {
          if (expenses.status === "pago") {
            expensePayed.push(expenses);
          }
        });

        expensePayed.forEach((expense) => {
          const { value } = expense;
          const dateCreated = FormatDate.formatDateOfBase(expense.dateCreated);

          if (!allExpenseOrganize[dateCreated]) {
            allExpenseOrganize[dateCreated] = {
              dateCreated: 0,
              totalExpenses: 0,
              totalMoviments: 0,
            };

            allExpenseOrganize[dateCreated].dateCreated = dateCreated;
            allExpenseOrganize[dateCreated].totalExpenses = value;
            allExpenseOrganize[dateCreated].totalMoviments++;
          }
        });

        const organizeExpenses = [];

        for (const [, currentExpense] of Object.entries(allExpenseOrganize)) {
          organizeExpenses.push(currentExpense);
        }

        const organizeDates = organizeExpenses.sort((dateFirst, dateSecond) => {
          return FormatDate.compareDatesAfter(
            dateFirst.dateCreated,
            dateSecond.dateCreated
          );
        });

        // ! - Filtro para a entrada no estoque
        const filterExpense = organizeDates
          .filter((expense) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatStartDate
                ) >= 0
              : expense
          )
          .filter((expense) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatFinishDate
                ) <= 0
              : expense
          );
        // ! - Filtro de todas as despesas
        const filterDetailsExpense = expensePayed
          .filter((expense) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatStartDate
                ) >= 0
              : expense
          )
          .filter((expense) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatFinishDate
                ) <= 0
              : expense
          );

        if (filterExpense.length === 0 && filterDetailsExpense.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message:
              "Não foi possivel encontrar o resumo de despesas nessa data",
          });
        } else {
          const infoExpense = {
            totalExpenses: 0,
            totalMoviments: 0,
          };

          filterExpense.forEach((expense) => {
            const totalExpenses = parseFloat(expense.totalExpenses);

            infoExpense.totalExpenses += totalExpenses;
            infoExpense.totalMoviments++;
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expensesByDay: filterExpense,
            infoExpense: infoExpense,
            detailExpensePay: filterDetailsExpense,
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

  // Informações para os graficos
  async getOrdersGraph(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const totalOrders = await OrderModelInstance.getAllOrders();

      if (!totalOrders) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo de vendas nessa data",
        });
      } else {
        const allOrders = {};

        // ! - Organizar atributos dos pedidos que serão usados
        totalOrders.forEach((orders) => {
          const { dateCreated, valueNoDiscount, valueWithDiscount } = orders;

          if (!allOrders[dateCreated]) {
            allOrders[dateCreated] = {
              dateCreated: 0,
              totalSell: 0,
            };
          }

          if (valueWithDiscount < valueNoDiscount) {
            allOrders[dateCreated].dateCreated = dateCreated;
            allOrders[dateCreated].totalSell += parseFloat(valueWithDiscount);
          } else {
            allOrders[dateCreated].dateCreated = dateCreated;
            allOrders[dateCreated].totalSell += parseFloat(valueNoDiscount);
          }
        });

        const organizeOrders = [];

        for (const [, currentOrder] of Object.entries(allOrders)) {
          organizeOrders.push(currentOrder);
        }

        const organizeDates = organizeOrders.sort((dateFirst, dateSecond) => {
          return FormatDate.compareDatesAfter(
            dateFirst.dateCreated,
            dateSecond.dateCreated
          );
        });

        // ! - Filtro para o Pedidos
        const filterOrders = organizeDates
          .filter((orders) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatStartDate
                ) >= 0
              : orders
          )
          .filter((orders) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatFinishDate
                ) <= 0
              : orders
          );

        if (filterOrders.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo de vendas nessa data",
          });
        } else {
          const resumeByMonth = {};

          filterOrders.forEach((orders) => {
            const dateFormat = FormatDate.formatMonth(orders.dateCreated);
            const nameMonth = FormatDate.getNameMonth(dateFormat);

            if (!resumeByMonth[dateFormat]) {
              resumeByMonth[dateFormat] = {
                totalSold: 0,
                dateFormat: 0,
                qtdSold: 0,
                nameMonth: "",
              };
            }

            resumeByMonth[dateFormat].dateFormat = dateFormat;
            resumeByMonth[dateFormat].nameMonth = nameMonth;
            resumeByMonth[dateFormat].totalSold += orders.totalSell;
            resumeByMonth[dateFormat].qtdSold++;
          });

          const ordersByMonth = [];

          for (const [, currentOrder] of Object.entries(resumeByMonth)) {
            ordersByMonth.push(currentOrder);
          }

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            ordersGraph: ordersByMonth,
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
  async getExpenseGraph(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const totalExpenses = await ExpenseServiceInstance.getAllExpense();

      if (totalExpenses.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo de vendas nessa data",
        });
      } else {
        const expensePayed = [];

        totalExpenses.expense.filter((expenses) => {
          if (expenses.status === "pago") {
            expensePayed.push(expenses);
          }
        });

        const allExpenses = {};
        // ! - Organizar atributos dos pedidos que serão usados
        expensePayed.forEach((expense) => {
          const { value } = expense;
          const dateCreated = FormatDate.formatDateOfBase(expense.dateCreated);

          if (!allExpenses[dateCreated]) {
            allExpenses[dateCreated] = {
              dateCreated: 0,
              totalExpenses: 0,
            };
          }

          allExpenses[dateCreated].dateCreated = dateCreated;
          allExpenses[dateCreated].totalExpenses += parseFloat(value);
        });

        const organizeExpense = [];

        for (const [, currentOrder] of Object.entries(allExpenses)) {
          organizeExpense.push(currentOrder);
        }

        const organizeDates = organizeExpense.sort((dateFirst, dateSecond) => {
          return FormatDate.compareDatesAfter(
            dateFirst.dateCreated,
            dateSecond.dateCreated
          );
        });

        // ! - Filtro para o Pedidos
        const filterExpense = organizeDates
          .filter((orders) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatStartDate
                ) >= 0
              : orders
          )
          .filter((orders) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  orders.dateCreated,
                  formatFinishDate
                ) <= 0
              : orders
          );

        if (filterExpense.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo de vendas nessa data",
          });
        } else {
          const resumeByMonth = {};

          filterExpense.forEach((orders) => {
            const dateFormat = FormatDate.formatMonth(orders.dateCreated);
            const nameMonth = FormatDate.getNameMonth(dateFormat);

            if (!resumeByMonth[dateFormat]) {
              resumeByMonth[dateFormat] = {
                totalExpense: 0,
                dateFormat: 0,
                qtdExpense: 0,
                nameMonth: "",
              };
            }

            resumeByMonth[dateFormat].dateFormat = dateFormat;
            resumeByMonth[dateFormat].nameMonth = nameMonth;
            resumeByMonth[dateFormat].totalExpense += orders.totalExpenses;
            resumeByMonth[dateFormat].qtdSold++;
          });

          const expenseByMonth = [];

          for (const [, currentOrder] of Object.entries(resumeByMonth)) {
            expenseByMonth.push(currentOrder);
          }

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expenseGraph: expenseByMonth,
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

  async getResumeGraphs(infoDate) {
    try {
      const infoOrders = await this.getOrdersGraph(infoDate);
      const infoExpenses = await this.getExpenseGraph(infoDate);
      const infoOrdersByDay = await this.getResumeOrders(infoDate);
      const infoExpensesByDay = await this.getResumeExpenses(infoDate);

      if (
        infoOrders.codeStatus === 404 &&
        infoExpenses.codeStatus === 404 &&
        infoOrdersByDay.codeStatus === 404 &&
        infoExpensesByDay.codeStatus === 404
      ) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const infoMonth = [
          ...new Set([
            ...infoOrders.ordersGraph.map((orders) => orders.nameMonth),
            ...infoExpenses.expenseGraph.map((expense) => expense.nameMonth),
          ]),
        ];

        const infoDays = [
          ...new Set([
            ...infoOrdersByDay.ordersByDays.map((orders) => orders.dateCreated),
            ...infoExpensesByDay.expensesByDay.map(
              (expense) => expense.dateCreated
            ),
          ]),
        ];

        const resumeInvoice = [];
        const resumeByDay = [];

        infoMonth.forEach((month) => {
          const orderMonth =
            infoOrders.ordersGraph.find((order) => order.nameMonth === month)
              ?.totalSold || 0;
          const expenseMonth =
            infoExpenses.expenseGraph.find(
              (expense) => expense.nameMonth === month
            )?.totalExpense || 0;

          const orderDate =
            infoOrders.ordersGraph.find((order) => order.nameMonth === month)
              ?.dateFormat || 0;

          const expenseDate =
            infoExpenses.expenseGraph.find(
              (expense) => expense.nameMonth === month
            )?.dateFormat || 0;

          let date = "";

          if (orderDate === 0) {
            date = expenseDate;
          } else {
            date = orderDate;
          }

          resumeInvoice.push({
            nameMonth: FormatText.formatToUpper(month),
            date: date,
            orderValue: Number(orderMonth.toFixed(2)),
            expenseValue: Number(expenseMonth.toFixed(2)),
          });
        });

        infoDays.forEach((day) => {
          const orderDay =
            infoOrdersByDay.ordersByDays.find(
              (order) => order.dateCreated === day
            )?.totalSell || 0;
          const expenseDay =
            infoExpensesByDay.expensesByDay.find(
              (expense) => expense.dateCreated === day
            )?.totalExpenses || 0;

          resumeByDay.push({
            date: day,
            orderValue: Number(orderDay.toFixed(2)),
            expenseValue: Number(expenseDay.toFixed(2)),
          });
        });

        const resumeInvoiceGraph = {};
        if (resumeInvoice.length === 0 && resumeByDay.length === 0) {
          resumeInvoiceGraph.errorStatus = true;
          resumeInvoiceGraph.successStatus = false;
          resumeInvoiceGraph.codeStatus = 404;
          resumeInvoiceGraph.message =
            "Não foi possivel encontrar o resumo nessa data";

          return createHttpError(resumeInvoiceGraph);
        } else {
          resumeInvoice.sort((dateFirst, dateSecond) => {
            return FormatDate.compareMonthDates(
              dateFirst.date,
              dateSecond.date
            );
          });

          resumeByDay.sort((dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.date,
              dateSecond.date
            );
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            invoiceGraph: resumeInvoice,
            invoiceByDay: resumeByDay,
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
}
