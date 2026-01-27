//import packages
import createHttpError from "http-errors";
import ProductMoreSellModel from "../models/productMoreSellModel.mjs";
import ProductService from "./ProductService.mjs";
import OrderService from "./OrderService.mjs";
import FormatDates from "../utils/FormatDates.mjs";

// ProductMoreSell model instance
const OrderServiceInstance = new OrderService();
const ProductMoreSellModelInstance = new ProductMoreSellModel();
const ProductServiceInstance = new ProductService();
const FormatDate = new FormatDates();

export default class ProductMoreSellService {
  async getAllProductMoreSell(infoDate) {
    try {
      const allOrders = await OrderServiceInstance.getAllOrders();

      if (!allOrders) {
        return createHttpError({
          codeStatus: 404,
          message: "Erro ao carregar todos os Tipos",
        });
      } else {
        const organizeOrders = [];

        allOrders.orders.forEach((orders) => {
          const { idOrder } = orders;

          const dateCreated = FormatDate.formatMonth(orders.dateCreated);

          if (!organizeOrders[dateCreated]) {
            organizeOrders[dateCreated] = {
              idOrder: [],
            };
          }

          organizeOrders[dateCreated].idOrder.push(idOrder);
          organizeOrders[dateCreated].dateCreated = dateCreated;
        });

        const ordersByDate = [];

        for (const [, currentOrder] of Object.entries(organizeOrders)) {
          ordersByDate.push(currentOrder);
        }

        const filterOrders = ordersByDate.filter((orders) =>
          infoDate
            ? FormatDate.compareMonthDates(orders.dateCreated, infoDate) >= 0
            : orders
        );

        if (filterOrders.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não existe produtos vendidos nesse periodo",
          });
        } else {
          const allProductMoreSells =
            await ProductMoreSellModelInstance.getAllProductMoreSell(
              filterOrders[0].idOrder
            );

          const organizeProducts = {};

          allProductMoreSells.forEach((product) => {
            const {
              idProduct,
              qtd,
              codProd,
              priceWithDiscount,
              priceNoDiscount,
            } = product;

            if (!organizeProducts[codProd]) {
              organizeProducts[codProd] = {
                idProduct: 0,
                codProd: 0,
                totalSell: 0,
                qtdSell: 0,
              };
            }

            if (priceWithDiscount < priceNoDiscount) {
              organizeProducts[codProd].codProd = codProd;
              organizeProducts[codProd].idProduct = idProduct;
              organizeProducts[codProd].qtdSell += qtd;
              organizeProducts[codProd].totalSell += Number(
                priceWithDiscount.toFixed(2)
              );
            } else {
              organizeProducts[codProd].codProd = codProd;
              organizeProducts[codProd].idProduct = idProduct;
              organizeProducts[codProd].qtdSell += qtd;
              organizeProducts[codProd].totalSell += Number(
                priceNoDiscount.toFixed(2)
              );
            }
          });

          const organizeProductInfo = [];

          for (const [, currentProduct] of Object.entries(organizeProducts)) {
            const infoProduct = await ProductServiceInstance.getCodProduct(
              currentProduct.codProd
            );

            currentProduct.nameProduct = infoProduct.product.nameProduct;
            organizeProductInfo.push(currentProduct);
          }

          organizeProductInfo.sort(
            (firstOrder, secondOrder) =>
              secondOrder.totalSell - firstOrder.totalSell
          );

          return {
            codeStatus: 200,
            message: "Todos os produtos mais vendidos foram carregadas",
            productMoreSells: organizeProductInfo,
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
  async getProductMoreSellById(nameProductMoreSell) {
    try {
      const findProductMoreSell =
        await ProductMoreSellModelInstance.getProductMoreSellInfo(
          nameProductMoreSell.toLowerCase()
        );

      if (!findProductMoreSell) {
        return createHttpError({
          codeStatus: 404,
          message: "Tipo não encontrada",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Tipo encontrada",
          productMoreSell: findProductMoreSell,
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
