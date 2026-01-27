import createHttpError from "http-errors";
import CashierModel from "../models/cashierModel.mjs";
import UserService from "./UserService.mjs";
import FormatDates from "../utils/FormatDates.mjs";
const CashierModelInstance = new CashierModel();
const FormatDatesUtil = new FormatDates();
const UserServiceInstance = new UserService();

export default class CashierServices {
  async getCashierDay(infoDate) {
    try {
      // ! - Busca a data de hoje
      const dateToday = infoDate;

      // Buscar as informações no banco
      const findCashier = await CashierModelInstance.getDayCashier();

      if (!findCashier) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          cashierInfo: {
            cashierToday: {
              message: "Caixa não foi aberto",
              status: true,
            },
            cashierYesterday: [],
            allCashiers: findCashier,
          },
          message: "Erro ao carregar o caixa",
        });
      } else {
        let cashierInfo = {
          cashierToday: {
            message: "Caixa não foi aberto hoje",
            status: true,
          },
          cashierYesterday: [],
          allCashiers: findCashier,
        };

        for (const [, currentCashier] of Object.entries(findCashier)) {
          const infoUser = await UserServiceInstance.getUserById(
            currentCashier.idUser
          );

          currentCashier.username = infoUser.username.username;

          const compareDate = FormatDatesUtil.compareDatesAfter(
            currentCashier.dateOpen,
            dateToday
          );

          if (compareDate === 0) {
            cashierInfo.cashierToday = currentCashier;
          } else if (compareDate === -1) {
            cashierInfo.cashierYesterday.push(currentCashier);
          }
        }

        //  * - Organiza do menor para maior
        cashierInfo.allCashiers.sort(
          (firstCashier, secondCashier) =>
            secondCashier.idCashier - firstCashier.idCashier
        );

        const lastCashier = cashierInfo.cashierYesterday.sort(
          (firstCashier, secondCashier) =>
            secondCashier.idCashier - firstCashier.idCashier
        );

        cashierInfo.cashierYesterday = lastCashier[0];

        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          cashierInfo,
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
  async getAllCashier() {
    try {
      const findAllCashiers = await CashierModelInstance.getAllCashier();

      if (!findAllCashiers) {
        return createHttpError(404, "Erro ao carregar o registro de caixas");
      } else {
        return findAllCashiers;
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async createCashier(dataCashier) {
    try {
      const newCashier = dataCashier;
      // ! - Organizar essa data
      newCashier.dateOpen = FormatDatesUtil.getDateNoHour();

      const openCashierToday = await CashierModelInstance.createCashier(
        newCashier
      );
      if (openCashierToday) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          openCashierToday,
        };
      } else {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          message: "Nâo foi possivel abrir o caixa",
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
  async updateCashier(idCashier, dataCashier) {
    try {
      const closeCashier = dataCashier;
      // ! - Organizar essa data
      closeCashier.dateClosed = FormatDatesUtil.getDateNoHour();

      if (closeCashier.observation.length === 0) {
        closeCashier.observation = "s/ observacao";
      }

      const upCashier = await CashierModelInstance.updateCashier(
        idCashier,
        closeCashier
      );
      if (!upCashier) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Caixa solicitado não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "O Caixa fechado com sucesso",
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
  async deleteCashier(idCashier) {
    try {
      const downCashier = await CashierModelInstance.deleteCashier(idCashier);
      if (!downCashier) {
        return createHttpError(404, "Cleinte não encontrado");
      } else {
        return downCashier;
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
