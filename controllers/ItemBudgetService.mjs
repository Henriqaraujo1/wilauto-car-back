import ItemBudgetModel from "../models/itemBudgetModel.mjs";
import createHttpError from "http-errors";
import ProductService from "./ProductService.mjs";

const ItemBudgetModelInstance = new ItemBudgetModel();

const ProductServiceInstance = new ProductService();

export default class ItemBudgetService {
  async createItemsByBudget(dataItems) {
    try {
      const itemsBudget = dataItems;

      const addItemBudget = await ItemBudgetModelInstance.createItemByBudget(
        itemsBudget
      );

      if (addItemBudget) {
        return {
          successStatus: true,
          errorStatus: false,
          codeStatus: 200,
          message: "Item adicionado ao orçamento com sucesso",
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

  async findItemsByBudget(idBudget) {
    try {
      const itemsBudget = await ItemBudgetModelInstance.getByBudget(idBudget);

      if (itemsBudget.length > 0) {
        for (const nameProduct of itemsBudget) {
          const infoProduct = await ProductServiceInstance.getCodProduct(
            nameProduct.codProd
          );
          nameProduct.nameProduct = infoProduct.product.nameProduct;
          nameProduct.codProd = infoProduct.product.codProd;
        }

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          itemsBudgets: itemsBudget,
        };
      } else {
        return createHttpError({
          erroStatus: true,
          successStatus: false,
          codeStatus: 400,
          message: "Não foi possivel buscar os items dos pedidos",
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
  async deleteItemBudget(idItemBudget) {
    try {
      const itemsBudget = await ItemBudgetModelInstance.deleteByItemBudget(
        idItemBudget
      );

      if (itemsBudget) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Item removido do orçamento com sucesso",
        };
      } else {
        return createHttpError({
          erroStatus: true,
          successStatus: false,
          codeStatus: 400,
          message: "Não foi possivel buscar os items dos pedidos",
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
