import SubCategoryService from "./SubCategoryService.mjs";
import CategoryService from "./CategoryService.mjs";
import createHttpError from "http-errors";
import ExpenseModel from "../models/expenseModel.mjs";
import FormatDates from "../utils/FormatDates.mjs";

const CategoryServiceInstance = new CategoryService();
const ExpenseModelInstance = new ExpenseModel();
const FormatDateUtils = new FormatDates();
const SubCategoryServiceInstance = new SubCategoryService();


export default class ExpenseService {
  async getTypeExpense(TypeExpense) {
    try {
      const findIdExpense = await ExpenseModelInstance.getTypeExpense(
        TypeExpense
      );
      if (!findIdExpense) {
        return createHttpError({
          codeStatus: 404,
          message: "Não foi encontrado esse Despesa",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Despesa encontrado com sucesso",
          expense: findIdExpense,
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

  async getAllExpense() {
    try {
      const findAllExpense = await ExpenseModelInstance.getAllExpense();

      if (!findAllExpense) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não existe despesas cadastradas",
        });
      } else {
        for (const currentExpense of findAllExpense) {
          const infoCategory = await CategoryServiceInstance.getCategoryById(
            currentExpense.idCategory
          );
          currentExpense.categoryName = infoCategory.infoCategory.categoryName;

          const infoSubCategory =
            await SubCategoryServiceInstance.getSubCategoryByCategory(
              currentExpense.idCategory,
              currentExpense.idSubCategory
            );
          currentExpense.subCategoryName =
            infoSubCategory.subCategories.subCategoryName;
        }
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          expense: findAllExpense,
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

  async getExpenseByProvider(idProvider) {
    try {
      const expenseByProvider = await ExpenseModelInstance.getExpenseByProvider(
        idProvider
      );

      if (expenseByProvider.length === 0) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel buscar despesas desse fornecedor",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          infoExpense: expenseByProvider,
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
  async getExpenseByStockOrder(idStockEntry) {
    try {
      const expenseByStockEntry =
        await ExpenseModelInstance.getExpenseByStockEntry(idStockEntry);

      if (!expenseByStockEntry) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel buscar despesas desse pedido",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          infoExpense: expenseByStockEntry,
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

  async getExpensesByMonth(infoMonth) {
    try {
      const findAllExpense = await ExpenseModelInstance.getAllExpense();

      if (!findAllExpense) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Sem registro de despesas do mes atual",
        });
      } else {
        const filterMonth = infoMonth;

        const filterExpense = findAllExpense.filter((expense) =>
          filterMonth
            ? FormatDateUtils.compareMonthDates(
                FormatDateUtils.formatMonth(expense.dueDate),
                filterMonth
              ) === 0
            : expense
        );

        if (filterExpense.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message:
              "Não foi possivel encontrar o resumo de contas não pagas nessa data",
          });
        } else {
          for (const currentExpense of filterExpense) {
            const nameCategory = await CategoryServiceInstance.getCategoryById(
              currentExpense.idCategory
            );

            const nameSubCategorie =
              await SubCategoryServiceInstance.getSubCategoryByCategory(
                currentExpense.idCategory,
                currentExpense.idSubCategory
              );

            currentExpense.categoryName =
              nameCategory.infoCategory.categoryName;
            currentExpense.subCategorieName =
              nameSubCategorie.subCategories.subCategoryName;
          }

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expenseByMonth: filterExpense,
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

  async getExpensePayByDay(infoDate) {
    try {
      const findAllExpense = await ExpenseModelInstance.getAllExpense();

      if (findAllExpense === false) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Sem registro de despesas do mes atual",
          resumeExpenseDay: {
            card: 0,
            money: 0,
            pix: 0,
            qtdExpense: 0,
            totalExpenseAccount: 0,
            totalExpense: 0,
          },
        });
      } else {
        let today = infoDate;

        const resumeExpenseByDay = [];
        const resumeAllExpenseByDay = [];

        findAllExpense.filter((expense) => {
          if (
            FormatDateUtils.compareDatesAfter(expense.datePayment, today) === 0
          ) {
            resumeExpenseByDay.push(expense);
          }
        });

        findAllExpense.filter((expense) => {
          if (
            FormatDateUtils.compareDatesAfter(expense.datePayment, today) === 0
          ) {
            resumeAllExpenseByDay.push(expense);
          }
        });

        const organizeExpense = [];

        resumeExpenseByDay.forEach((expenses) => {
          const { formPayment, value } = expenses;

          if (!organizeExpense[formPayment]) {
            organizeExpense[formPayment] = {
              formPayment: "",
              qtdExpense: 0,
              totalExpense: 0,
            };
          }

          organizeExpense[formPayment].formPayment = formPayment;
          organizeExpense[formPayment].qtdExpense++;
          organizeExpense[formPayment].totalExpense += value;
        });

        let resumeExpenseByPayment = {
          card: 0,
          money: 0,
          pix: 0,
          qtdExpense: 0,
          totalExpenseAccount: 0,
          totalExpense: 0,
        };

        for (const [, currentExpense] of Object.entries(organizeExpense)) {
          if (currentExpense.formPayment === "dinheiro") {
            resumeExpenseByPayment.money += currentExpense.totalExpense;
          }
          if (currentExpense.formPayment === "debito") {
            resumeExpenseByPayment.card += currentExpense.totalExpense;
            resumeExpenseByPayment.totalExpenseAccount +=
              currentExpense.totalExpense;
          }
          if (currentExpense.formPayment === "pix") {
            resumeExpenseByPayment.pix += currentExpense.totalExpense;
            resumeExpenseByPayment.totalExpenseAccount +=
              currentExpense.totalExpense;
          }
          resumeExpenseByPayment.qtdExpense += currentExpense.qtdExpense;
          resumeExpenseByPayment.totalExpense += currentExpense.totalExpense;
        }

        if (resumeExpenseByDay.length === 0) {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 400,
            message: "Não foi possivel encontrar despesas nessa data",
            resumeExpenseDay: resumeExpenseByPayment,
          };
        } else {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            resumeExpenseDay: resumeExpenseByPayment,
            resumeExpenses: resumeAllExpenseByDay,
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

  async getExpensePayedByMonth(infoMonth) {
    try {
      const findAllExpense = await ExpenseModelInstance.getAllExpense();

      if (findAllExpense === false) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Sem registro de despesas do mes atual",
        });
      } else {
        const filterMonth = infoMonth;
        const expensePayed = [];
        findAllExpense.filter((expenses) => {
          if (expenses.status === "pago") {
            expensePayed.push(expenses);
          }
        });
        const resumeExpenses = {};

        expensePayed.forEach((expense) => {
          const { value, status } = expense;
          const dateCreated = FormatDateUtils.formatMonth(expense.dateCreated);

          if (!resumeExpenses[dateCreated]) {
            resumeExpenses[dateCreated] = {
              dateCreated: 0,
              totalExpense: 0,
              qtdExpenses: 0,
              status: "",
            };
          }

          resumeExpenses[dateCreated].dateCreated = dateCreated;
          resumeExpenses[dateCreated].totalExpense += value;
          resumeExpenses[dateCreated].status = status;
          resumeExpenses[dateCreated].qtdExpenses++;
        });

        const organizeExpensePayed = [];

        Object.entries(resumeExpenses).forEach(([, currentExpense]) => {
          organizeExpensePayed.push(currentExpense);
        });

        const filterExpensePay = organizeExpensePayed.filter((expense) =>
          filterMonth
            ? FormatDateUtils.compareMonthDates(
                expense.dateCreated,
                filterMonth
              ) === 0
            : expense
        );

        if (filterExpensePay.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message:
              "Não foi possivel encontrar o resumo de contas não pagas nessa data",
          });
        } else {
          const expensePay = {
            totalPayed: 0,
            titleExpense: "",
            totalExpenses: 0,
          };
          filterExpensePay.forEach((expense) => {
            const totalPay = parseFloat(expense.totalExpense);

            expensePay.totalPayed += totalPay;
            expensePay.titleExpense = "Despesas pagas";
            expensePay.totalExpenses += expense.qtdExpenses;
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expensesPay: expensePay,
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

  async getExpenseNoPayByMonth(infoMonth) {
    try {
      const findAllExpense = await ExpenseModelInstance.getAllExpense();

      if (!findAllExpense) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Sem registro de despesas do mes atual",
        });
      } else {
        const filterMonth = infoMonth;
        const expenseNoPay = [];
        findAllExpense.filter((expenses) => {
          if (expenses.status !== "pago") {
            expenseNoPay.push(expenses);
          }
        });

        const resumeExpenses = {};

        expenseNoPay.forEach((expense) => {
          const { value, status, dateCreated } = expense;

          if (!resumeExpenses[dateCreated]) {
            resumeExpenses[dateCreated] = {
              dateCreated: 0,
              totalExpense: 0,
              qtdExpenses: 0,
              status: "",
            };
          }

          resumeExpenses[dateCreated].dateCreated =
            FormatDateUtils.formatMonth(dateCreated);
          resumeExpenses[dateCreated].totalExpense += value;
          resumeExpenses[dateCreated].status = status;
          resumeExpenses[dateCreated].qtdExpenses++;
        });

        const organizeExpenseNoPay = [];

        for (const [, currentExpense] of Object.entries(resumeExpenses)) {
          organizeExpenseNoPay.push(currentExpense);
        }

        const filterExpenseNoPay = organizeExpenseNoPay.filter((expense) =>
          filterMonth
            ? FormatDateUtils.compareMonthDates(
                expense.dateCreated,
                filterMonth
              ) === 0
            : expense
        );

        if (filterExpenseNoPay.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message:
              "Não foi possivel encontrar o resumo de contas não pagas nessa data",
          });
        } else {
          const expenseNoPay = {
            totalNoPay: 0,
            titleExpense: "",
            totalExpenses: 0,
          };
          filterExpenseNoPay.forEach((expense) => {
            const totalPay = parseFloat(expense.totalExpense);

            expenseNoPay.totalNoPay += totalPay;
            expenseNoPay.titleExpense = "Despesas a pagar";
            expenseNoPay.totalExpenses += expense.qtdExpenses;
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expensesNoPay: expenseNoPay,
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

  async createExpense(dataExpense) {
    try {
      const newExpense = dataExpense;

      if (newExpense.status === "pago") {
        // ! - data - Formata a data de pagamento
        const formatDatePayment = FormatDateUtils.formatDateNoHour(
          newExpense.datePayment
        );

        newExpense.datePayment = formatDatePayment;
      } else {
        newExpense.datePayment = "";
      }
      if (newExpense.optionDueDate === "nao") {
        newExpense.dueDate = "";
      } else {
        // ! - data de vencimento da conta
        const formatDueDate = FormatDateUtils.formatDateNoHour(
          newExpense.dueDate
        );
        newExpense.dueDate = formatDueDate;
      }
      // ! - data de cadastro da despesa no banco
      newExpense.dateCreated = FormatDateUtils.getDateNoHour();

      const createNewExpense = await ExpenseModelInstance.createExpense(
        newExpense
      );

      console.log(createNewExpense)

      if (createNewExpense === true) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Despesa cadastrada com sucesso",
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
      console.log(err)
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async updateExpense(IdExpense, dataExpense) {
    try {
      const updateExpense = dataExpense;
      // ! - Organizar essa data
      updateExpense.dateUpdate = FormatDateUtils.getDateNoHour();
      updateExpense.dateCreated = FormatDateUtils.formatDateNoHour(
        updateExpense.dateCreated
      );
      if (updateExpense.dueDate.length > 0) {
        // ! - Organizar essa data
        updateExpense.dueDate = FormatDateUtils.formatDateNoHour(
          updateExpense.dueDate
        );
      }
      // ! - Organizar essa data
      const formatDatePayment = FormatDateUtils.formatDateNoHour(
        updateExpense.datePayment
      );
      updateExpense.datePayment = formatDatePayment;

      const upExpense = await ExpenseModelInstance.updateExpense(
        IdExpense,
        updateExpense
      );

      if (!upExpense) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Despesa não encontrada",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Despesa atualizada com sucesso",
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
  async updateExpenseByProvider(IdExpense, dataExpense) {
    try {
      const updateExpense = dataExpense;
      // ! - Organizar essa data
      updateExpense.dateUpdate = FormatDateUtils.getDateNoHour();

      const upExpense = await ExpenseModelInstance.updateExpense(
        IdExpense,
        updateExpense
      );

      if (!upExpense) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Despesa não encontrada",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Pagamento realizado com sucesso",
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
  async deleteExpense(idExpense) {
    try {
      const downExpense = await ExpenseModelInstance.deleteExpense(idExpense);

      if (!downExpense) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Despesa não encontrada",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Despesa apagada com sucesso",
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

// async getExpenseByReceiver(NameReceiver) {
//   try {
//     const findExpenseByReceiver = await ExpenseModelInstance.getExpenseByReceiver(NameReceiver)
//     if (!findExpenseByReceiver) {
//       return createHttpError(
//         404,
//         "Não encontrado expenseos para esse Recebedor"
//       );
//     } else {
//       return findExpenseByReceiver;
//     }
//   } catch (err) {
//     return createHttpError({
//   codeStatus: 500,
//   message: "Contate o administrador",
//   info: err,
// })
//   }
// }
