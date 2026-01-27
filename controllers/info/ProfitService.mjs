import createHttpError from "http-errors";
import InvoiceService from "./InvoiceService.mjs";
import ExpenseService from "./ExpenseInfoService.mjs";
import StockInfoService from "./StockInfoService.mjs";
import FormatDates from "../../utils/FormatDates.mjs";

const InvoiceInstance = new InvoiceService();
const ExpenseInstance = new ExpenseService();
const FormatDate = new FormatDates();
const StockInfoInstance = new StockInfoService();

export default class ProfitService {
  async getProfitResume(infoDate) {
    try {
      const invoiceResume = await InvoiceInstance.getResumeOrders(infoDate);
      const expenseResume = await ExpenseInstance.getExpensePayed(infoDate);
      const stockResume = await StockInfoInstance.getInfoStockOrder(infoDate);

      if (
        invoiceResume.codeStatus === 404 &&
        expenseResume.codeStatus === 404 &&
        stockResume.codeStatus === 404
      ) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        let ordersValue = 0;
        let expenseTotal = 0;
        let stockTotalValue = 0;
        if (invoiceResume.codeStatus === 200) {
          ordersValue = invoiceResume.orders.totalSold;
        }
        if (expenseResume.codeStatus === 200) {
          expenseTotal = expenseResume.expenses.totalPayed;
        }
        if (stockResume.codeStatus === 200) {
          stockTotalValue = stockResume.infoStockOrder.totalOrders;
        }
        const profitTotal = ordersValue - (expenseTotal + stockTotalValue);

        if (profitTotal) {
          return {
            codeStatus: 200,
            errorStatus: false,
            successStatus: true,
            infoProfit: {
              ordersTotal: Number(ordersValue.toFixed(2)),
              expenseTotal: Number(expenseTotal.toFixed(2)),
              stockTotalValue: Number(stockTotalValue.toFixed(2)),
              totalProfit: Number(profitTotal.toFixed(2)),
            },
            allOrders: invoiceResume.ordersByDays,
            allExpense: expenseResume.expensesByDay,
            allStockIn: stockResume.stockOrdersByDay,
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

  async getProfitGraph(infoDate) {
    try {
      const invoiceGraph = await InvoiceInstance.getOrdersGraph(infoDate);
      const expenseGraph = await ExpenseInstance.getExpenseGraph(infoDate);
      const stockOrderGraph = await StockInfoInstance.getStockOrderGraph(
        infoDate
      );

      if (
        invoiceGraph.codeStatus === 404 ||
        expenseGraph.codeStatus === 404 ||
        stockOrderGraph.codeStatus === 404
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
            ...invoiceGraph.ordersGraph.map((orders) => orders.dateFormat),
            ...expenseGraph.expensesGraph.map((expense) => expense.dateFormat),
            ...stockOrderGraph.stockGraph.map(
              (stockOrder) => stockOrder.dateFormat
            ),
          ]),
        ];
        const profitGraph = [];

        for (const [, month] of Object.entries(infoMonth)) {
          const ordersMonth =
            invoiceGraph.ordersGraph.find(
              (orders) => orders.dateFormat === month
            )?.totalSold || 0;

          const expenseMonth =
            expenseGraph.expensesGraph.find(
              (expense) => expense.dateFormat === month
            )?.totalExpensePayed || 0;

          const stockOrdersMonth =
            stockOrderGraph.stockGraph.find(
              (stockOrders) => stockOrders.dateFormat === month
            )?.totalBuyed || 0;

          const totalProfit = ordersMonth - (expenseMonth + stockOrdersMonth);

          profitGraph.push({
            date: month,
            totalProfit: Number(totalProfit.toFixed(2)),
            expenseMonth: Number(expenseMonth.toFixed(2)),
            stockOrdersMonth: Number(stockOrdersMonth.toFixed(2)),
            ordersMonth: Number(ordersMonth.toFixed(2)),
          });
        }

        const resumeProfitGraph = {};
        if (profitGraph.length === 0) {
          resumeProfitGraph.errorStatus = true;
          resumeProfitGraph.successStatus = false;
          resumeProfitGraph.codeStatus = 404;
          resumeProfitGraph.message =
            "Não foi possivel encontrar o resumo nessa data";

          return createHttpError(resumeProfitGraph);
        } else {
          profitGraph.forEach((dates) => {
            const nameMonth = FormatDate.getNameMonth(dates.date);

            dates.nameMonth = nameMonth;
          });

          profitGraph.sort((dateFirst, dateSecond) => {
            return FormatDate.compareMonthDates(
              dateFirst.date,
              dateSecond.date
            );
          });

          resumeProfitGraph.errorStatus = false;
          resumeProfitGraph.successStatus = true;
          resumeProfitGraph.codeStatus = 200;
          resumeProfitGraph.profitGraph = profitGraph;

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            profitGraph: resumeProfitGraph,
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
  async getProfitGraphByDay(infoDate) {
    try {
      const invoiceResume = await InvoiceInstance.getResumeOrders(infoDate);
      const expenseResume = await ExpenseInstance.getExpensePayed(infoDate);
      const stockOrderResume = await StockInfoInstance.getInfoStockOrder(
        infoDate
      );

      if (
        invoiceResume.codeStatus === 404 ||
        expenseResume.codeStatus === 404 ||
        stockOrderResume.codeStatus === 404
      ) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const infoDay = [
          ...new Set([
            ...invoiceResume.ordersByDays.map((orders) => orders.dateCreated),
            ...expenseResume.expensesByDay.map(
              (expense) => expense.dateCreated
            ),
            ...stockOrderResume.stockOrdersByDay.map(
              (stockOrder) => stockOrder.dateEntry
            ),
          ]),
        ];
        const profitGraphByDay = [];

        for (const [, month] of Object.entries(infoDay)) {
          const ordersMonth =
            invoiceResume.ordersByDays.find(
              (orders) => orders.dateCreated === month
            )?.totalSell || 0;

          const expenseMonth =
            expenseResume.expensesByDay.find(
              (expense) => expense.dateCreated === month
            )?.totalExpense || 0;

          const stockOrdersMonth =
            stockOrderResume.stockOrdersByDay.find(
              (stockOrders) => stockOrders.dateEntry === month
            )?.priceTotal || 0;

          const totalProfit = ordersMonth - (expenseMonth + stockOrdersMonth);

          profitGraphByDay.push({
            date: month,
            totalProfit: Number(totalProfit.toFixed(2)),
            expenseMonth: Number(expenseMonth.toFixed(2)),
            stockOrdersMonth: Number(stockOrdersMonth.toFixed(2)),
            ordersMonth: Number(ordersMonth.toFixed(2)),
          });
        }

        const resumeProfitGraph = {};
        if (profitGraphByDay.length === 0) {
          resumeProfitGraph.errorStatus = true;
          resumeProfitGraph.successStatus = false;
          resumeProfitGraph.codeStatus = 404;
          resumeProfitGraph.message =
            "Não foi possivel encontrar o resumo nessa data";

          return createHttpError(resumeProfitGraph);
        } else {
          profitGraphByDay.forEach((dates) => {
            const nameMonth = FormatDate.getNameMonth(dates.date);

            dates.nameMonth = nameMonth;
          });

          profitGraphByDay.sort((dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.date,
              dateSecond.date
            );
          });

          resumeProfitGraph.errorStatus = false;
          resumeProfitGraph.successStatus = true;
          resumeProfitGraph.codeStatus = 200;
          resumeProfitGraph.profitGraph = profitGraphByDay;

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            profitGraph: resumeProfitGraph,
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
