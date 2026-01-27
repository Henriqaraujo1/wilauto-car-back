import createHttpError from "http-errors";
import CartService from "./CartService.mjs";
import ClientService from "./ClientService.mjs";
import FormatDate from "../utils/FormatDates.mjs";
import ReceiveService from "./ReceiveService.mjs";
import OrderService from "./OrderService.mjs";
import OrderModel from "../models/orderModel.mjs";

const CartServiceInstance = new CartService();
const ClientServiceInstance = new ClientService();
const FormatDateUtil = new FormatDate();
const OrderServiceInstance = new OrderService();
const OrderModelInstance = new OrderModel();
const ReceiveServiceInstance = new ReceiveService();

export default class FinancialService {
  async getFinancialDay(infoDate) {
    try {
      const findFinancialToday = await OrderModelInstance.getAllOrders();

      if (!findFinancialToday) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel buscar o resumo financeiro de hoje",
          resumeToday: {
            totalSell: 0,
            qtdSell: 0,
          },
        });
      } else {
        const today = infoDate;

        const allDatesOrders = {};

        findFinancialToday.forEach((orders) => {
          const { dateCreated, valueWithDiscount, valueNoDiscount } = orders;

          if (!allDatesOrders[dateCreated]) {
            allDatesOrders[dateCreated] = {
              dateCreated: 0,
              totalSell: 0,
              qtdSell: 0,
            };
          }

          if (valueWithDiscount < valueNoDiscount) {
            allDatesOrders[dateCreated].dateCreated = dateCreated;
            allDatesOrders[dateCreated].totalSell += valueWithDiscount;
          } else {
            allDatesOrders[dateCreated].dateCreated = dateCreated;
            allDatesOrders[dateCreated].totalSell += valueNoDiscount;
          }

          allDatesOrders[dateCreated].qtdSell++;
        });

        const organizeOrder = [];

        for (const [, currentOrder] of Object.entries(allDatesOrders)) {
          organizeOrder.push(currentOrder);
        }

        const resumeOrders = findFinancialToday.filter((orders) => {
          if (
            FormatDateUtil.compareDatesAfter(orders.dateCreated, today) === 0
          ) {
            return orders;
          }
        });

        const todayOrders = organizeOrder.filter((orders) => {
          if (
            FormatDateUtil.compareDatesAfter(orders.dateCreated, today) === 0
          ) {
            return orders;
          }
        });

        const resumeToday = todayOrders[0];

        if (todayOrders.length === 0) {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            resumeToday: {
              totalSell: 0,
              qtdSell: 0,
            },
          };
        } else {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            resumeToday: resumeToday,
            resumeOrders: resumeOrders,
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
  async getFinancialMonth(dataMonth) {
    try {
      const findFinancialMonth = await OrderModelInstance.getAllOrders();
      if (!findFinancialMonth) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Sem registro de vendas do mes atual",
          totalByOrders: {
            totalOrders: 0,
            totalSell: 0,
          },
        });
      } else {
        // ! - Organizar essa data
        const currentMonth = dataMonth;

        const allDatesOrders = {};

        for (const payments of findFinancialMonth) {
          const infoPayment =
            await ReceiveServiceInstance.getResumeReceiveByOrder(
              payments.idOrder
            );

          if (infoPayment.codeStatus === 200) {
            payments.paymentsStatus = infoPayment.resumeReceive;
          }
        }


        findFinancialMonth.forEach((orders) => {
          const {
            dateCreated,
            valueWithDiscount,
            valueNoDiscount,
            paymentsStatus,
          } = orders;


          if (!allDatesOrders[dateCreated]) {
            allDatesOrders[dateCreated] = {
              dateCreated: 0,
              totalSell: 0,
              totalOrders: 0,
              totalReceive: 0,
              totalPayed: 0,
            };
          }

          if (valueWithDiscount < valueNoDiscount) {
            allDatesOrders[dateCreated].dateCreated = dateCreated;
            allDatesOrders[dateCreated].totalSell += Number(
              valueWithDiscount.toFixed(2)
            );
          } else {
            allDatesOrders[dateCreated].dateCreated = dateCreated;
            allDatesOrders[dateCreated].totalSell += Number(
              valueNoDiscount.toFixed(2)
            );
          }
          allDatesOrders[dateCreated].totalOrders++;
          if (!paymentsStatus === undefined) {
            allDatesOrders[dateCreated].totalReceive +=
              paymentsStatus.totalToReceive;
            allDatesOrders[dateCreated].totalPayed += paymentsStatus.totalPayed;
          }
        });

        const organizeOrder = [];

        for (const [, currentOrder] of Object.entries(allDatesOrders)) {
          organizeOrder.push(currentOrder);
        }

        let totalByOrders = {
          totalOrders: 0,
          totalSell: 0,
          totalReceive: 0,
          totalToPayed: 0,
        };

        organizeOrder.filter((orders) => {
          const dateCreated = orders.dateCreated;
          const dateCreatedMonth = FormatDateUtil.formatMonth(dateCreated);

          if (
            FormatDateUtil.compareMonthDates(dateCreatedMonth, currentMonth) ===
            0
          ) {
            totalByOrders.totalSell += Number(orders.totalSell.toFixed(2));
            totalByOrders.totalOrders += orders.totalOrders;
            totalByOrders.totalReceive += orders.totalReceive;
            totalByOrders.totalToPayed += orders.totalPayed;
          }
        });

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          totalByOrders: totalByOrders,
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

  async getOrdersByCard(infoDate) {
    try {
      // ! - Organizar essa data
      const currentMonth = infoDate;
      const findOrdersByCard = await OrderModelInstance.getOrdersByPayment();

      if (!findOrdersByCard) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Sem registro de vendas do mes atual",
        });
      } else {
        const resumePaymentByMonth = [];

        findOrdersByCard.filter((orders) => {
          const dateCreated = orders.dateCreated;
          // ! - Organizar essa data
          const dateCreatedMonth = FormatDateUtil.formatMonth(dateCreated);

          if (
            FormatDateUtil.compareMonthDates(dateCreatedMonth, currentMonth) ===
            0
          ) {
            resumePaymentByMonth.push(orders);
          }
        });
        const organizeOrders = [];

        resumePaymentByMonth.forEach((currentOrder) => {
          const { formPayment, valueWithDiscount, valueNoDiscount } =
            currentOrder;

          if (!organizeOrders[formPayment]) {
            organizeOrders[formPayment] = {
              formPayment: "",
              totalSell: 0,
              totalOrders: 0,
            };
          }

          if (valueWithDiscount < valueNoDiscount) {
            organizeOrders[formPayment].totalSell += Number(
              valueWithDiscount.toFixed(2)
            );
            organizeOrders[formPayment].totalOrders++;
          } else {
            organizeOrders[formPayment].totalSell += Number(
              valueNoDiscount.toFixed(2)
            );
            organizeOrders[formPayment].totalOrders++;
          }

          organizeOrders[formPayment].formPayment = formPayment;
        });

        let resumeByPayment = {
          account: 0,
          money: 0,
        };

        for (const [, currentPayment] of Object.entries(organizeOrders)) {
          if (currentPayment.formPayment !== "dinheiro") {
            resumeByPayment.account += currentPayment.totalSell;
          } else {
            resumeByPayment.money += currentPayment.totalSell;
          }
        }

        if (resumePaymentByMonth.length === 0) {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 400,
            message: "Não foi possivel encontrar pagamentos nessa data",
          };
        } else {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            resumeByPayment: resumeByPayment,
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
  async getOrdersByCardByDay(infoDate) {
    try {
      // ! - Organizar essa data
      const findOrdersByCard = await OrderModelInstance.getOrdersByPayment();

      if (!findOrdersByCard) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Sem registro de vendas do mes atual",
        });
      } else {
        let today = infoDate;
        const resumePaymentByDay = [];

        findOrdersByCard.filter((orders) => {
          if (
            FormatDateUtil.compareDatesAfter(orders.dateCreated, today) === 0
          ) {
            resumePaymentByDay.push(orders);
          }
        });
        const organizeOrders = [];

        resumePaymentByDay.forEach((currentOrder) => {
          const {
            formPayment,
            valueWithDiscount,
            valueNoDiscount,
            valueClientPayed,
          } = currentOrder;

          if (!organizeOrders[formPayment]) {
            organizeOrders[formPayment] = {
              formPayment: "",
              totalSell: 0,
              totalOrders: 0,
              valueClientPayed: 0,
            };
          }

          if (valueWithDiscount < valueNoDiscount) {
            organizeOrders[formPayment].totalSell += Number(
              valueWithDiscount.toFixed(2)
            );
            organizeOrders[formPayment].totalOrders++;
          } else {
            organizeOrders[formPayment].totalSell += Number(
              valueNoDiscount.toFixed(2)
            );
            organizeOrders[formPayment].totalOrders++;
          }
          if (formPayment === "dinheiro") {
            organizeOrders[formPayment].valueClientPayed += valueClientPayed;
          }

          organizeOrders[formPayment].formPayment = formPayment;
        });

        let resumeByPaymentByDay = {
          card: 0,
          money: 0,
          pix: 0,
          totalAccount: 0,
          totalClientPayed: 0,
        };

        for (const [, currentPayment] of Object.entries(organizeOrders)) {
          if (currentPayment.formPayment === "dinheiro") {
            resumeByPaymentByDay.money += currentPayment.totalSell;
            resumeByPaymentByDay.totalClientPayed =
              currentPayment.valueClientPayed;
          }
          if (
            currentPayment.formPayment === "debito" ||
            currentPayment.formPayment === "credito"
          ) {
            resumeByPaymentByDay.card += currentPayment.totalSell;
            resumeByPaymentByDay.totalAccount += currentPayment.totalSell;
          }
          if (currentPayment.formPayment === "pix") {
            resumeByPaymentByDay.pix += currentPayment.totalSell;
            resumeByPaymentByDay.totalAccount += currentPayment.totalSell;
          }
        }

        if (resumePaymentByDay.length === 0) {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 400,
            message: "Não foi possivel encontrar pagamentos nessa data",
            resumeByPaymentByDay: resumeByPaymentByDay,
          };
        } else {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            resumeByPaymentByDay: resumeByPaymentByDay,
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

  async getOrdersByChange(infoDate) {
    try {
      const findFinancialToday = await OrderModelInstance.getAllOrders();

      if (!findFinancialToday) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel buscar o resumo financeiro de hoje",
          resumeToday: {
            valueChange: 0,
          },
        });
      } else {
        // const date = new Date();
        // ! - Organizar essa data
        let today = infoDate;

        const allDatesOrders = {};

        findFinancialToday.forEach((orders) => {
          const { dateCreated, valueChange } = orders;

          if (!allDatesOrders[dateCreated]) {
            allDatesOrders[dateCreated] = {
              dateCreated: 0,
              valueChange: 0,
            };
          }

          allDatesOrders[dateCreated].dateCreated = dateCreated;
          allDatesOrders[dateCreated].valueChange += valueChange;
        });

        const organizeOrder = [];

        for (const [, currentOrder] of Object.entries(allDatesOrders)) {
          organizeOrder.push(currentOrder);
        }

        const todayOrders = organizeOrder.filter((orders) => {
          if (
            FormatDateUtil.compareDatesAfter(orders.dateCreated, today) === 0
          ) {
            return orders;
          }
        });

        const resumeToday = todayOrders[0];

        if (todayOrders.length === 0) {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            resumeToday: {
              valueChange: 0,
            },
          };
        } else {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            resumeToday: resumeToday,
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

  //Melhorar a forma de filtrar esses clientes, com o status ativo
  async getAllClients() {
    try {
      const findAllClientOrders = await ClientServiceInstance.getAllClient();

      if (!findAllClientOrders) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Erro ao buscar todos os clientes",
        });
      } else {
        return findAllClientOrders.client.length;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getAllOrders() {
    try {
      const findAllOrders = await OrderServiceInstance.getListAllOrders();

      if (findAllOrders.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel carregar os pedidos",
          orders: [],
        });
      } else {
        return findAllOrders;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getIdOrderClients(idClients) {
    try {
      const findOrderClients = await OrderModelInstance.getOrderByClient(
        idClients
      );

      if (!findOrderClients) {
        return createHttpError(404, "Erro ao buscar pedidos com esse cliente");
      } else {
        //Somar o valor total dos pedidos feito por esse cliente
        return {
          codeStatus: 200,
          message: "Pedidos carregado com sucesso",
          orderClient: findOrderClients,
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

  async getFinancialResume(dataMonth) {
    try {
      const findFinancialMonth = await OrderModelInstance.getAllOrders();

      if (!findFinancialMonth) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Sem registro de vendas do mes atual",
        });
      } else {
        // ! - Organizar essa data
        const currentMonth = dataMonth;

        for (const orders of findFinancialMonth) {
          const infoClient = await ClientServiceInstance.getClientById(
            orders.idClient
          );

          const infoItens = await CartServiceInstance.findItemsCartByOrder(
            orders.idOrder
          );
          if (!orders.itens) {
            orders.itens = [];
          }

          for (const item of infoItens) {
            orders.itens.push(item.codProd);
          }

          orders.nameClient =
            infoClient.client.clientName + " " + infoClient.client.lastName;
        }

        const resumeByMonth = [];

        findFinancialMonth.filter((orders) => {
          const dateCreated = orders.dateCreated;
          // ! - Organizar essa data
          const dateCreatedMonth = FormatDateUtil.formatMonth(dateCreated);

          if (
            FormatDateUtil.compareMonthDates(dateCreatedMonth, currentMonth) ===
            0
          ) {
            resumeByMonth.push(orders);
          }
        });

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          ordersByMonth: resumeByMonth,
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
}
