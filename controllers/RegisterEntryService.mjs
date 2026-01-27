import createHttpError from "http-errors";
import RegisterModel from "../models/registerModels.mjs";

const RegisterModelInstance = new RegisterModel();

export default class RegisterEntryService{
  async registerEntryStockItems(dataItems) {
    const itemsCart = dataItems;
    try {
      return await RegisterModelInstance.newRegisterEntry(itemsCart);
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
}
