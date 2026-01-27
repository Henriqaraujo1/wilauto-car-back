import createHttpError from "http-errors";
import ClientService from "./ClientService.mjs";
import CartService from "./CartService.mjs";
import OrderService from "./OrderService.mjs";
import DeliveryService from "./DeliveryService.mjs";
import ReceiveService from "./ReceiveService.mjs";

const CartServiceInstance = new CartService();
const ClientServiceInstance = new ClientService();
const DeliveryOrdersInstance = new DeliveryService();
const OrderServiceInstance = new OrderService();
const ReceiveServiceInstance = new ReceiveService();

export default class ResumeClientsService {
  async getInfoOrdersByClient(infoClientId) {
    try {
      const findTotalOrdersClient =
        await OrderServiceInstance.findOrderByClient(infoClientId);

      for (const infoOrder of findTotalOrdersClient.orderClients) {
        const infoEmployee = await OrderServiceInstance.findOrdersByEmployee(
          infoOrder.idOrder
        );

        const infoDelivery = await DeliveryOrdersInstance.getDeliveryByOrder(
          infoOrder.idOrder
        );

        const infoPayment =
          await ReceiveServiceInstance.getResumeReceiveByOrder(
            infoOrder.idOrder
          );

        if (infoPayment.codeStatus === 404) {
          infoOrder.infoPaymentsOrder = false;
        } else if (infoPayment.codeStatus === 200) {
          infoOrder.infoPaymentsOrder = true;
        }

        if (infoDelivery.codeStatus === 200) {
          infoOrder.infoClient = infoDelivery.delivery;
        }

        infoOrder.paymentsInfo = infoPayment.resumeReceive;
        infoOrder.nameEmployee = infoEmployee;
      }

      const organizeOrdersByClient =
        await findTotalOrdersClient.orderClients.reduce(
          (resultOrder, currentOrder) => {
            const idOrder = currentOrder.idOrder;
            const idClient = currentOrder.idClient;
            const dateCreated = currentOrder.dateCreated;
            const discountOption = currentOrder.discountOption;
            const formPayment = currentOrder.formPayment;
            const idDeliveryOrders = currentOrder.idDeliveryOrders;
            const statusOrder = currentOrder.statusOrder;
            const valueChange = currentOrder.valueChange;
            const valueClientPayed = currentOrder.valueClientPayed;
            const valueDelivery = currentOrder.valueDelivery;
            const valueDiscount = currentOrder.valueDiscount;
            const valueNoDiscount = currentOrder.valueNoDiscount;
            const valueWithDiscount = currentOrder.valueWithDiscount;
            const nameEmployee = currentOrder.nameEmployee;
            const qtdItens = currentOrder.qtdItens;
            const infoDelivery = currentOrder.infoClient;
            const paymentsInfo = currentOrder.paymentsInfo;
            const infoPaymentsOrder = currentOrder.infoPaymentsOrder;

            if (!resultOrder[idClient]) {
              resultOrder[idClient] = {
                totalBuyed: 0,
                totalOrders: 0,
                totalToReceive: 0,
                totalPayed: 0,
                ordersList: [],
              };
            }

            if (valueWithDiscount < valueNoDiscount) {
              resultOrder[idClient].totalBuyed += valueWithDiscount;
            } else {
              resultOrder[idClient].totalBuyed += valueNoDiscount;
            }
            resultOrder[idClient].totalOrders++;
            if (!paymentsInfo === undefined) {
              resultOrder[idClient].totalPayed += paymentsInfo.totalPayed;
              resultOrder[idClient].totalToReceive +=
                paymentsInfo.totalToReceive;
            }

            if (paymentsInfo === undefined) {
              resultOrder[idClient].totalPayed =
                resultOrder[idClient].totalBuyed;
            }

            if (valueWithDiscount < valueNoDiscount) {
              resultOrder[idClient].ordersList.push({
                idOrder: idOrder,
                dateCreated: dateCreated,
                discountOption: discountOption,
                idDeliveryOrders: idDeliveryOrders,
                statusOrder: statusOrder,
                totalOrder: valueWithDiscount,
                valueDiscount: valueDiscount,
                nameEmployee: nameEmployee,
                qtdItens: qtdItens,
                infoDelivery: infoDelivery,
                infoPaymentsOrder: infoPaymentsOrder,
                infoPayment: {
                  discountOption: discountOption,
                  formPayment: formPayment,
                  valueDiscount: valueDiscount,
                  valueChange: valueChange,
                  valueClientPayed: valueClientPayed,
                  valueDiscount: valueDiscount,
                  valueDelivery: valueDelivery,
                  valueNoDiscount: valueNoDiscount,
                  valueWithDiscount: valueWithDiscount,
                },
              });
            } else {
              resultOrder[idClient].ordersList.push({
                idOrder: idOrder,
                dateCreated: dateCreated,
                idDeliveryOrders: idDeliveryOrders,
                statusOrder: statusOrder,
                totalOrder: valueNoDiscount,
                nameEmployee: nameEmployee,
                qtdItens: qtdItens,
                infoDelivery: infoDelivery,
                infoPaymentsOrder: infoPaymentsOrder,
                infoPayment: {
                  discountOption: discountOption,
                  formPayment: formPayment,
                  valueDiscount: valueDiscount,
                  valueChange: valueChange,
                  valueClientPayed: valueClientPayed,
                  valueDelivery: valueDelivery,
                  valueNoDiscount: valueNoDiscount,
                  valueWithDiscount: valueWithDiscount,
                },
              });
            }

            return resultOrder;
          },
          {}
        );

      const findIdClient = await ClientServiceInstance.getClientById(
        infoClientId
      );

      const findLastBuyClient =
        await OrderServiceInstance.findLastOrderByClient(infoClientId);

      let organizeOrder = [];

      for (const [, currentOrder] of Object.entries(organizeOrdersByClient)) {
        currentOrder.totalBuyed = Number(currentOrder.totalBuyed.toFixed(2));
        currentOrder.lastOrder = findLastBuyClient.lastOrder.dateCreated;
        currentOrder.infoClient = findIdClient.client;
        organizeOrder.push(currentOrder);
      }

      const resumeClient = Object.assign({}, ...organizeOrder);
      resumeClient.ordersList.sort(
        (firstOrder, secondOrder) => secondOrder.idOrder - firstOrder.idOrder
      );

      if (!findTotalOrdersClient) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel buscar os pedidos desse cliente",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Os pedidos foram carregados com sucesso",
          orders: resumeClient,
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

  async getItemsByOrder(idOrder) {
    try {
      const itemsByOrder = await CartServiceInstance.findItemsCartByOrder(
        idOrder
      );

      let nameClient = "";
      for (const order of itemsByOrder) {
        const infoClient = await OrderServiceInstance.getInfoOrderById(
          order.idOrder
        );

        nameClient = infoClient.order.nameClient;
      }

      if (itemsByOrder.length > 0) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          nameClient: nameClient,
          itemsByOrder: itemsByOrder,
        };
      } else {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar items com esse pedido",
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
