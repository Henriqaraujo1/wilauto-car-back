import CartModel from "../models/cartModel.mjs";
import createHttpError from "http-errors";
import ProductService from "./ProductService.mjs";

const CartModelInstance = new CartModel();
const ProductServiceInstance = new ProductService();

export default class CartService {
  async createCartItemsByOrder(dataItems) {
    const itemsCart = dataItems;
    try {
      return await CartModelInstance.createCartItemByOrder(itemsCart);
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async findItemsCartByOrder(idOrder) {
    try {
      const itemsCart = await CartModelInstance.getCartByOrder(idOrder);

      var infoProduct = [];

      for (const nameProduct of itemsCart) {
        infoProduct = await ProductServiceInstance.getProductById(
          nameProduct.codProd
        );


        if (nameProduct.valueDiscount > 0) {
          nameProduct.valueTotalItem = nameProduct.priceWithDiscount;
          delete nameProduct.priceWithDiscount;
          delete nameProduct.priceNoDiscount;
        } else {
          nameProduct.valueTotalItem = nameProduct.priceNoDiscount;
          delete nameProduct.priceWithDiscount;
          delete nameProduct.priceNoDiscount;
        }

        nameProduct.nameProduct = infoProduct.product.nameProduct;
        nameProduct.codProd = infoProduct.product.codProd;
      }

      if (itemsCart.length > 0) {
        return itemsCart;
      } else {
        return createHttpError({
          erroStatus: true,
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
