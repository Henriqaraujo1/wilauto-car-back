import createHttpError from "http-errors";
import StockService from "../StockService.mjs";
import StockEntryService from "../StockEntryService.mjs";
import StockOutService from "../StockOutService.mjs";
import ProductService from "../ProductService.mjs";
import FormatDates from "../../utils/FormatDates.mjs";

const FormatDate = new FormatDates();
const ProductServiceInstance = new ProductService();
const StockServiceInstance = new StockService();
const StockEntryServiceInstance = new StockEntryService();
const StockOutServiceInstance = new StockOutService();

export default class StockInfoService {
  async getInfoStockNow() {
    try {
      const allStock = await StockServiceInstance.getAllProductStock();

      if (!allStock) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const allStockOrganize = allStock.productStock.reduce(
          (resultProduct, currentProduct) => {
            const { codProd, idProduct, priceTotal, totalQtd, priceSell } =
              currentProduct;

            if (!resultProduct[codProd]) {
              resultProduct[codProd] = {
                idProduct: 0,
                codProd: 0,
                priceTotal: 0,
                priceSell: 0,
                qtdStock: 0,
              };
            }

            resultProduct[codProd].codProd = codProd;
            resultProduct[codProd].idProduct = idProduct;
            resultProduct[codProd].priceTotal += priceTotal;
            resultProduct[codProd].qtdStock += totalQtd;
            resultProduct[codProd].priceSell += priceSell;

            return resultProduct;
          },
          {}
        );

        const organizeStock = [];
        const infoStockNow = {
          totalStock: 0,
          priceSell: 0,
          qtdStock: 0,
          minStock: 0,
        };

        for (const [, currentProduct] of Object.entries(allStockOrganize)) {
          const infoProduct = await ProductServiceInstance.getCodProduct(
            currentProduct.codProd
          );

          currentProduct.nameProduct = infoProduct.product.nameProduct;
          currentProduct.priceSell = infoProduct.product.priceSell;
          currentProduct.maxStock = infoProduct.product.maxStock;
          currentProduct.minStock = infoProduct.product.minStock;

          infoStockNow.totalStock += currentProduct.priceTotal;
          infoStockNow.qtdStock += currentProduct.qtdStock;
          infoStockNow.priceSell = currentProduct.priceSell;

          organizeStock.push(currentProduct);
        }
        const productLowStock = [];
        const productHighStock = [];

        // Função para calcular o percentual de variação em relação a um número de referência
        function verifyQtd(qtd, limitStock) {
          return Math.abs(qtd - limitStock);
        }

        // Função para verificar se um número está dentro de um intervalo específico
        function stockLow(qtdNow, minStock, maxStock) {
          const diferenceMin = verifyQtd(qtdNow, minStock);
          const diferenceMax = verifyQtd(qtdNow, maxStock);

          return {
            closeMin: diferenceMin <= 10,
            closeMax: diferenceMax <= 10,
            AlertMaxStock: qtdNow > maxStock,
          };
        }

        organizeStock.forEach((product) => {
          const verifyProduct = stockLow(
            product.qtdStock,
            product.minStock,
            product.maxStock
          );

          /* 
            ! - 08/01/2024
            * - os items com minino e maximo
            * - de estoque já tem a organização, porem 
            * - não está enviando ao front, por hora
            *
          */

          if (verifyProduct.AlertMaxStock || verifyProduct.closeMax) {
            productHighStock.push(product);
          } else if (verifyProduct.closeMin) {
            productLowStock.push(product);
            infoStockNow.minStock++;
          }
        });

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          stockNow: infoStockNow,
          detailStockNow: organizeStock,
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
  async getInfoStockOrder(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const allStockEntry =
        await StockEntryServiceInstance.getAllProductEntryStock();

      if (!allStockEntry) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const stockOrders = [];

        allStockEntry.productEntry.forEach((orderStock) => {
          const { valueFinalOrder, dateEntry } = orderStock;

          if (!stockOrders[dateEntry]) {
            stockOrders[dateEntry] = {
              valueFinalOrder: 0,
              dateEntry: 0,
              qtdOrders: 0,
            };
          }

          stockOrders[dateEntry].dateEntry =
            FormatDate.formatDateOfBase(dateEntry);
          stockOrders[dateEntry].valueFinalOrder += valueFinalOrder;
          stockOrders[dateEntry].qtdOrders++;
        });

        const organizeStockOrders = [];

        for (const [, currentStockOrder] of Object.entries(stockOrders)) {
          organizeStockOrders.push(currentStockOrder);
        }

        const organizeDates = organizeStockOrders.sort(
          (dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.dateEntry,
              dateSecond.dateEntry
            );
          }
        );

        const filterStockOrders = organizeDates
          .filter((stockOrders) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  stockOrders.dateEntry,
                  formatStartDate
                ) >= 0
              : stockOrders
          )
          .filter((stockOrders) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  stockOrders.dateEntry,
                  formatFinishDate
                ) <= 0
              : stockOrders
          );
        const filterDetailStockOrders = allStockEntry.productEntry
          .filter((stockOrders) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  stockOrders.dateEntry,
                  formatStartDate
                ) >= 0
              : stockOrders
          )
          .filter((stockOrders) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  stockOrders.dateEntry,
                  formatFinishDate
                ) <= 0
              : stockOrders
          );

        await filterDetailStockOrders.forEach(async (product) => {
          const infoEntry = await StockEntryServiceInstance.getItemsByOrder(
            product.idStockEntry
          );
          product.priceUnit = infoEntry[0].priceUnit;
        });

        if (
          filterStockOrders.length === 0 &&
          filterDetailStockOrders.length === 0
        ) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo nessa data",
          });
        } else {
          const infoStockOrders = {
            totalOrders: 0,
            totalQtdOrders: 0,
          };

          filterStockOrders.forEach((currentStockOrder) => {
            const totalStockOrder = parseFloat(
              currentStockOrder.valueFinalOrder
            );

            infoStockOrders.totalOrders += totalStockOrder;
            infoStockOrders.totalQtdOrders += currentStockOrder.qtdOrders;
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            infoStockOrder: infoStockOrders,
            stockOrdersByDay: filterStockOrders,
            detailStockOrder: filterDetailStockOrders,
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
  async getInfoStockOut(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }

      const allStockOut = await StockOutServiceInstance.getAllProductOut();

      if (allStockOut.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const organizeAllStockOut = {};

        allStockOut.productOut.forEach((stockOut) => {
          const {
            dateOut,
            valueTotalRemove,
            qtdRemoveByBatch,
            qtdRemoveNoBatch,
          } = stockOut;

          if (!organizeAllStockOut[dateOut]) {
            organizeAllStockOut[dateOut] = {
              valueTotalRemove: 0,
              dateOut: 0,
              qtdRemoved: 0,
            };
          }

          if (qtdRemoveByBatch > qtdRemoveNoBatch) {
            organizeAllStockOut[dateOut].dateOut = dateOut;

            organizeAllStockOut[dateOut].qtdRemoved += qtdRemoveByBatch;
          } else {
            organizeAllStockOut[dateOut].dateOut = dateOut;
            organizeAllStockOut[dateOut].qtdRemoved += qtdRemoveNoBatch;
          }

          organizeAllStockOut[dateOut].valueTotalRemove += valueTotalRemove;
        });

        const organizeStockOut = [];

        for (const [, currentStockOut] of Object.entries(organizeAllStockOut)) {
          organizeStockOut.push(currentStockOut);
        }

        const organizeDates = organizeStockOut.sort((dateFirst, dateSecond) => {
          return FormatDate.compareDatesAfter(
            dateFirst.dateOut,
            dateSecond.dateOut
          );
        });

        const filterStockOut = organizeDates
          .filter((stockOut) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  stockOut.dateOut,
                  formatStartDate
                ) >= 0
              : stockOut
          )
          .filter((stockOut) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  stockOut.dateOut,
                  formatFinishDate
                ) <= 0
              : stockOut
          );
        const filterDetailStockOut = allStockOut.productOut
          .filter((stockOut) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  stockOut.dateOut,
                  formatStartDate
                ) >= 0
              : stockOut
          )
          .filter((stockOut) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  stockOut.dateOut,
                  formatFinishDate
                ) <= 0
              : stockOut
          );

        if (filterStockOut.length === 0 && filterDetailStockOut.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo nessa data",
          });
        } else {
          const getHighLostProduct = (orders, prop) => {
            return orders.reduce(
              (max, order) => (order[prop] > max ? order[prop] : max),
              -Infinity
            );
          };

          const infoStockOut = {
            totalLost: 0,
            totalProductLost: 0,
            highValueLost: getHighLostProduct(
              filterStockOut,
              "valueTotalRemove"
            ),
          };

          filterStockOut.forEach((currentStockOrder) => {
            const totalStockOut = parseFloat(
              currentStockOrder.valueTotalRemove
            );

            infoStockOut.totalLost += totalStockOut;
            infoStockOut.totalProductLost += currentStockOrder.qtdRemoved;
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            stockOut: infoStockOut,
            stockOutByDays: filterStockOut,
            detailStockOut: filterDetailStockOut,
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

  async getStockOrderGraph(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const allStockEntry =
        await StockEntryServiceInstance.getAllProductEntryStock();

      if (!allStockEntry) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const stockOrders = [];

        allStockEntry.productEntry.forEach((orderStock) => {
          const { valueFinalOrder, dateEntry } = orderStock;

          if (!stockOrders[dateEntry]) {
            stockOrders[dateEntry] = {
              valueFinalOrder: 0,
              dateEntry: 0,
              qtdOrders: 0,
            };
          }

          stockOrders[dateEntry].dateEntry =
            FormatDate.formatDateOfBase(dateEntry);
          stockOrders[dateEntry].valueFinalOrder += valueFinalOrder;
          stockOrders[dateEntry].qtdOrders++;
        });

        const organizeStockOrders = [];

        for (const [, currentStockOrder] of Object.entries(stockOrders)) {
          organizeStockOrders.push(currentStockOrder);
        }

        const organizeDates = organizeStockOrders.sort(
          (dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.dateEntry,
              dateSecond.dateEntry
            );
          }
        );

        const filterStockOrders = organizeDates
          .filter((stockOrders) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  stockOrders.dateEntry,
                  formatStartDate
                ) >= 0
              : stockOrders
          )
          .filter((stockOrders) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  stockOrders.dateEntry,
                  formatFinishDate
                ) <= 0
              : stockOrders
          );

        if (filterStockOrders.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo nessa data",
          });
        } else {
          const resumeByMonth = {};

          filterStockOrders.forEach((orders) => {
            const dateFormat = FormatDate.formatMonth(orders.dateEntry);
            const nameMonth = FormatDate.getNameMonth(dateFormat);

            if (!resumeByMonth[dateFormat]) {
              resumeByMonth[dateFormat] = {
                totalBuyed: 0,
                dateFormat: 0,
                nameMonth: "",
              };
            }

            resumeByMonth[dateFormat].dateFormat = dateFormat;
            resumeByMonth[dateFormat].nameMonth = nameMonth;
            resumeByMonth[dateFormat].totalBuyed += orders.priceTotal;
          });

          const stockOrdersByMonth = [];

          for (const [, currentOrder] of Object.entries(resumeByMonth)) {
            stockOrdersByMonth.push(currentOrder);
          }

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            stockGraph: stockOrdersByMonth,
            stockOrders: filterStockOrders,
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
  async getStockOutGraph(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }

      const allStockOut = await StockOutServiceInstance.getAllProductOut();

      if (allStockOut.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const organizeAllStockOut = {};

        allStockOut.productOut.forEach((stockOut) => {
          const {
            dateOut,
            valueTotalRemove,
            qtdRemoveByBatch,
            qtdRemoveNoBatch,
          } = stockOut;

          if (!organizeAllStockOut[dateOut]) {
            organizeAllStockOut[dateOut] = {
              valueTotalRemove: 0,
              dateOut: 0,
              qtdRemoved: 0,
            };
          }

          if (qtdRemoveByBatch > qtdRemoveNoBatch) {
            organizeAllStockOut[dateOut].dateOut = dateOut;
            organizeAllStockOut[dateOut].qtdRemoved += qtdRemoveByBatch;
          } else {
            organizeAllStockOut[dateOut].dateOut = dateOut;
            organizeAllStockOut[dateOut].qtdRemoved += qtdRemoveNoBatch;
          }

          organizeAllStockOut[dateOut].valueTotalRemove += valueTotalRemove;
        });

        const organizeStockOut = [];

        for (const [, currentStockOut] of Object.entries(organizeAllStockOut)) {
          organizeStockOut.push(currentStockOut);
        }

        const organizeDates = organizeStockOut.sort((dateFirst, dateSecond) => {
          return FormatDate.compareDatesAfter(
            dateFirst.dateOut,
            dateSecond.dateOut
          );
        });

        const filterStockOut = organizeDates
          .filter((stockOut) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  stockOut.dateOut,
                  formatStartDate
                ) >= 0
              : stockOut
          )
          .filter((stockOut) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  stockOut.dateOut,
                  formatFinishDate
                ) <= 0
              : stockOut
          );

        if (filterStockOut.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo nessa data",
          });
        } else {
          const resumeByMonth = {};

          filterStockOut.forEach((stockOut) => {
            const dateFormat = FormatDate.formatMonth(stockOut.dateOut);
            const nameMonth = FormatDate.getNameMonth(dateFormat);

            if (!resumeByMonth[dateFormat]) {
              resumeByMonth[dateFormat] = {
                totalValueRemoved: 0,
                dateFormat: 0,
                nameMonth: "",
              };
            }

            resumeByMonth[dateFormat].dateFormat = dateFormat;
            resumeByMonth[dateFormat].nameMonth = nameMonth;
            resumeByMonth[dateFormat].totalValueRemoved +=
              stockOut.valueTotalRemove;
          });

          const stockOutByMonth = [];

          for (const [, currentOrder] of Object.entries(resumeByMonth)) {
            stockOutByMonth.push(currentOrder);
          }

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            stockOutGraph: stockOutByMonth,
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

  async getStockGraphByDay(infoDate) {
    try {
      const infoStockOrder = await this.getInfoStockOrder(infoDate);
      const infoStockOut = await this.getInfoStockOut(infoDate);

      if (
        infoStockOrder.codeStatus === 404 ||
        infoStockOut.codeStatus === 404
      ) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const infoDays = [
          ...new Set([
            ...infoStockOrder.stockOrdersByDay.map(
              (orders) => orders.dateEntry
            ),
            ...infoStockOut.stockOutByDays.map((stockOut) => stockOut.dateOut),
          ]),
        ];

        const resumeStock = [];

        infoDays.forEach((days) => {
          const stockOrderMonth =
            infoStockOrder.stockOrdersByDay.find(
              (stockOrder) => stockOrder.dateEntry === days
            )?.priceTotal || 0;
          const stockOutMonth =
            infoStockOut.stockOutByDays.find(
              (stockOut) => stockOut.dateOut === days
            )?.totalValueRemoved || 0;

          resumeStock.push({
            date: days,
            stockOrderValue: Number(stockOrderMonth.toFixed(2)),
            stockOutValue: Number(stockOutMonth.toFixed(2)),
          });
        });

        const resumeStockGraph = {};
        if (resumeStock.length === 0) {
          resumeStockGraph.errorStatus = true;
          resumeStockGraph.successStatus = false;
          resumeStockGraph.codeStatus = 404;
          resumeStockGraph.message =
            "Não foi possivel encontrar o resumo nessa data";

          return createHttpError(resumeStockGraph);
        } else {
          resumeStock.forEach((stock) => {
            const nameMonth = FormatDate.getNameMonth(stock.date);

            stock.nameMonth = nameMonth;
          });

          resumeStock.sort((dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.date,
              dateSecond.date
            );
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            stockGraphDays: resumeStock,
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

  async organizeDateForGraph(infoDate) {
    try {
      const infoStockOrder = await this.getStockOrderGraph(infoDate);
      const infoStockOut = await this.getStockOutGraph(infoDate);

      if (
        infoStockOrder.codeStatus === 404 ||
        infoStockOut.codeStatus === 404
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
            ...infoStockOrder.stockGraph.map((orders) => orders.dateFormat),
            ...infoStockOut.stockOutGraph.map(
              (stockOut) => stockOut.dateFormat
            ),
          ]),
        ];

        const resumeStock = [];

        infoMonth.forEach((month) => {
          const stockOrderMonth =
            infoStockOrder.stockGraph.find(
              (stockOrder) => stockOrder.dateFormat === month
            )?.totalBuyed || 0;
          const stockOutMonth =
            infoStockOut.stockOutGraph.find(
              (stockOut) => stockOut.dateFormat === month
            )?.totalValueRemoved || 0;

          resumeStock.push({
            date: month,
            stockOrderValue: Number(stockOrderMonth.toFixed(2)),
            stockOutValue: Number(stockOutMonth.toFixed(2)),
          });
        });

        const resumeStockGraph = {};
        if (resumeStock.length === 0) {
          resumeStockGraph.errorStatus = true;
          resumeStockGraph.successStatus = false;
          resumeStockGraph.codeStatus = 404;
          resumeStockGraph.message =
            "Não foi possivel encontrar o resumo nessa data";

          return createHttpError(resumeStockGraph);
        } else {
          resumeStock.forEach((stock) => {
            const nameMonth = FormatDate.getNameMonth(stock.date);

            stock.nameMonth = nameMonth;
          });

          resumeStock.sort((dateFirst, dateSecond) => {
            return FormatDate.compareMonthDates(
              dateFirst.date,
              dateSecond.date
            );
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            stockGraph: resumeStock,
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
