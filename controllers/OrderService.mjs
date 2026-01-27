import createHttpError from "http-errors";
import BudgetService from "./BudgetService.mjs";
import ClientService from "./ClientService.mjs";
import ComissionService from "./ComissionService.mjs";
import ProductService from "./ProductService.mjs";
import OrderModel from "../models/orderModel.mjs";
import CartService from "./CartService.mjs";
import OrderStockService from "./OrderStockService.mjs";
import FormatDates from "../utils/FormatDates.mjs";
import ReceiveService from "./ReceiveService.mjs";

const BudgetServiceInstance = new BudgetService();
const CartServiceInstance = new CartService();
const ClientServiceInstance = new ClientService();
const ComissionServiceInstance = new ComissionService();
const FormatDatesUtils = new FormatDates();
const ProductServiceInstance = new ProductService();
const ReceiveServiceInstance = new ReceiveService();
const OrderStockServiceInstance = new OrderStockService();
const OrderModelInstance = new OrderModel();

export default class OrderService {
  async getAllOrders() {
    try {
      const allOrders = await OrderModelInstance.getAllOrders();

      if (!allOrders) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi encontrado os pedidos",
        });
      } else {
        return {
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          orders: allOrders,
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

  async getNextOrder() {
    try {
      const nextOrder = await OrderModelInstance.getNextOrderNumber();

      if (nextOrder === undefined) {
        return createHttpError({
          codeStatus: 404,
          messageError: "Nâo foi possivel encontrar ultimo pedido",
          order: 0,
        });
      } else {
        return {
          codeStatus: 200,
          message: "Ultimo pedido encontrado com sucesso",
          order: nextOrder.idOrder,
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

  async createOrder(dataOrder) {
    const infoOrder = dataOrder;

    const orderItems = infoOrder.itensOrder;

    const organizeItems = await orderItems.reduce(
      (resultOrder, currentOrder) => {
        const { idProduct, qtd, codProd, nameProduct } = currentOrder;

        if (!resultOrder[idProduct]) {
          resultOrder[idProduct] = {
            idProduct: 0,
            qtd: 0,
            nameProduct: "",
            codProd: 0,
          };
        }

        resultOrder[idProduct].idProduct = idProduct;
        resultOrder[idProduct].nameProduct = nameProduct;
        resultOrder[idProduct].codProd = codProd;
        resultOrder[idProduct].qtd += qtd;

        return resultOrder;
      },
      {}
    );

    for (const [, currentOrder] of Object.entries(organizeItems)) {
      const verifyQtd = await OrderStockServiceInstance.getItemStock(
        currentOrder
      );
      if (verifyQtd.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          sucessStatus: false,
          codeStatus: 404,
          message: `O item ${currentOrder.nameProduct} (codigo: ${currentOrder.codProd}) não tem quantidade suficiente no estoque.`,
        });
      }
    }

    try {
      const infoOrderStart = {
        idOrder: infoOrder.idOrder,
        statusOrder: "pending",
      };

      await OrderModelInstance.startOrder(infoOrderStart);

      if (Array.isArray(infoOrder?.formPayment)) {
        for (const infoPayment of infoOrder.formPayment) {
          delete infoPayment.idOrderPayment;

          infoPayment.idOrder = infoOrderStart.idOrder;

          infoPayment.description =
            infoPayment.description + " do pedido Nº " + infoOrderStart.idOrder;

          infoPayment.receiptDate = FormatDatesUtils.formatDateNoHour(
            infoPayment.receiptDate
          );

          await OrderModelInstance.createFormPayment(infoPayment);
        }
      }

      infoOrder.dateCreated = FormatDatesUtils.getDateNoHour();

      for await (const items of orderItems) {
        delete items.nameProduct;
        delete items.idCartItem;

        const getIdProduct = await ProductServiceInstance.getCodProduct(
          items.codProd
        );

        if (Object.hasOwn(getIdProduct.product, "idSubProduct")) {
          items.codProd = getIdProduct.product.codProd;
        } else {
          items.idProduct = getIdProduct.product.idProduct;
        }
        items.idOrder = infoOrder.idOrder;
        var percentDiscount =
          ((items.priceSell - items.priceWithDiscount) / items.priceSell) * 100;
        items.percentDiscount = percentDiscount.toFixed(2);

        await OrderStockServiceInstance.createOrderOutStock(items);

        const createItensCart =
          await CartServiceInstance.createCartItemsByOrder(items);

        if (createItensCart === true) {
          delete infoOrder.itensOrder;
        }
      }

      const infoClient = infoOrder.infoClient;
      if (infoClient.nameClient === "Cliente Não identificado") {
        delete infoClient.nameClient;
        infoClient.idClient = 0;
        infoClient.idOrder = infoOrder.idOrder;
        infoClient.valueDelivery = infoOrder.valueDelivery;
        infoClient.dateCreated = FormatDatesUtils.getDateNoHour();

        const deliveryNoClient = await OrderModelInstance.createDeliveryOrder(
          infoClient
        );
        infoOrder.idDeliveryOrders = deliveryNoClient.idDeliveryOrder;
        infoOrder.idClient = 0;
      } else {
        delete infoClient.nameClient;
        infoClient.valueDelivery = infoOrder.valueDelivery;
        infoClient.idOrder = infoOrder.idOrder;
        infoClient.dateCreated = FormatDatesUtils.getDateNoHour();

        const createDeliveryOrder =
          await OrderModelInstance.createDeliveryOrder(infoClient);
        infoOrder.idDeliveryOrders = createDeliveryOrder.idDeliveryOrder;
        infoOrder.idClient = infoClient.idClient;
      }

      delete infoOrder.infoClient;
      infoOrder.statusOrder = "concluido";

      if ("idBudget" in infoOrder) {
        infoOrder.formPayment = infoOrder.formPayment[0].formPayment;
      }
      const createNewOrder = await OrderModelInstance.updateOrder(infoOrder);

      let comission = {
        idEmployee: infoOrder.idEmployee,
        idOrder: infoOrder.idOrder,
        valueComission: 0,
        percentComission: infoOrder.percentComission,
        dateComission: infoOrder.dateCreated,
        statusPayment: "não paga",
      };

      if (
        comission.percentComission == null ||
        comission.percentComission < 0 ||
        comission.percentComission > 100
      ) {
        throw new Error("Percentual de comissão inválido.");
      }

      const baseValue = Math.min(
        infoOrder.valueWithDiscount,
        infoOrder.valueNoDiscount
      );
      comission.valueComission =
        Math.round(baseValue * (comission.percentComission / 100) * 100) / 100;

      await ComissionServiceInstance.createComission(comission);

      const detailsOrder = await this.getOrderById(
        createNewOrder.order.idOrder
      );

      infoOrder.itemsCart = detailsOrder;

      if (createNewOrder.codeStatus === 200) {
        if ("idBudget" in infoOrder) {
          const infoBudget = {
            idBudget: infoOrder.idBudget,
            statusBudget: "aprovado",
          };
          await BudgetServiceInstance.updateBudget(infoBudget);
        }
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Pedido realizado com sucesso",
          order: infoOrder,
        };
      } else {
        return {
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          message: "Erro ao adicionar novo pedido",
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Erro interno ao criar o pedido. Contate o administrador.",
        info: err,
      });
    }
  }

  async getListAllOrders() {
    try {
      const findAllClientOrders = await OrderModelInstance.getAllOrders();

      if (findAllClientOrders) {
        for await (const ordersClients of findAllClientOrders) {
          const nameClient = await ClientServiceInstance.getClientById(
            ordersClients.idClient
          );

          const infoPayments =
            await ReceiveServiceInstance.getResumeReceiveByOrder(
              ordersClients.idOrder
            );

          ordersClients.paymentInfo = infoPayments.resumeReceive;
          ordersClients.clientName = nameClient.client.clientName;
          ordersClients.lastName = nameClient.client.lastName;
        }

        // Organizar os pedidos por cliente
        const allOrdersByClient = await findAllClientOrders.reduce(
          (resultOrder, currentOrder) => {
            const idClient = currentOrder.idClient;
            const clientName = currentOrder.clientName;
            const lastName = currentOrder.lastName;
            const valueNoDiscount = currentOrder.valueNoDiscount;
            const valueWithDiscount = currentOrder.valueWithDiscount;
            const paymentInfo = currentOrder.paymentInfo;

            if (!resultOrder[idClient]) {
              resultOrder[idClient] = {
                idClient: 0,
                nameClient: "",
                lastName: "",
                totalBuyed: 0,
                totalOrders: 0,
                totalReceive: 0,
                totalPayed: 0,
              };
            }
            if (valueWithDiscount < valueNoDiscount) {
              resultOrder[idClient].totalBuyed += valueWithDiscount;
            } else {
              resultOrder[idClient].totalBuyed += valueNoDiscount;
            }
            resultOrder[idClient].idClient = idClient;
            resultOrder[idClient].nameClient = clientName;
            resultOrder[idClient].lastName = lastName;
            if (!paymentInfo === undefined) {
              resultOrder[idClient].totalReceive += paymentInfo.totalToReceive;
              resultOrder[idClient].totalPayed += paymentInfo.totalPayed;
            }
            resultOrder[idClient].totalOrders++;

            return resultOrder;
          },
          {}
        );
        const organizeOrders = [];

        for (const [, currentOrder] of Object.entries(allOrdersByClient)) {
          currentOrder.totalBuyed = Number(currentOrder.totalBuyed.toFixed(2));
          organizeOrders.push(currentOrder);
        }

        if (!findAllClientOrders) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Sem registro de vendas do mes atual",
          });
        } else {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Os pedidos foram carregados com sucesso",
            orders: organizeOrders,
          };
        }
      } else {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não existe pedidos feitos",
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
  async findOrderByClient(idClient) {
    try {
      const orderClient = await OrderModelInstance.getOrderByClient(idClient);

      if (orderClient === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          message: "Não foi possivel carregar os pedidos dos clientes",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Pedidos carregados com sucesso",
          orderClients: orderClient,
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

  async findOrdersByEmployee(idOrder) {
    try {
      const infoComission = await ComissionServiceInstance.getComissionByOrder(
        idOrder
      );
      if (infoComission.codeStatus === 404) {
        return "Sem Vendedor";
      } else {
        return infoComission.nameEmployee;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async findLastOrderByClient(dataClient) {
    try {
      const idClient = dataClient;
      const lastOrder = await OrderModelInstance.getLastOrderByClient(idClient);
      if (lastOrder === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          message: "Não foi possivel carregar o ultimo pedido desse cliente",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Pedidos carregados com sucesso",
          lastOrder: lastOrder,
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

  async getOrderById(infoOrder) {
    try {
      const idOrder = infoOrder;

      return await CartServiceInstance.findItemsCartByOrder(idOrder);
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getIdOrders(idOrders) {
    try {
      const multiOrders = await OrderModelInstance.getOrderMultiIds(idOrders);

      if (multiOrders === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          message: "Não foi possivel carregar as vendas",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          allOrders: multiOrders,
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
  async getInfoOrderById(idOrder) {
    try {
      const infoOrder = await OrderModelInstance.getOrderById(idOrder);

      const infoClient = await ClientServiceInstance.getClientById(
        infoOrder.idClient
      );

      infoOrder.nameClient =
        infoClient.client.clientName + " " + infoClient.client.lastName;

      if (infoOrder === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          message: "Não foi possivel carregar as vendas",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          order: infoOrder,
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
