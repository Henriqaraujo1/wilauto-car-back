import createHttpError from "http-errors";
import ComissionModel from "../models/comissionModel.mjs";
import EmployeeService from "./EmployeeService.mjs";
import FormatDate from "../utils/FormatDates.mjs";
import PositionService from "./WorkPositionService.mjs";
import OrderService from "./OrderService.mjs";
import ExpenseService from "./ExpenseService.mjs";

const ComissionModelInstance = new ComissionModel();
const ExpenseServiceInstance = new ExpenseService();
const EmployeeServiceInstance = new EmployeeService();
const FormatDateUtil = new FormatDate();
const PositionServiceInstance = new PositionService();

export default class ComissionService {
  async getAllComission() {
    try {
      const allComissions = await ComissionModelInstance.getAllComission();

      if (!allComissions) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel buscar as comissões do mês",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Comissões encontradas com sucesso",
          comissions: allComissions,
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
  async getComissionByMonth(dataMonth) {
    try {
      const findComissionMonth = await ComissionModelInstance.getAllComission();

      const OrderServiceInstance = new OrderService();

      for (const comission of findComissionMonth) {
        const infoOrder = await OrderServiceInstance.getInfoOrderById(
          comission.idOrder
        );

        if (
          infoOrder.order.valueWithDiscount < infoOrder.order.valueNoDiscount
        ) {
          comission.totalOrder = infoOrder.order.valueWithDiscount;
        } else {
          comission.totalOrder = infoOrder.order.valueNoDiscount;
        }
      }

      if (!findComissionMonth) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Sem registro de comissões do mes Selecionado",
        });
      } else {
        const currentMonth = dataMonth;

        const resumeComissionMonth = [];

        findComissionMonth.filter((comission) => {
          const dateMonth = comission.dateComission;
          const dateCreatedMonth = FormatDateUtil.formatMonth(dateMonth);
          if (
            FormatDateUtil.compareMonthDates(dateCreatedMonth, currentMonth) ===
            0
            // && comission.statusPayment === "não paga"
          ) {
            resumeComissionMonth.push(comission);
          }
        });

        const allDatesComission = {};

        resumeComissionMonth.forEach((comission) => {
          const {
            idComission,
            dateComission,
            percentComission,
            valueComission,
            idOrder,
            idEmployee,
            idPosition,
            statusPayment,
            totalOrder,
          } = comission;

          if (!allDatesComission[idEmployee]) {
            allDatesComission[idEmployee] = {
              dateComission: "0",
              percentComission: 0,
              totalComissionNoPayed: 0,
              totalComissionPayed: 0,
              idOrder: [],
              idComissionPayed: [],
              idComissionNoPayed: [],
              idEmployee: 0,
              totalSells: 0,
              idPosition: 0,
              statusPayment: "",
              totalComission: 0,
              totalOrder: 0,
            };
          }

          if (statusPayment === "não paga") {
            allDatesComission[idEmployee].totalComissionNoPayed +=
              valueComission;
            allDatesComission[idEmployee].idComissionNoPayed.push(idComission);
          } else {
            allDatesComission[idEmployee].totalComissionPayed += valueComission;
            allDatesComission[idEmployee].idComissionPayed.push(idComission);
          }

          allDatesComission[idEmployee].idEmployee = idEmployee;
          allDatesComission[idEmployee].idPosition = idPosition;
          allDatesComission[idEmployee].totalComission += valueComission;
          allDatesComission[idEmployee].dateComission = dateComission;
          allDatesComission[idEmployee].percentComission = percentComission;
          allDatesComission[idEmployee].totalSells++;
          allDatesComission[idEmployee].totalOrder += totalOrder;
          allDatesComission[idEmployee].idOrder.push(idOrder);
        });

        const organizeComission = [];

        for (const [, currentOrder] of Object.entries(allDatesComission)) {
          organizeComission.push(currentOrder);
        }
        const resumeComissions = {
          totalComissions: 0,
          qtdComissions: 0,
          highComission: {
            nameEmployee: "",
            valueComission: 0,
          },
        };

        for (const employee of organizeComission) {
          // Obtenha os dados do funcionário
          const infoEmployee = await EmployeeServiceInstance.getEmployeeById(
            employee.idEmployee
          );

          const infoPosition = await PositionServiceInstance.getIdPosition(
            infoEmployee.employee.idPosition
          );

          // Atribua o nome completo e a função do funcionário
          employee.nameEmployee =
            infoEmployee.employee.firstName +
            " " +
            infoEmployee.employee.lastName;
          employee.idPosition = infoPosition.infoPosition.idPosition;
          employee.namePosition = infoPosition.infoPosition.namePosition;

          // Acumular o total de comissões
          resumeComissions.totalComissions += employee.totalComission;
          resumeComissions.qtdComissions += employee.totalSells;

          // Verificar e atualizar a maior comissão
          if (
            employee.totalComission >
            resumeComissions.highComission.valueComission
          ) {
            resumeComissions.highComission = {
              nameEmployee: employee.nameEmployee,
              valueComission: employee.totalComission,
            };
          }
        }

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          comissions: organizeComission,
          resumeComission: resumeComissions,
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

  async getComissionByOrder(idOrder) {
    try {
      const infoComission = await ComissionModelInstance.getComissionByOrder(
        idOrder
      );

      if (infoComission === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar comissão desse pedido",
        });
      } else {
        const infoEmployee = await EmployeeServiceInstance.getEmployeeById(
          infoComission.idEmployee
        );

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          nameEmployee:
            infoEmployee.employee.firstName +
            " " +
            infoEmployee.employee.lastName,
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

  async getOrdersByEmployee(infoOrders) {
    try {
      const OrderServiceInstance = new OrderService();
      const ordersByEmployee = await OrderServiceInstance.getIdOrders(
        infoOrders
      );

      for (const order of ordersByEmployee.allOrders) {
        const infoComission = await ComissionModelInstance.getComissionByOrder(
          order.idOrder
        );

        order.valueComission = infoComission.valueComission;
        order.statusPayment = infoComission.statusPayment;
        order.datePayment = infoComission.datePayment;
      }

      const resultOrder = [];

      await ordersByEmployee.allOrders.forEach((orders) => {
        const {
          idOrder,
          valueDiscount,
          valueNoDiscount,
          valueWithDiscount,
          formPayment,
          dateCreated,
          discountOption,
          valueComission,
          valueClientPayed,
          valueChange,
          valueDelivery,
          statusPayment,
          datePayment,
        } = orders;

        if (!resultOrder[idOrder]) {
          resultOrder[idOrder] = {
            idOrder: 0,
            dateCreated: "",
            totalOrder: 0,
            valueComission: 0,
            statusPaymentComission: "",
            datePaymentComission: 0,
            infoPayment: {
              valueDiscount: 0,
              formPayment: "",
              valueClientPayed: 0,
              valueChange: 0,
              valueDelivery: 0,
              discountOption: "",
            },
          };
        }
        if (valueWithDiscount < valueNoDiscount) {
          resultOrder[idOrder].totalOrder += valueWithDiscount;
        } else {
          resultOrder[idOrder].totalOrder += valueNoDiscount;
        }

        resultOrder[idOrder].dateCreated = dateCreated;
        resultOrder[idOrder].idOrder = idOrder;
        resultOrder[idOrder].valueComission = valueComission;
        resultOrder[idOrder].infoPayment.valueDiscount = valueDiscount;
        resultOrder[idOrder].infoPayment.valueChange = valueChange;
        resultOrder[idOrder].infoPayment.valueClientPayed = valueClientPayed;
        resultOrder[idOrder].infoPayment.formPayment = formPayment;
        resultOrder[idOrder].infoPayment.valueDelivery = valueDelivery;
        resultOrder[idOrder].infoPayment.discountOption = discountOption;
        resultOrder[idOrder].statusPaymentComission = statusPayment;
        resultOrder[idOrder].datePaymentComission = datePayment;
      });

      const organizeOrders = [];

      const getHighSell = (orders, prop) => {
        return orders.reduce(
          (max, order) => (order[prop] > max ? order[prop] : max),
          0
        );
      };

      const resumeOrders = {
        highSell: 0,
        totalSell: 0,
        totalComission: 0,
      };

      resumeOrders.highSell = getHighSell(resultOrder, "totalOrder");

      for (const [, currentOrders] of Object.entries(resultOrder)) {
        resumeOrders.totalSell += currentOrders.totalOrder;
        resumeOrders.totalComission += currentOrders.valueComission;

        organizeOrders.push(currentOrders);
      }

      if (ordersByEmployee.codeStatus === 400) {
        return createHttpError(ordersByEmployee);
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          ordersByEmployee: organizeOrders,
          resumeSells: resumeOrders,
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

  async createComission(infoComission) {
    try {
      const dataComission = infoComission;
      const newComission =
        ComissionModelInstance.createComission(dataComission);

      if (newComission) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
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

  async updateComission(infoComission) {
    try {
      const dataComission = infoComission.dataComission;
      const newExpense = {
        datePayment: infoComission.datePayment,
        expenseType: infoComission.expenseType,
        formPayment: infoComission.formPayment,
        idCategory: infoComission.idCategory,
        idSubCategory: infoComission.idSubCategory,
        destination: infoComission.destination,
        status: infoComission.status,
        value: infoComission.value,
        optionDueDate: infoComission.optionDueDate,
        description: infoComission.description,
      };

      const upComission = await ComissionModelInstance.updateComissions(
        dataComission
      );

      const createExpense = await ExpenseServiceInstance.createExpense(
        newExpense
      );

      if (upComission === true && createExpense.successStatus === true) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Despesa de comissão criada com sucesso",
        };
      } else {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          message:
            "Não foi possivel adicionar essa despesa, verifique as informações",
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
}
