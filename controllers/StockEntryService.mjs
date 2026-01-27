import createHttpError from "http-errors";
import StockEntryModel from "../models/stockEntryModel.mjs";
import StockModel from "../models/stockModel.mjs";
import StockControler from "./StockService.mjs";
import ProductService from "../controllers/ProductService.mjs";
import FormatDates from "../utils/FormatDates.mjs";
import RegisterEntryService from "./RegisterEntryService.mjs";
import ProviderService from "./ProviderService.mjs";
import ExpenseService from "./ExpenseService.mjs";

const ExpenseServiceInstance = new ExpenseService();
const FormatDatesUtils = new FormatDates();
const StockEntryModelInstance = new StockEntryModel();
const StockServiceInstance = new StockControler();
const RegisterEntryServiceInstance = new RegisterEntryService();
const ProductServiceInstance = new ProductService();
const ProviderServiceInstance = new ProviderService();

export default class StockEntryService {
  async getAllProductEntryStock() {
    try {
      const findAllProductEntry =
        await StockEntryModelInstance.getAllEntryStock();

      console;

      for (const product of findAllProductEntry) {
        const infoProvider = await ProviderServiceInstance.getProviderById(
          product.idProvider
        );
        product.nameProvider = infoProvider.provider.nameProvider;
      }

      if (!findAllProductEntry) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel carregar as entradas de produtos",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Os produtos do estoque carregaram com sucesso",
          productEntry: findAllProductEntry,
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

  async getIdStockEntry(idStockEntry) {
    try {
      const infoStockEntry = await StockEntryModelInstance.getInfoIdStock(
        idStockEntry
      );

      if (infoStockEntry === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Nâo foi possivel encontrar esse numero do pedido",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message:
            "Já existe uma entrada no estoque com esse numero do pedido ",
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

  async getLastEntryOrderByProvider(idProvider) {
    try {
      const lastStockEntry =
        await StockEntryModelInstance.getLastStockEntryByProvider(idProvider);
      if (lastStockEntry === undefined) {
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
          lastOrder: lastStockEntry,
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

  async getProductEntryId(idProduct) {
    try {
      const findProductEntry = await StockEntryModelInstance.getProductEntryId(
        idProduct
      );

      for (const nameProduct of findProductEntry) {
        const infoProduct = await ProductServiceInstance.getProductById(
          nameProduct.idProduct
        );

        nameProduct.nameProduct = infoProduct.product.nameProduct;
        nameProduct.codProduct = infoProduct.product.codProd;
      }

      const infoProductEntry = findProductEntry.sort(
        (firstProductOut, secondProductOut) =>
          secondProductOut.idStockOut - firstProductOut.idStockOut
      );

      if (!findProductEntry) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Produto não encontrado no estoque",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Produto encontrado no estoque",
          productEntry: infoProductEntry,
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

  async getEntryOrderByProvider(idProvider) {
    try {
      const findProductEntry =
        await StockEntryModelInstance.getStockEntryByProvider(idProvider);

      if (findProductEntry === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Entradas desse fornecedor não foram encontradas",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Entradas desse fornecedor encontradas",
          entryOrderByProvider: findProductEntry,
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

  async getEntryOrdersByMonth(infoMonth) {
    try {
      const allStockEntry = await StockEntryModelInstance.getAllEntryStock();

      if (allStockEntry.length > 0) {
        const formatMonth = infoMonth;
        const organizeStockEntry = [];

        for (const [, orders] of Object.entries(allStockEntry)) {
          const { valueFinalOrder } = orders;

          const dateEntry = FormatDatesUtils.formatMonth(orders.dateEntry);

          if (!organizeStockEntry[dateEntry]) {
            organizeStockEntry[dateEntry] = {
              dateEntry: "",
              totalBuyed: 0,
            };
          }

          organizeStockEntry[dateEntry].dateEntry = dateEntry;
          organizeStockEntry[dateEntry].totalBuyed += valueFinalOrder;
        }

        const ordersByDate = [];

        for (const [, currentStockEntry] of Object.entries(
          organizeStockEntry
        )) {
          ordersByDate.push(currentStockEntry);
        }

        const filterStockEntrysStock = ordersByDate.filter((orders) =>
          formatMonth
            ? FormatDatesUtils.compareMonthDates(
                orders.dateEntry,
                formatMonth
              ) >= 0
            : orders
        );

        if (filterStockEntrysStock.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo de vendas nessa data",
          });
        } else {
          const totalStockEntry = {
            totalBuyed: 0,
          };

          for (const orderStock of filterStockEntrysStock) {
            const totalStockEntryStock = parseFloat(orderStock.totalBuyed);
            totalStockEntry.totalBuyed += totalStockEntryStock;
          }

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            totalStockEntry: totalStockEntry.totalBuyed,
            productEntry: filterStockEntrysStock,
          };
        }
      } else {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo de vendas nessa data",
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

  async getItemsByOrder(idStockEntry) {
    try {
      const itemsByStockEntry =
        await StockEntryModelInstance.getItemsByStockEntry(idStockEntry);

      for (const nameProduct of itemsByStockEntry) {
        const infoProduct = await ProductServiceInstance.getCodProduct(
          nameProduct.codProd
        );
        nameProduct.nameProduct = infoProduct.product.nameProduct;
        nameProduct.codProd = infoProduct.product.codProd;
      }

      return itemsByStockEntry;
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async createEntryStock(dataStock) {
    try {
      const infoItemStock = dataStock;

      const newItensStock = infoItemStock.itemsEntryStock;
      // ! Criar instancia na tabela orders
      const infoStockStart = {
        idStockEntry: infoItemStock.idStockEntry,
        statusStock: "pending",
        idProvider: infoItemStock.idProvider,
      };

      // ! - Inicia com o numero do pedido e os dados no banco
      const testStockEntry = await StockEntryModelInstance.startStockEntry(
        infoStockStart
      );

      console.log(testStockEntry);

      let countQtd = 0;
      let statusAddStock = {
        qtdItems: 0,
        qtdItemsAdd: 0,
      };
      for await (const items of newItensStock) {
        // ! Apaga o valor do nome, não necessario para o banco de pedido
        items.qtd = items.qtdItems;
        items.dateEntry = FormatDatesUtils.getDateNoHour();

        delete items.qtdItems;
        delete items.nameProduct;
        delete items.id;
        delete items.idProvider;
        delete items.valueDelivery;
        countQtd += items.qtd;
        statusAddStock.qtdItems++;
        // ! Adicionar items no banco "registerEntry" se der tudo certo, remover os dados dos items do objeto
        const createItensRegister =
          await RegisterEntryServiceInstance.registerEntryStockItems(items);

        const addItensStock = await StockServiceInstance.createProductStock(
          items
        );

        if (createItensRegister === true) {
          delete infoItemStock.itensStockEntry;
        }

        if (addItensStock.codeStatus === 200) {
          statusAddStock.qtdItemsAdd++;
        }
      }

      // // ! - Registra o pedido de entrada no estoque
      infoItemStock.statusStockEntry = "concluido";
      const infoStockOrder = {
        qtdItems: countQtd,
        valueFinalOrder: infoItemStock.valueFinalOrder,
        valueDelivery: infoItemStock.valueDelivery,
        valueOrder: infoItemStock.valueOrder,
        statusDelivery: infoItemStock.statusDelivery,
        dateEntry: FormatDatesUtils.getDateNoHour(),
      };

      for (const expenseStock of infoItemStock.paymentsInfo) {
        expenseStock.idStockEntry = infoStockStart.idStockEntry;
        const newDescription =
          expenseStock.description + " " + infoStockStart.idStockEntry;
        expenseStock.description = newDescription;
        expenseStock.expenseType = newDescription;
        const testExpense = await ExpenseServiceInstance.createExpense(expenseStock);

        console.log(testExpense)
      }

      const updateStockEntry = await StockEntryModelInstance.updateProductEntry(
        infoStockStart.idStockEntry,
        infoStockOrder
      );

      console.log(updateStockEntry);

      if (statusAddStock.qtdItems === statusAddStock.qtdItemsAdd) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Pedido de compra adicionado no estoque com sucesso",
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
      console.log(err);
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  // ! - Verificar pq não tem mais essa função, ate foi decidido a função de update não é viavel para alterar entrada de produtos
  async updateProductEntryStock(idStockEntry, dataProductEntry) {
    try {
      dataProductEntry.dateUpdated = FormatDatesUtils.getDateNoHour();
      const upStockEntry = await StockEntryModelInstance.updateRegisterEntry(
        idStockEntry,
        dataProductEntry
      );

      const infoStockEntry = {
        valueFinalOrder: dataProductEntry.valueFinalOrder,
      };

      await StockEntryModelInstance.updateProductEntry(
        idStockEntry,
        infoStockEntry
      );

      if (!upStockEntry) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Entrada não encontrado",
        });
      } else {
        return {
          successStatus: true,
          errorStatus: false,
          codeStatus: 200,
          message: "Valor unitario do produto alterado com sucesso",
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

  async deleteProductEntryStock(idProduct) {
    try {
      const downProductEntry = await StockEntryModelInstance.deleteProductEntry(
        idProduct
      );
      if (!downProductEntry) {
        return createHttpError({
          codeStatus: 404,
          message: "Entrada de Produto não encontrada",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Entrada do produto apagado com sucesso",
          productEntry: downProductEntry,
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
