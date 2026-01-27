import createHttpError from "http-errors";
import ClientService from "./ClientService.mjs";
import ProductService from "./ProductService.mjs";
import BudgetModel from "../models/budgetModel.mjs";
import ItemBudgetService from "./ItemBudgetService.mjs";
import FormatDates from "../utils/FormatDates.mjs";
import EmployeeService from "./EmployeeService.mjs";

const ItemBudgetServiceInstance = new ItemBudgetService();
const ClientServiceInstance = new ClientService();
const FormatDatesUtils = new FormatDates();
const ProductServiceInstance = new ProductService();
const BudgetModelInstance = new BudgetModel();
const EmployeeServiceInstance = new EmployeeService();

export default class BudgetService {
  async getAllBudgets() {
    try {
      const allBudgets = await BudgetModelInstance.getAllBudgets();

      for (const infoBudget of allBudgets) {
        const infoIten = await ItemBudgetServiceInstance.findItemsByBudget(
          infoBudget.idBudget
        );

        const qtdItens = infoIten.itemsBudgets.length;
        const pesoTotal = infoIten.itemsBudgets.reduce(
          (total, item) => total + item.qtd,
          0
        );

        infoBudget.qtd = qtdItens;
        infoBudget.sizeItens = pesoTotal;
        infoBudget.itensOrder = infoIten.itemsBudgets;
      }

      if (!allBudgets) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi encontrado os orçamento",
        });
      } else {
        const organizeBudgetsByClient = await allBudgets.reduce(
          (resultBudget, currentBudget) => {
            const idBudget = currentBudget.idBudget;
            const idClient = currentBudget.idClient;
            const idEmployee = currentBudget.idEmployee;
            const dateCreated = currentBudget.dateCreated;
            const discountOption = currentBudget.discountOption;
            const formPayment = currentBudget.formPayment;
            const idDeliveryBudgets = currentBudget.idDeliveryBudgets;
            const statusBudget = currentBudget.statusBudget;
            const valueChange = currentBudget.valueChange;
            const valueClientPayed = currentBudget.valueClientPayed;
            const valueDelivery = currentBudget.valueDelivery;
            const valueDiscount = currentBudget.valueDiscount;
            const valueNoDiscount = currentBudget.valueNoDiscount;
            const valueWithDiscount = currentBudget.valueWithDiscount;
            const nameEmployee = currentBudget.nameEmployee;
            const sizeItens = currentBudget.sizeItens;
            const qtdItens = currentBudget.qtd;
            const itensOrder = currentBudget.itensOrder;
            const valueDolar = currentBudget.valueDolar;

            if (!resultBudget[idBudget]) {
              resultBudget[idBudget] = {
                totalBuyed: 0,
                idBudget: 0,
                totalBudgets: 0,
                idBudget: 0,
                idClient: 0,
                idEmployee: 0,
                dateCreated: 0,
                discountOption: 0,
                idDeliveryBudgets: 0,
                statusBudget: 0,
                totalBudget: 0,
                valueDiscount: 0,
                nameEmployee: 0,
                sizeItens: 0,
                qtdItens: 0,
                valueDolar: 0,
              };
            }
            if (valueWithDiscount < valueNoDiscount) {
              resultBudget[idBudget].totalBuyed += valueWithDiscount;
            } else {
              resultBudget[idBudget].totalBuyed += valueNoDiscount;
            }
            resultBudget[idBudget].totalBudgets++;
            resultBudget[idBudget].idBudget = idBudget;
            if (valueWithDiscount < valueNoDiscount) {
              resultBudget[idBudget].idBudget = idBudget;
              resultBudget[idBudget].idClient = idClient;
              resultBudget[idBudget].idEmployee = idEmployee;
              resultBudget[idBudget].dateCreated = dateCreated;
              resultBudget[idBudget].discountOption = discountOption;
              resultBudget[idBudget].idDeliveryBudgets = idDeliveryBudgets;
              resultBudget[idBudget].statusBudget = statusBudget;
              resultBudget[idBudget].totalBudget = valueWithDiscount;
              resultBudget[idBudget].valueDolar = valueDolar;
              resultBudget[idBudget].valueDiscount = valueDiscount;
              resultBudget[idBudget].nameEmployee = nameEmployee;
              resultBudget[idBudget].sizeItens = sizeItens;
              resultBudget[idBudget].qtdItens = qtdItens;
              resultBudget[idBudget].infoPayment = {
                discountOption: discountOption,
                formPayment: formPayment,
                valueDiscount: valueDiscount,
                valueChange: valueChange,
                valueClientPayed: valueClientPayed,
                valueDiscount: valueDiscount,
                valueDelivery: valueDelivery,
                valueNoDiscount: valueNoDiscount,
                valueWithDiscount: valueWithDiscount,
              };
              resultBudget[idBudget].itensOrder = itensOrder;
            } else {
              resultBudget[idBudget].idBudget = idBudget;
              resultBudget[idBudget].idClient = idClient;
              resultBudget[idBudget].idEmployee = idEmployee;
              resultBudget[idBudget].dateCreated = dateCreated;
              resultBudget[idBudget].idDeliveryBudgets = idDeliveryBudgets;
              resultBudget[idBudget].statusBudget = statusBudget;
              resultBudget[idBudget].totalBudget = valueWithDiscount;
              resultBudget[idBudget].valueDiscount = valueDiscount;
              resultBudget[idBudget].valueDolar = valueDolar;
              resultBudget[idBudget].nameEmployee = nameEmployee;
              resultBudget[idBudget].sizeItens = sizeItens;
              resultBudget[idBudget].qtdItens = qtdItens;
              resultBudget[idBudget].infoPayment = {
                discountOption: discountOption,
                formPayment: formPayment,
                valueDiscount: valueDiscount,
                valueChange: valueChange,
                valueClientPayed: valueClientPayed,
                valueDelivery: valueDelivery,
                valueNoDiscount: valueNoDiscount,
                valueWithDiscount: valueWithDiscount,
              };
              resultBudget[idBudget].itensOrder = itensOrder;
            }
            return resultBudget;
          },
          {}
        );
        let organizeBudget = [];

        for (const [, currentBudget] of Object.entries(
          organizeBudgetsByClient
        )) {
          currentBudget.totalBuyed = Number(
            currentBudget.totalBuyed.toFixed(2)
          );

          const findEmployee = await EmployeeServiceInstance.getEmployeeById(
            currentBudget.idEmployee
          );

          const findIdClient = await ClientServiceInstance.getClientById(
            currentBudget.idClient
          );

          currentBudget.infoClient = findIdClient.client;
          currentBudget.nameEmployee =
            findEmployee.employee.firstName +
            " " +
            findEmployee.employee.lastName;
          currentBudget.percentComission = findEmployee.employee.percentSell;

          organizeBudget.push(currentBudget);
        }

        const resumeBudget = organizeBudget.sort(
          (firstBudget, secondBudget) =>
            secondBudget.idBudget - firstBudget.idBudget
        );

        if (!allBudgets) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Não foi possivel buscar os orçamentos",
          });
        } else {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Os orçamento foram carregados com sucesso",
            budgets: resumeBudget,
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

  async getNextBudget() {
    try {
      const nextBudget = await BudgetModelInstance.getNextBudgetNumber();

      if (nextBudget === undefined) {
        return createHttpError({
          codeStatus: 404,
          messageError: "Nâo foi possivel encontrar ultimo pedido",
          budget: 1,
        });
      } else {
        return {
          codeStatus: 200,
          message: "Ultimo pedido encontrado com sucesso",
          budget: nextBudget.idBudget,
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

  async createBudget(dataBudget) {
    const infoBudget = dataBudget;

    const budgetItems = infoBudget.itensOrder;
    const lastNumber = await this.getNextBudget();

    // ! Criar instancia na tabela budgets
    const infoBudgetStart = {
      idBudget: lastNumber.budget + 1,
      statusBudget: "pendente",
    };

    // // // ! - Inicia com o numero do pedido no banco
    await BudgetModelInstance.startBudget(infoBudgetStart);

    infoBudget.dateCreated = FormatDatesUtils.getDateNoHour();
    infoBudget.idBudget = infoBudgetStart.idBudget;
    for await (const items of budgetItems) {
      // ! Apaga o valor do nome, não necessario para o banco de pedido
      delete items.idCartItem;
      // ! Consultar o id do produto e adicionar ao objeto
      const getIdProduct = await ProductServiceInstance.getCodProduct(
        items.codProd
      );
      items.idProduct = getIdProduct.product.idProduct;
      // ! - Adicionar o numero do pedido a cada item
      items.idBudget = infoBudget.idBudget;
      items.priceSell = getIdProduct.product.priceSell;

      var percentDiscount =
        ((items.priceSell - items.priceWithDiscount) / items.priceSell) * 100;
      items.percentDiscount = percentDiscount.toFixed(2);
      // ! Adicionar items no banco "itemCart" se der tudo certo, remover os dados dos items do objeto
      const createItensCart =
        await ItemBudgetServiceInstance.createItemsByBudget(items);

      // !- Retira a quantidade vendida do estoque

      if (createItensCart === true) {
        delete infoBudget.itensBudget;
      }
    }

    // ! Adicionar o endereço no banco "deliveryBudgets"
    const infoClient = infoBudget.infoClient;
    if (infoClient.nameClient === "Cliente Não identificado") {
      delete infoClient.nameClient;
      infoClient.idClient = 0;
      infoClient.idBudget = infoBudget.idBudget;
      infoClient.valueDelivery = infoBudget.valueDelivery;
      // ! - Organizar essa data
      infoClient.dateCreated = FormatDatesUtils.getDateNoHour();
      const deliveryNoClient = await BudgetModelInstance.createDeliveryBudget(
        infoClient
      );
      // ! O Endereço será colocado a opção de adiconar no checkout
      // if()
      infoBudget.idDeliveryBudgets = deliveryNoClient.idDeliveryBudget;
      infoBudget.idClient = 0;
      delete infoBudget.infoClient;
    } else {
      delete infoClient.nameClient;
      infoClient.valueDelivery = infoBudget.valueDelivery;
      infoClient.idBudget = infoBudget.idBudget;
      // ! - Organizar essa data
      infoClient.dateCreated = FormatDatesUtils.getDateNoHour();
      const createDeliveryBudget =
        await BudgetModelInstance.createDeliveryBudget(infoClient);
      infoBudget.idDeliveryBudgets = createDeliveryBudget.idDeliveryBudget;
      infoBudget.idClient = infoClient.idClient;
      delete infoBudget.infoClient;
    }
    // ! Organizar objeto de acordo com o Banco
    infoBudget.statusBudget = "em analise";
    const createNewBudget = await BudgetModelInstance.updateBudget(infoBudget);

    try {
      if (createNewBudget.codeStatus === 200) {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Orçamento realizado com sucesso",
          budget: infoBudget,
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
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  async getListAllBudgets() {
    try {
      const findAllClientBudgets = await BudgetModelInstance.getAllBudgets();

      if (findAllClientBudgets) {
        for await (const budgetsClients of findAllClientBudgets) {
          const nameClient = await ClientServiceInstance.getClientById(
            budgetsClients.idClient
          );
          budgetsClients.clientName = nameClient.client.clientName;
          budgetsClients.lastName = nameClient.client.lastName;
        }
        // Organizar os orçamento por cliente
        const allBudgetsByClient = await findAllClientBudgets.reduce(
          (resultBudget, currentBudget) => {
            const idClient = currentBudget.idClient;
            const clientName = currentBudget.clientName;
            const lastName = currentBudget.lastName;
            const valueNoDiscount = currentBudget.valueNoDiscount;
            const valueWithDiscount = currentBudget.valueWithDiscount;

            if (!resultBudget[idClient]) {
              resultBudget[idClient] = {
                idClient: 0,
                nameClient: "",
                lastName: "",
                totalBuyed: 0,
                totalBudgets: 0,
              };
            }
            if (valueWithDiscount < valueNoDiscount) {
              resultBudget[idClient].totalBuyed += valueWithDiscount;
            } else {
              resultBudget[idClient].totalBuyed += valueNoDiscount;
            }
            resultBudget[idClient].idClient = idClient;
            resultBudget[idClient].nameClient = clientName;
            resultBudget[idClient].lastName = lastName;
            resultBudget[idClient].totalBudgets++;

            return resultBudget;
          },
          {}
        );
        const organizeBudgets = [];

        for (const [, currentBudget] of Object.entries(allBudgetsByClient)) {
          currentBudget.totalBuyed = Number(
            currentBudget.totalBuyed.toFixed(2)
          );
          organizeBudgets.push(currentBudget);
        }

        if (!findAllClientBudgets) {
        } else {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Os orçamento foram carregados com sucesso",
            budgets: organizeBudgets,
          };
        }
      } else {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não existe orçamento feitos",
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
  async findBudgetByClient(idClient) {
    try {
      const BudgetClient = await BudgetModelInstance.getBudgetByClient(
        idClient
      );

      if (BudgetClient === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          message: "Não foi possivel carregar os orçamento dos clientes",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "orçamento carregados com sucesso",
          BudgetClients: BudgetClient,
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

  async findLastBudgetByClient(dataClient) {
    try {
      const idClient = dataClient;
      const lastBudget = await BudgetModelInstance.getLastBudgetByClient(
        idClient
      );
      if (lastBudget === undefined) {
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
          message: "orçamento carregados com sucesso",
          lastBudget: lastBudget,
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

  async getItemsByIdBudget(infoBudget) {
    try {
      const idBudget = infoBudget;

      return await ItemBudgetServiceInstance.findItemsByBudget(idBudget);
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getIdBudgets(idBudgets) {
    try {
      const multiBudgets = await BudgetModelInstance.getBudgetMultiIds(
        idBudgets
      );

      if (multiBudgets === undefined) {
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
          allBudgets: multiBudgets,
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
  async getInfoBudgetById(idBudget) {
    try {
      const infoBudget = await BudgetModelInstance.getBudgetById(idBudget);

      const infoClient = await ClientServiceInstance.getClientById(
        infoBudget.idClient
      );

      infoBudget.nameClient =
        infoClient.client.clientName + " " + infoClient.client.lastName;

      if (infoBudget === undefined) {
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
          budget: infoBudget,
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

  async updateBudgetItens(idBudget, dataBudget) {
    try {
      // ! - Passo 1 - Passar pela lista que foi alterada. e confirmar se houve algum item q ja existia tem status de removido
      const itensBudgets = dataBudget.newItensBudget;

      let infoItemRemove = [];

      // ! - Passo 2 - Adicionar novos itens com a relação do idBudget
      for (const itemNewList of itensBudgets) {
        if (
          itemNewList.hasOwnProperty("idBudgetItem") &&
          itemNewList.status === "removido"
        ) {
          const removeItem = await ItemBudgetServiceInstance.deleteItemBudget(
            itemNewList.idBudgetItem
          );
          if (removeItem.codeStatus === 200) {
            infoItemRemove.push({
              idBudgetItem: itemNewList.idBudgetItem,
              codeStatus: removeItem.codeStatus,
              status: removeItem.message,
            });
          }
        } else if (!itemNewList.hasOwnProperty("idBudgetItem")) {
          itemNewList.idBudget = idBudget;
          const addItem = await ItemBudgetServiceInstance.createItemsByBudget(
            itemNewList
          );
          if (addItem) {
            infoItemRemove.push({
              idBudgetItem: itemNewList.idBudgetItem,
              codeStatus: addItem.codeStatus,
              status: addItem.message,
            });
          }
        }
      }

      const allItemsSuccess = infoItemRemove.every(
        (item) => item.codeStatus === 200
      );

      if (allItemsSuccess) {
        // ! - Passo 3 - Atualizar os dados do orçamento.
        delete dataBudget.newItensBudget;
        // delete
        const upInfoBudget = await BudgetModelInstance.updateBudgetStatus(
          dataBudget
        );

        // ! - Passo 4 - Retorna a requisição para o front
        if (!upInfoBudget) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Orçamento não atualizado",
          });
        } else {
          return {
            successStatus: true,
            errorStatus: false,
            codeStatus: 200,
            message: "Orçamento atualizado com sucesso",
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

  async updateBudget(infoBudget) {
    try {
      const upBudget = await BudgetModelInstance.updateBudgetStatus(infoBudget);

      if (!upBudget) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Orçamento não encontrado",
        });
      } else {        
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Orçamento atualizado com sucesso",
        };
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

  async updateBudgetClient(infoBudget) {
    try {
      const idBudget = infoBudget.idBudget;

      const changeClient = await BudgetModelInstance.updateBudgetByClient(
        infoBudget.idClient,
        idBudget
      );

      if (!changeClient) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "O novo cliente do orçamento não foi atualizado",
        });
      } else {
        return {
          successStatus: true,
          errorStatus: false,
          codeStatus: 200,
          message: "O novo cliente do orçamento foi atualizado com sucesso",
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
