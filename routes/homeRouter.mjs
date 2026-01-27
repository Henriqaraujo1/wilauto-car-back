import { Router } from "express";
import HomeService from "../controllers/HomeService.mjs";
import TokenServices from "../services/TokenServices.mjs";
import FormatDates from "../utils/FormatDates.mjs";

const FormatDateUtil = new FormatDates();
const TokensServicesInstance = new TokenServices();
const router = Router();
const HomeServiceInstance = new HomeService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/home", router);

  router.get("/", async (req, res, next) => {
    const resumeHome = {
      success: {
        allRegisters: [],
        allStock: [],
      },
      errors: {
        allRegisters: [],
        allStock: [],
      },
    };
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoMonth = req.query.infoMonth;
        const [
          ordersToday,
          ordersByPayment,
          allClients,
          allProducts,
          allProviders,
          allBrands,
          allDeliverys,
          allStockNow,
          allStockEntry,
          allStockOut,
          cashierInfo
        ] = await Promise.all([
          HomeServiceInstance.getOrdersToday(),
          HomeServiceInstance.getFinancialByPayment(infoMonth),
          HomeServiceInstance.getAllClients(),
          HomeServiceInstance.getAllProducts(),
          HomeServiceInstance.getAllProviders(),
          HomeServiceInstance.getAllBrands(),
          HomeServiceInstance.getAllDeliverys(),
          HomeServiceInstance.getStockNow(),
          HomeServiceInstance.getEntryStock(infoMonth),
          HomeServiceInstance.getOutStock(infoMonth),
          HomeServiceInstance.getCashier()
        ]);




        resumeHome.success.financialDay = ordersToday;
        resumeHome.success.totalInAccount = ordersByPayment;
        resumeHome.success.cashierInfo = cashierInfo
        resumeHome.success.allRegisters.push({
          nameRegister: "Clientes",
          countRegister: allClients.client.length || 0,
          path: "/new-cli",
        });
        resumeHome.success.allRegisters.push({
          nameRegister: "Produtos",
          countRegister: allProducts?.product?.length || 0,
          path: "/new-product",
        });
        resumeHome.success.allRegisters.push({
          nameRegister: "Fornecedores",
          countRegister: allProviders?.provider.length || 0,
          path: "/new-provider",
        });
        resumeHome.success.allRegisters.push({
          nameRegister: "Marcas",
          countRegister: allBrands?.brands.length || 0,
          path: "/new-brand",
        });
        resumeHome.success.allRegisters.push({
          nameRegister: "Bairros p/ Entregar",
          countRegister: allDeliverys?.allDeliverys?.length || 0,
          path: "/new-delivery",
        });
        resumeHome.success.allStock.push({
          nameRegister: "Estoque Atual",
          countRegister: allStockNow?.productStock.length || 0,
          path: "/stock",
        });
        resumeHome.success.allStock.push({
          nameRegister: "Entradas Estoque",
          countRegister: allStockEntry.productEntry.length || 0,
          path: "/stock/stock-item",
        });
        resumeHome.success.allStock.push({
          nameRegister: "Saidas Estoque",
          countRegister: allStockOut.productOut.length || 0,
          path: "/stock/stock-out",
        });

        res.status(200).json(resumeHome.success);
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  router.get("/info-month/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = req.query.infoMonth;
        const resumeMonth = {
          success: {},
          errors: {},
        };

        const [financialMonth, profitMonth] = await Promise.all([
          HomeServiceInstance.getFinancialMonth(infoDate),
          HomeServiceInstance.getProfitByMonth(infoDate),
        ]);

        const allStatus200 = [financialMonth, profitMonth].every(
          (result) => result.codeStatus === 200
        );


        if (allStatus200) {
          resumeMonth.success.financialMonth = financialMonth;
          resumeMonth.success.profitMonth = profitMonth;

          res.status(200).json(resumeMonth.success);
        } else {
          resumeMonth.errors = {
            codeStatus: 404,
            errorStatus: true,
            successStatus: false,
            financialMonth: financialMonth,
            profitMonth: profitMonth,
          };
          res.status(404).json(resumeMonth.errors);
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
};
