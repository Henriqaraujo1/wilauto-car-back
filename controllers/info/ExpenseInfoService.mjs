import createHttpError from "http-errors";
import ExpenseService from "../ExpenseService.mjs";
import FormatDates from "../../utils/FormatDates.mjs";

const ExpenseServiceInstance = new ExpenseService();
const FormatDate = new FormatDates();

export default class ExpenseInfoService {
  async getExpensePayed(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const allExpenses = await ExpenseServiceInstance.getAllExpense();

      if (allExpenses.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const expensePayed = [];

        allExpenses.expense.filter((expenses) => {
          if (expenses.status === "pago") {
            expensePayed.push(expenses);
          }
        });

        const allExpensesPayed = {};

        expensePayed.forEach((expense) => {
          const { value, status } = expense;
          const datePayment = FormatDate.formatDateOfBase(expense.datePayment);

          if (!allExpensesPayed[datePayment]) {
            allExpensesPayed[datePayment] = {
              datePayment: 0,
              totalExpense: 0,
              qtdExpenses: 0,
              status: "",
            };
          }

          allExpensesPayed[datePayment].datePayment = datePayment;
          allExpensesPayed[datePayment].totalExpense += value;
          allExpensesPayed[datePayment].status = status;
          allExpensesPayed[datePayment].qtdExpenses++;
        });

        const organizeExpensePayed = [];

        for (const [, currentExpense] of Object.entries(allExpensesPayed)) {
          organizeExpensePayed.push(currentExpense);
        }

        const organizeDates = organizeExpensePayed.sort(
          (dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.datePayment,
              dateSecond.datePayment
            );
          }
        );

        const filterExpensePayed = organizeDates
          .filter((expense) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  expense.datePayment,
                  formatStartDate
                ) >= 0
              : expense
          )
          .filter((expense) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  expense.datePayment,
                  formatFinishDate
                ) <= 0
              : expense
          );
        const filterDetailExpensePayed = expensePayed
          .filter((expense) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  expense.datePayment,
                  formatStartDate
                ) >= 0
              : expense
          )
          .filter((expense) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  expense.datePayment,
                  formatFinishDate
                ) <= 0
              : expense
          );

        if (
          filterExpensePayed.length === 0 &&
          filterDetailExpensePayed.length === 0
        ) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo nessa data",
          });
        } else {
          const getHighExpense = (orders, prop) => {
            return orders.reduce(
              (max, order) => (order[prop] > max ? order[prop] : max),
              0
            );
          };

          const infoExpensePayed = {
            totalPayed: 0,
            totalExpenses: 0,
            highExpensePayed: getHighExpense(
              filterExpensePayed,
              "totalExpense"
            ),
          };

          filterExpensePayed.forEach((expense) => {
            const totalPayed = parseFloat(expense.totalExpense);

            infoExpensePayed.totalPayed += totalPayed;
            infoExpensePayed.totalExpenses += expense.qtdExpenses;
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expenses: infoExpensePayed,
            expensesByDay: filterExpensePayed,
            expenseDetail: filterDetailExpensePayed,
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
  async getExpenseNoPayed(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const allExpenses = await ExpenseServiceInstance.getAllExpense();

      if (allExpenses.codeStatus === 404) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const expenseNoPayed = [];
        allExpenses.expense.filter((expenses) => {
          if (expenses.status !== "pago") {
            expenseNoPayed.push(expenses);
          }
        });

        const resumeExpenses = {};

        expenseNoPayed.forEach((expense) => {
          const { value, status } = expense;
          const dateCreated = FormatDate.formatDateOfBase(expense.dateCreated);

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

        const organizeExpenseNoPayed = [];

        for (const [, currentExpense] of Object.entries(resumeExpenses)) {
          organizeExpenseNoPayed.push(currentExpense);
        }

        const organizeDates = organizeExpenseNoPayed.sort(
          (dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.dateCreated,
              dateSecond.dateCreated
            );
          }
        );

        const filterExpenseNoPayed = organizeDates
          .filter((expense) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatStartDate
                ) >= 0
              : expense
          )
          .filter((expense) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatFinishDate
                ) <= 0
              : expense
          );
        const filterDetailExpenseNoPayed = expenseNoPayed
          .filter((expense) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatStartDate
                ) >= 0
              : expense
          )
          .filter((expense) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatFinishDate
                ) <= 0
              : expense
          );

        if (
          filterExpenseNoPayed.length === 0 &&
          filterDetailExpenseNoPayed.length === 0
        ) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message:
              "Não foi possivel encontrar o resumo de contas não pagas nessa data",
          });
        } else {
          const getHighExpense = (orders, prop) => {
            return orders.reduce(
              (max, order) => (order[prop] > max ? order[prop] : max),
              0
            );
          };

          const infoExpenseNoPayed = {
            totalNoPayed: 0,
            totalExpenses: 0,
            highExpenseNoPayed: getHighExpense(
              filterExpenseNoPayed,
              "totalExpense"
            ),
          };

          filterExpenseNoPayed.forEach((expense) => {
            const totalNoPayed = parseFloat(expense.totalExpense);

            infoExpenseNoPayed.totalNoPayed += totalNoPayed;
            infoExpenseNoPayed.totalExpenses += expense.qtdExpenses;
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expensesNoPayed: infoExpenseNoPayed,
            expensesNoPayedByDay: filterExpenseNoPayed,
            expenseNoPayedDetails: filterDetailExpenseNoPayed,
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

  async getResumeExpense(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const allExpenses = await ExpenseServiceInstance.getAllExpense();

      if (!allExpenses) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const resumeExpenses = {};

        allExpenses.expense.forEach((expense) => {
          const { value } = expense;
          const dateCreated = FormatDate.formatDateOfBase(expense.dateCreated);

          if (!resumeExpenses[dateCreated]) {
            resumeExpenses[dateCreated] = {
              dateCreated: 0,
              totalExpense: 0,
            };
          }

          resumeExpenses[dateCreated].dateCreated = dateCreated;
          resumeExpenses[dateCreated].totalExpense += value;
        });

        const organizeExpense = [];

        for (const [, currentExpense] of Object.entries(resumeExpenses)) {
          organizeExpense.push(currentExpense);
        }

        const organizeDates = organizeExpense.sort((dateFirst, dateSecond) => {
          return FormatDate.compareDatesAfter(
            dateFirst.dateCreated,
            dateSecond.dateCreated
          );
        });

        const filterExpense = organizeDates
          .filter((expense) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatStartDate
                ) >= 0
              : expense
          )
          .filter((expense) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatFinishDate
                ) <= 0
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
          const infoExpense = {
            totalExpenses: 0,
          };
          filterExpense.forEach((expense) => {
            const valueExpense = parseFloat(expense.totalExpense);
            infoExpense.totalExpenses += valueExpense;
          });
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            resumeExpenses: infoExpense,
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

  // ! - funções para uso nos graficos

  async getExpensePayedGraph(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const allExpenses = await ExpenseServiceInstance.getAllExpense();

      if (!allExpenses) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const expensePayed = [];

        allExpenses.expense.filter((expenses) => {
          if (expenses.status === "pago") {
            expensePayed.push(expenses);
          }
        });

        const allExpensesPayed = {};

        expensePayed.forEach((expense) => {
          const { value } = expense;
          const dateCreated = FormatDate.formatDateOfBase(expense.dateCreated);

          if (!allExpensesPayed[dateCreated]) {
            allExpensesPayed[dateCreated] = {
              dateCreated: 0,
              totalExpense: 0,
            };
          }

          allExpensesPayed[dateCreated].dateCreated = dateCreated;
          allExpensesPayed[dateCreated].totalExpense += value;
          allExpensesPayed[dateCreated].qtdExpenses++;
        });

        const organizeExpensePayed = [];

        for (const [, currentExpense] of Object.entries(allExpensesPayed)) {
          organizeExpensePayed.push(currentExpense);
        }

        const organizeDates = organizeExpensePayed.sort(
          (dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.dateCreated,
              dateSecond.dateCreated
            );
          }
        );

        const filterExpensePayed = organizeDates
          .filter((expense) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatStartDate
                ) >= 0
              : expense
          )
          .filter((expense) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatFinishDate
                ) <= 0
              : expense
          );

        if (filterExpensePayed.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel encontrar o resumo nessa data",
          });
        } else {
          const resumeByMonth = {};

          filterExpensePayed.forEach((expenses) => {
            const dateFormat = FormatDate.formatMonth(expenses.dateCreated);
            const nameMonth = FormatDate.getNameMonth(dateFormat);

            if (!resumeByMonth[dateFormat]) {
              resumeByMonth[dateFormat] = {
                totalExpensePayed: 0,
                dateFormat: 0,
                nameMonth: "",
              };
            }

            resumeByMonth[dateFormat].dateFormat = dateFormat;
            resumeByMonth[dateFormat].nameMonth = nameMonth;
            resumeByMonth[dateFormat].totalExpensePayed +=
              expenses.totalExpense;
          });

          const expenseByMonth = [];

          for (const [, currentOrder] of Object.entries(resumeByMonth)) {
            expenseByMonth.push(currentOrder);
          }

          expenseByMonth.sort((firstDate, secondDate) => {
            const convertFirstDate = new Date(
              firstDate.dateFormat.split("/").reverse().join("/")
            );
            const convertSecondDate = new Date(
              secondDate.dateFormat.split("/").reverse().join("/")
            );

            return convertFirstDate - convertSecondDate;
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expensesPay: expenseByMonth,
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
  async getExpenseNoPayedGraph(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const allExpenses = await ExpenseServiceInstance.getAllExpense();

      if (!allExpenses) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const expenseNoPayed = [];
        allExpenses.expense.filter((expenses) => {
          if (expenses.status !== "pago") {
            expenseNoPayed.push(expenses);
          }
        });

        const resumeExpenses = {};

        expenseNoPayed.forEach((expense) => {
          const { value, status, dateCreated } = expense;

          if (!resumeExpenses[dateCreated]) {
            resumeExpenses[dateCreated] = {
              dateCreated: 0,
              totalExpense: 0,
            };
          }

          resumeExpenses[dateCreated].dateCreated = dateCreated;
          resumeExpenses[dateCreated].totalExpense += value;
        });

        const organizeExpenseNoPayed = [];

        for (const [, currentExpense] of Object.entries(resumeExpenses)) {
          organizeExpenseNoPayed.push(currentExpense);
        }

        const organizeDates = organizeExpenseNoPayed.sort(
          (dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.dateCreated,
              dateSecond.dateCreated
            );
          }
        );

        const filterExpenseNoPayed = organizeDates
          .filter((expense) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatStartDate
                ) >= 0
              : expense
          )
          .filter((expense) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatFinishDate
                ) <= 0
              : expense
          );

        if (filterExpenseNoPayed.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message:
              "Não foi possivel encontrar o resumo de contas não pagas nessa data",
          });
        } else {
          const resumeByMonth = {};

          filterExpenseNoPayed.forEach((expenses) => {
            const dateFormat = FormatDate.formatMonth(expenses.dateCreated);
            const nameMonth = FormatDate.getNameMonth(dateFormat);

            if (!resumeByMonth[dateFormat]) {
              resumeByMonth[dateFormat] = {
                totalExpenseNoPay: 0,
                dateFormat: 0,
              };
            }

            resumeByMonth[dateFormat].dateFormat = dateFormat;
            resumeByMonth[dateFormat].nameMonth = nameMonth;
            resumeByMonth[dateFormat].totalExpenseNoPay +=
              expenses.totalExpense;
          });

          const expenseByMonth = [];

          for (const [, currentOrder] of Object.entries(resumeByMonth)) {
            expenseByMonth.push(currentOrder);
          }

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expensesNoPay: expenseByMonth,
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

  async getResumeExpenseGraph(infoDate) {
    try {
      const infoExpensePayed = await this.getExpensePayedGraph(infoDate);
      const infoExpenseNoPayed = await this.getExpenseNoPayedGraph(infoDate);
      const expensePayedByDays = await this.getExpensePayed(infoDate);
      const expenseNoPayByDays = await this.getExpenseNoPayed(infoDate);

      if (
        infoExpensePayed.codeStatus === 404 &&
        infoExpenseNoPayed.codeStatus === 404
      ) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const infoMonth = [
          ...new Set([
            ...infoExpensePayed.expensesPay.map(
              (expensePay) => expensePay.dateFormat
            ),
            ...infoExpenseNoPayed.expensesNoPay.map(
              (expenseNoPay) => expenseNoPay.dateFormat
            ),
          ]),
        ];
        const infoDays = [
          ...new Set([
            ...expensePayedByDays.expensesByDay.map(
              (expensePay) => expensePay.dateCreated
            ),
            ...expenseNoPayByDays.expensesNoPayedByDay.map(
              (expenseNoPay) => expenseNoPay.dateCreated
            ),
          ]),
        ];

        const resumeExpense = [];
        const resumeByDays = [];

        infoMonth.forEach((month) => {
          const expensePayMonth =
            infoExpensePayed.expensesPay.find(
              (expensePay) => expensePay.dateFormat === month
            )?.totalExpensePayed || 0;
          const expenseNoPayMonth =
            infoExpenseNoPayed.expensesNoPay.find(
              (expenseNoPayed) => expenseNoPayed.dateFormat === month
            )?.totalExpenseNoPay || 0;

          resumeExpense.push({
            date: month,
            expensePayValue: Number(expensePayMonth.toFixed(2)),
            expenseNoPayValue: Number(expenseNoPayMonth.toFixed(2)),
          });
        });
        infoDays.forEach((days) => {
          const expensePayMonth =
            expensePayedByDays.expensesByDay.find(
              (expensePay) => expensePay.dateCreated === days
            )?.totalExpense || 0;
          const expenseNoPayMonth =
            expenseNoPayByDays.expensesNoPayedByDay.find(
              (expenseNoPayed) => expenseNoPayed.dateCreated === days
            )?.totalExpense || 0;

          resumeByDays.push({
            date: days,
            expensePayValue: Number(expensePayMonth.toFixed(2)),
            expenseNoPayValue: Number(expenseNoPayMonth.toFixed(2)),
          });
        });

        const resumeExpenseGraph = {};
        if (resumeExpense.length === 0) {
          resumeExpenseGraph.errorStatus = true;
          resumeExpenseGraph.successStatus = false;
          resumeExpenseGraph.codeStatus = 404;
          resumeExpenseGraph.message =
            "Não foi possivel encontrar o resumo nessa data";

          return createHttpError(resumeExpenseGraph);
        } else {
          resumeExpense.forEach((expense) => {
            const nameMonth = FormatDate.getNameMonth(expense.date);

            expense.nameMonth = nameMonth;
          });

          resumeExpense.sort((dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.date,
              dateSecond.date
            );
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expensesGraph: resumeExpense,
            resumeByDays: resumeByDays,
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

  async getExpenseGraph(infoDate) {
    try {
      let formatStartDate = "";
      let formatFinishDate = "";

      if (infoDate.dateStart.length > 0) {
        formatStartDate = FormatDate.formatDateNoHour(infoDate.dateStart);
      }
      if (infoDate.dateFinish.length > 0) {
        formatFinishDate = FormatDate.formatDateNoHour(infoDate.dateFinish);
      }
      const allExpenses = await ExpenseServiceInstance.getAllExpense();

      if (!allExpenses) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar o resumo nessa data",
        });
      } else {
        const resumeExpenses = {};
        const expensePayed = allExpenses.expense.filter((expense) => {
          return expense.status === "pago";
        });

        expensePayed.forEach((expense) => {
          const { value } = expense;
          const dateCreated = FormatDate.formatDateOfBase(expense.dateCreated);

          if (!resumeExpenses[dateCreated]) {
            resumeExpenses[dateCreated] = {
              dateCreated: 0,
              totalExpense: 0,
            };
          }

          resumeExpenses[dateCreated].dateCreated = dateCreated;
          resumeExpenses[dateCreated].totalExpense += value;
        });

        const organizeExpense = [];

        for (const [, currentExpense] of Object.entries(resumeExpenses)) {
          organizeExpense.push(currentExpense);
        }

        const organizeDates = organizeExpense.sort((dateFirst, dateSecond) => {
          return FormatDate.compareDatesAfter(
            dateFirst.dateCreated,
            dateSecond.dateCreated
          );
        });

        const filterExpense = organizeDates
          .filter((expense) =>
            formatStartDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatStartDate
                ) >= 0
              : expense
          )
          .filter((expense) =>
            formatFinishDate
              ? FormatDate.compareDatesAfter(
                  expense.dateCreated,
                  formatFinishDate
                ) <= 0
              : expense
          );

        if (filterExpense.length === 0) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            expensesGraph: {
              nameMonth: "",
              totalExpense: 0,
            },
            message:
              "Não foi possivel encontrar o resumo de contas não pagas nessa data",
          });
        } else {
          const resumeByMonth = {};

          filterExpense.forEach((expenses) => {
            const dateFormat = FormatDate.formatMonth(expenses.dateCreated);
            const nameMonth = FormatDate.getNameMonth(dateFormat);

            if (!resumeByMonth[dateFormat]) {
              resumeByMonth[dateFormat] = {
                totalExpensePayed: 0,
                dateFormat: 0,
                nameMonth: "",
              };
            }

            resumeByMonth[dateFormat].dateFormat = dateFormat;
            resumeByMonth[dateFormat].nameMonth = nameMonth;
            resumeByMonth[dateFormat].totalExpensePayed +=
              expenses.totalExpense;
          });

          const expenseByMonth = [];

          for (const [, currentOrder] of Object.entries(resumeByMonth)) {
            expenseByMonth.push(currentOrder);
          }

          expenseByMonth.sort((dateFirst, dateSecond) => {
            return FormatDate.compareDatesAfter(
              dateFirst.dateFormat,
              dateSecond.dateFormat
            );
          });

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            expensesGraph: expenseByMonth,
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
}
