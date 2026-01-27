import createHttpError from "http-errors";
import ClientService from "./ClientService.mjs";
import ReceiveModel from "../models/receiveModel.mjs";
import FormatDates from "../utils/FormatDates.mjs";

const ReceiveModelInstance = new ReceiveModel();
const ClienteServiceInstance = new ClientService();
const FormatDateUtils = new FormatDates();

export default class ReceiveService {
  async getReceiveByOrder(idOrder) {
    try {
      const receiveByOrder = await ReceiveModelInstance.getReceiveByOrder(
        idOrder
      );

      if (!receiveByOrder) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel buscar pagamentos desse pedido",
        });
      } else {
        for (const infoClient of receiveByOrder) {
          const nameClient = await ClienteServiceInstance.getClientById(
            infoClient.idClient
          );

          infoClient.nameClient =
            nameClient.client.clientName + " " + nameClient.client.lastName;
        }
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          infoReceive: receiveByOrder,
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

  async getResumeReceiveByOrder(idOrder) {
    try {
      const receiveByOrder = await ReceiveModelInstance.getReceiveByOrder(
        idOrder
      );

      if (!receiveByOrder) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel buscar pagamentos desse pedido",
        });
      } else {
        const resumePayments = {
          totalPayed: 0,
          totalToReceive: 0,
        };

        for (const payments of receiveByOrder) {
          if (payments.status === "pago") {
            resumePayments.totalPayed += parseFloat(payments.value.toFixed(2));
          } else if (payments.status === "pendente") {
            resumePayments.totalToReceive += parseFloat(
              payments.value.toFixed(2)
            );
          }
        }
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          resumeReceive: resumePayments,
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

  async updateReceive(IdReceive, dataReceive) {
    try {
      const updateReceive = dataReceive;

      const upReceive = await ReceiveModelInstance.updateReceive(
        IdReceive,
        updateReceive
      );

      if (!upReceive) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Pagamento não encontrada",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Pagamento atualizado com sucesso",
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

  // async getTypeReceive(TypeReceive) {
  //   try {
  //     const findIdReceive = await ReceiveModelInstance.getTypeReceive(
  //       TypeReceive
  //     );
  //     if (!findIdReceive) {
  //       return createHttpError({
  //         codeStatus: 404,
  //         message: "Não foi encontrado esse Pagamento",
  //       });
  //     } else {
  //       return {
  //         codeStatus: 200,
  //         message: "Pagamento encontrado com sucesso",
  //         receive: findIdReceive,
  //       };
  //     }
  //   } catch (err) {
  //     return createHttpError({
  //       codeStatus: 500,
  //       message: "Contate o administrador",
  //       info: err,
  //     });
  //   }
  // }

  // async getAllReceive() {
  //   try {
  //     const findAllReceive = await ReceiveModelInstance.getAllReceive();

  //     if (!findAllReceive) {
  //       return createHttpError({
  //         errorStatus: true,
  //         successStatus: false,
  //         codeStatus: 404,
  //         message: "Não existe pagamentos cadastradas",
  //       });
  //     } else {
  //       for (const currentReceive of findAllReceive) {
  //         const infoCategory = await CategoryServiceInstance.getCategoryById(
  //           currentReceive.idCategory
  //         );
  //         currentReceive.categoryName = infoCategory.infoCategory.categoryName;

  //         const infoSubCategory =
  //           await SubCategoryServiceInstance.getSubCategoryByCategory(
  //             currentReceive.idCategory,
  //             currentReceive.idSubCategory
  //           );
  //         currentReceive.subCategoryName =
  //           infoSubCategory.subCategories.subCategoryName;
  //       }
  //       return {
  //         errorStatus: false,
  //         successStatus: true,
  //         codeStatus: 200,
  //         receive: findAllReceive,
  //       };
  //     }
  //   } catch (err) {
  //     return createHttpError({
  //       codeStatus: 500,
  //       message: "Contate o administrador",
  //       info: err,
  //     });
  //   }
  // }

  // async getReceiveByProvider(idProvider) {
  //   try {
  //     const receiveByProvider = await ReceiveModelInstance.getReceiveByProvider(
  //       idProvider
  //     );

  //     if (receiveByProvider.length === 0) {
  //       return createHttpError({
  //         errorStatus: true,
  //         successStatus: false,
  //         codeStatus: 404,
  //         message: "Não foi possivel buscar pagamentos desse fornecedor",
  //       });
  //     } else {
  //       return {
  //         errorStatus: false,
  //         successStatus: true,
  //         codeStatus: 200,
  //         infoReceive: receiveByProvider,
  //       };
  //     }
  //   } catch (err) {
  //     return createHttpError({
  //       codeStatus: 500,
  //       message: "Contate o administrador",
  //       info: err,
  //     });
  //   }
  // }

  // async getReceivesByMonth(infoMonth) {
  //   try {
  //     const findAllReceive = await ReceiveModelInstance.getAllReceive();

  //     if (!findAllReceive) {
  //       return createHttpError({
  //         errorStatus: true,
  //         successStatus: false,
  //         codeStatus: 404,
  //         message: "Sem registro de pagamentos do mes atual",
  //       });
  //     } else {
  //       const filterMonth = infoMonth;

  //       const filterReceive = findAllReceive.filter((receive) =>
  //         filterMonth
  //           ? FormatDateUtils.compareMonthDates(
  //               FormatDateUtils.formatMonth(receive.dueDate),
  //               filterMonth
  //             ) === 0
  //           : receive
  //       );

  //       if (filterReceive.length === 0) {
  //         return createHttpError({
  //           errorStatus: true,
  //           successStatus: false,
  //           codeStatus: 404,
  //           message:
  //             "Não foi possivel encontrar o resumo de contas não pagas nessa data",
  //         });
  //       } else {
  //         for (const currentReceive of filterReceive) {
  //           const nameCategory = await CategoryServiceInstance.getCategoryById(
  //             currentReceive.idCategory
  //           );

  //           const nameSubCategorie =
  //             await SubCategoryServiceInstance.getSubCategoryByCategory(
  //               currentReceive.idCategory,
  //               currentReceive.idSubCategory
  //             );

  //           currentReceive.categoryName =
  //             nameCategory.infoCategory.categoryName;
  //           currentReceive.subCategorieName =
  //             nameSubCategorie.subCategories.subCategoryName;
  //         }

  //         return {
  //           errorStatus: false,
  //           successStatus: true,
  //           codeStatus: 200,
  //           receiveByMonth: filterReceive,
  //         };
  //       }
  //     }
  //   } catch (err) {
  //     return createHttpError({
  //       codeStatus: 500,
  //       message: "Contate o administrador",
  //       info: err,
  //     });
  //   }
  // }

  // async getReceivePayByDay(infoDate) {
  //   try {
  //     const findAllReceive = await ReceiveModelInstance.getAllReceive();

  //     if (findAllReceive === false) {
  //       return createHttpError({
  //         errorStatus: true,
  //         successStatus: false,
  //         codeStatus: 404,
  //         message: "Sem registro de pagamentos do mes atual",
  //         resumeReceiveDay: {
  //           card: 0,
  //           money: 0,
  //           pix: 0,
  //           qtdReceive: 0,
  //           totalReceiveAccount: 0,
  //           totalReceive: 0,
  //         },
  //       });
  //     } else {
  //       let today = infoDate;

  //       const resumeReceiveByDay = [];
  //       const resumeAllReceiveByDay = [];

  //       findAllReceive.filter((receive) => {
  //         if (
  //           FormatDateUtils.compareDatesAfter(receive.datePayment, today) === 0
  //         ) {
  //           resumeReceiveByDay.push(receive);
  //         }
  //       });

  //       findAllReceive.filter((receive) => {
  //         if (
  //           FormatDateUtils.compareDatesAfter(receive.datePayment, today) === 0
  //         ) {
  //           resumeAllReceiveByDay.push(receive);
  //         }
  //       });

  //       const organizeReceive = [];

  //       resumeReceiveByDay.forEach((receives) => {
  //         const { formPayment, value } = receives;

  //         if (!organizeReceive[formPayment]) {
  //           organizeReceive[formPayment] = {
  //             formPayment: "",
  //             qtdReceive: 0,
  //             totalReceive: 0,
  //           };
  //         }

  //         organizeReceive[formPayment].formPayment = formPayment;
  //         organizeReceive[formPayment].qtdReceive++;
  //         organizeReceive[formPayment].totalReceive += value;
  //       });

  //       let resumeReceiveByPayment = {
  //         card: 0,
  //         money: 0,
  //         pix: 0,
  //         qtdReceive: 0,
  //         totalReceiveAccount: 0,
  //         totalReceive: 0,
  //       };

  //       for (const [, currentReceive] of Object.entries(organizeReceive)) {
  //         if (currentReceive.formPayment === "dinheiro") {
  //           resumeReceiveByPayment.money += currentReceive.totalReceive;
  //         }
  //         if (currentReceive.formPayment === "debito") {
  //           resumeReceiveByPayment.card += currentReceive.totalReceive;
  //           resumeReceiveByPayment.totalReceiveAccount +=
  //             currentReceive.totalReceive;
  //         }
  //         if (currentReceive.formPayment === "pix") {
  //           resumeReceiveByPayment.pix += currentReceive.totalReceive;
  //           resumeReceiveByPayment.totalReceiveAccount +=
  //             currentReceive.totalReceive;
  //         }
  //         resumeReceiveByPayment.qtdReceive += currentReceive.qtdReceive;
  //         resumeReceiveByPayment.totalReceive += currentReceive.totalReceive;
  //       }

  //       if (resumeReceiveByDay.length === 0) {
  //         return {
  //           errorStatus: true,
  //           successStatus: false,
  //           codeStatus: 400,
  //           message: "Não foi possivel encontrar pagamentos nessa data",
  //           resumeReceiveDay: resumeReceiveByPayment,
  //         };
  //       } else {
  //         return {
  //           errorStatus: false,
  //           successStatus: true,
  //           codeStatus: 200,
  //           resumeReceiveDay: resumeReceiveByPayment,
  //           resumeReceives: resumeAllReceiveByDay,
  //         };
  //       }
  //     }
  //   } catch (err) {
  //     return createHttpError({
  //       codeStatus: 500,
  //       message: "Contate o administrador",
  //       info: err,
  //     });
  //   }
  // }

  // async getReceivePayedByMonth(infoMonth) {
  //   try {
  //     const findAllReceive = await ReceiveModelInstance.getAllReceive();

  //     if (findAllReceive === false) {
  //       return createHttpError({
  //         errorStatus: true,
  //         successStatus: false,
  //         codeStatus: 404,
  //         message: "Sem registro de pagamentos do mes atual",
  //       });
  //     } else {
  //       const filterMonth = infoMonth;
  //       const receivePayed = [];
  //       findAllReceive.filter((receives) => {
  //         if (receives.status === "pago") {
  //           receivePayed.push(receives);
  //         }
  //       });
  //       const resumeReceives = {};

  //       receivePayed.forEach((receive) => {
  //         const { value, status } = receive;
  //         const dateCreated = FormatDateUtils.formatMonth(receive.dateCreated);

  //         if (!resumeReceives[dateCreated]) {
  //           resumeReceives[dateCreated] = {
  //             dateCreated: 0,
  //             totalReceive: 0,
  //             qtdReceives: 0,
  //             status: "",
  //           };
  //         }

  //         resumeReceives[dateCreated].dateCreated = dateCreated;
  //         resumeReceives[dateCreated].totalReceive += value;
  //         resumeReceives[dateCreated].status = status;
  //         resumeReceives[dateCreated].qtdReceives++;
  //       });

  //       const organizeReceivePayed = [];

  //       Object.entries(resumeReceives).forEach(([, currentReceive]) => {
  //         organizeReceivePayed.push(currentReceive);
  //       });

  //       const filterReceivePay = organizeReceivePayed.filter((receive) =>
  //         filterMonth
  //           ? FormatDateUtils.compareMonthDates(
  //               receive.dateCreated,
  //               filterMonth
  //             ) === 0
  //           : receive
  //       );

  //       if (filterReceivePay.length === 0) {
  //         return createHttpError({
  //           errorStatus: true,
  //           successStatus: false,
  //           codeStatus: 404,
  //           message:
  //             "Não foi possivel encontrar o resumo de contas não pagas nessa data",
  //         });
  //       } else {
  //         const receivePay = {
  //           totalPayed: 0,
  //           titleReceive: "",
  //           totalReceives: 0,
  //         };
  //         filterReceivePay.forEach((receive) => {
  //           const totalPay = parseFloat(receive.totalReceive);

  //           receivePay.totalPayed += totalPay;
  //           receivePay.titleReceive = "Pagamentos pagas";
  //           receivePay.totalReceives += receive.qtdReceives;
  //         });

  //         return {
  //           errorStatus: false,
  //           successStatus: true,
  //           codeStatus: 200,
  //           receivesPay: receivePay,
  //         };
  //       }
  //     }
  //   } catch (err) {
  //     return createHttpError({
  //       codeStatus: 500,
  //       message: "Contate o administrador",
  //       info: err,
  //     });
  //   }
  // }

  // async getReceiveNoPayByMonth(infoMonth) {
  //   try {
  //     const findAllReceive = await ReceiveModelInstance.getAllReceive();

  //     if (!findAllReceive) {
  //       return createHttpError({
  //         errorStatus: true,
  //         successStatus: false,
  //         codeStatus: 404,
  //         message: "Sem registro de pagamentos do mes atual",
  //       });
  //     } else {
  //       const filterMonth = infoMonth;
  //       const receiveNoPay = [];
  //       findAllReceive.filter((receives) => {
  //         if (receives.status !== "pago") {
  //           receiveNoPay.push(receives);
  //         }
  //       });

  //       const resumeReceives = {};

  //       receiveNoPay.forEach((receive) => {
  //         const { value, status, dateCreated } = receive;

  //         if (!resumeReceives[dateCreated]) {
  //           resumeReceives[dateCreated] = {
  //             dateCreated: 0,
  //             totalReceive: 0,
  //             qtdReceives: 0,
  //             status: "",
  //           };
  //         }

  //         resumeReceives[dateCreated].dateCreated =
  //           FormatDateUtils.formatMonth(dateCreated);
  //         resumeReceives[dateCreated].totalReceive += value;
  //         resumeReceives[dateCreated].status = status;
  //         resumeReceives[dateCreated].qtdReceives++;
  //       });

  //       const organizeReceiveNoPay = [];

  //       for (const [, currentReceive] of Object.entries(resumeReceives)) {
  //         organizeReceiveNoPay.push(currentReceive);
  //       }

  //       const filterReceiveNoPay = organizeReceiveNoPay.filter((receive) =>
  //         filterMonth
  //           ? FormatDateUtils.compareMonthDates(
  //               receive.dateCreated,
  //               filterMonth
  //             ) === 0
  //           : receive
  //       );

  //       if (filterReceiveNoPay.length === 0) {
  //         return createHttpError({
  //           errorStatus: true,
  //           successStatus: false,
  //           codeStatus: 404,
  //           message:
  //             "Não foi possivel encontrar o resumo de contas não pagas nessa data",
  //         });
  //       } else {
  //         const receiveNoPay = {
  //           totalNoPay: 0,
  //           titleReceive: "",
  //           totalReceives: 0,
  //         };
  //         filterReceiveNoPay.forEach((receive) => {
  //           const totalPay = parseFloat(receive.totalReceive);

  //           receiveNoPay.totalNoPay += totalPay;
  //           receiveNoPay.titleReceive = "Pagamentos a pagar";
  //           receiveNoPay.totalReceives += receive.qtdReceives;
  //         });

  //         return {
  //           errorStatus: false,
  //           successStatus: true,
  //           codeStatus: 200,
  //           receivesNoPay: receiveNoPay,
  //         };
  //       }
  //     }
  //   } catch (err) {
  //     return createHttpError({
  //       codeStatus: 500,
  //       message: "Contate o administrador",
  //       info: err,
  //     });
  //   }
  // }

  // async createReceive(dataReceive) {
  //   try {
  //     const newReceive = dataReceive;

  //     if (newReceive.status === "pago") {
  //       // ! - data - Formata a data de pagamento
  //       const formatDatePayment = FormatDateUtils.formatDateNoHour(
  //         newReceive.datePayment
  //       );

  //       newReceive.datePayment = formatDatePayment;
  //     } else {
  //       newReceive.datePayment = "";
  //     }
  //     if (newReceive.optionDueDate === "nao") {
  //       newReceive.dueDate = "";
  //     } else {
  //       // ! - data de vencimento da conta
  //       const formatDueDate = FormatDateUtils.formatDateNoHour(
  //         newReceive.dueDate
  //       );
  //       newReceive.dueDate = formatDueDate;
  //     }
  //     // ! - data de cadastro da despesa no banco
  //     newReceive.dateCreated = FormatDateUtils.getDateNoHour();

  //     const createNewReceive = await ReceiveModelInstance.createReceive(
  //       newReceive
  //     );

  //     if (createNewReceive === true) {
  //       return {
  //         errorStatus: false,
  //         successStatus: true,
  //         codeStatus: 200,
  //         message: "Pagamento cadastrada com sucesso",
  //       };
  //     } else {
  //       return createHttpError({
  //         errorStatus: true,
  //         successStatus: false,
  //         codeStatus: 400,
  //         message:
  //           "Não foi possivel adicionar essa despesa, verifique as informações",
  //       });
  //     }
  //   } catch (err) {
  //     return createHttpError({
  //       codeStatus: 500,
  //       message: "Contate o administrador",
  //       info: err,
  //     });
  //   }
  // }

  // async updateReceiveByProvider(IdReceive, dataReceive) {
  //   try {
  //     const updateReceive = dataReceive;
  //     // ! - Organizar essa data
  //     updateReceive.dateUpdate = FormatDateUtils.getDateNoHour();

  //     const upReceive = await ReceiveModelInstance.updateReceive(
  //       IdReceive,
  //       updateReceive
  //     );

  //     if (!upReceive) {
  //       return createHttpError({
  //         errorStatus: true,
  //         successStatus: false,
  //         codeStatus: 404,
  //         message: "Pagamento não encontrada",
  //       });
  //     } else {
  //       return {
  //         errorStatus: false,
  //         successStatus: true,
  //         codeStatus: 200,
  //         message: "Pagamento realizado com sucesso",
  //       };
  //     }
  //   } catch (err) {
  //     return createHttpError({
  //       codeStatus: 500,
  //       message: "Contate o administrador",
  //       info: err,
  //     });
  //   }
  // }
  // async deleteReceive(idReceive) {
  //   try {
  //     const downReceive = await ReceiveModelInstance.deleteReceive(idReceive);

  //     if (!downReceive) {
  //       return createHttpError({
  //         errorStatus: true,
  //         successStatus: false,
  //         codeStatus: 404,
  //         message: "Pagamento não encontrada",
  //       });
  //     } else {
  //       return {
  //         errorStatus: false,
  //         successStatus: true,
  //         codeStatus: 200,
  //         message: "Pagamento apagada com sucesso",
  //       };
  //     }
  //   } catch (err) {
  //     return createHttpError({
  //       codeStatus: 500,
  //       message: "Contate o administrador",
  //       info: err,
  //     });
  //   }
  // }
}

// async getReceiveByReceiver(NameReceiver) {
//   try {
//     const findReceiveByReceiver = await ReceiveModelInstance.getReceiveByReceiver(NameReceiver)
//     if (!findReceiveByReceiver) {
//       return createHttpError(
//         404,
//         "Não encontrado receiveos para esse Recebedor"
//       );
//     } else {
//       return findReceiveByReceiver;
//     }
//   } catch (err) {
//     return createHttpError({
//   codeStatus: 500,
//   message: "Contate o administrador",
//   info: err,
// })
//   }
// }
