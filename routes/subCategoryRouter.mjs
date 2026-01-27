import { Router } from "express";
import SubCategoryService from "../controllers/SubCategoryService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const SubCategoryServiceInstance = new SubCategoryService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/subcategory", router);

  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseAllSubCategory =
          await SubCategoryServiceInstance.getAllSubCategory();
        switch (responseAllSubCategory.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responseAllSubCategory.codeStatus,
              message: responseAllSubCategory.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseAllSubCategory.codeStatus,
              message: responseAllSubCategory.message,
              allSubCategories: responseAllSubCategory.allSubCategorys,
            });
            break;
          default:
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  router.get("/info-subcategory/:idCategory", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idCategory = parseInt(req.params.idCategory);
        const responseNameSubCategory =
          await SubCategoryServiceInstance.getAllSubCategoryByCategory(
            idCategory
          );

        switch (responseNameSubCategory.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responseNameSubCategory.codeStatus,
              message: responseNameSubCategory.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseNameSubCategory.codeStatus,
              message: responseNameSubCategory.message,
              subCategories: responseNameSubCategory.subCategories,
            });
            break;
          default:
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  router.get("/verify-subcategory", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoSubCategory = req.query.infoSubCategory;
        const responseNameSubCategory =
          await SubCategoryServiceInstance.getInfoSubCategory(infoSubCategory);
        if (responseNameSubCategory.codeStatus === 200) {
          res.status(200).json(responseNameSubCategory);
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  router.post("/new-subcategory", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const createSubCategory = req.body;
        const newSubCategory = await SubCategoryServiceInstance.newSubCategory(
          createSubCategory
        );

        switch (newSubCategory.codeStatus) {
          case 409:
            res.status(409).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: newSubCategory.codeStatus,
              message: newSubCategory.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: newSubCategory.codeStatus,
              message: newSubCategory.message,
            });
            break;

          default:
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  router.put("/:idSubCategory", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idSubCategory = req.body.idSubCategory;
        const dataSubCategory = req.body;

        const updateSubCategory =
          await SubCategoryServiceInstance.updateSubCategory(
            idSubCategory,
            dataSubCategory
          );
        switch (updateSubCategory.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: updateSubCategory.codeStatus,
              message: updateSubCategory.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: updateSubCategory.codeStatus,
              message: updateSubCategory.message,
            });
            break;
          default:
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.delete(
    "/delete-subcategory/:idSubCategory",
    async (req, res, next) => {
      try {
        const token = req.headers.authorization;
        const tokenToVerify = TokensServicesInstance.verifyTokens(token);

        if (tokenToVerify.codeStatus === 200) {
          const idSubCategory = parseInt(req.params.idSubCategory);
          const responseSubCategory =
            await SubCategoryServiceInstance.deleteSubCategory(idSubCategory);
          switch (responseSubCategory.codeStatus) {
            case 404:
              res.status(404).json({
                errorStatus: responseSubCategory.errorStatus,
                successStatus: responseSubCategory.successStatus,
                codeStatus: responseSubCategory.codeStatus,
                message: responseSubCategory.message,
              });
              break;
            case 200:
              res.status(200).json({
                errorStatus: responseSubCategory.errorStatus,
                successStatus: responseSubCategory.successStatus,
                codeStatus: responseSubCategory.codeStatus,
                message: responseSubCategory.message,
              });
              break;
            default:
              res.status(responseSubCategory.codeStatus).json({
                errorStatus: responseSubCategory.errorStatus,
                successStatus: responseSubCategory.successStatus,
                codeStatus: responseSubCategory.codeStatus,
                message: responseSubCategory.message,
              });
              break;
          }
        } else {
          res.status(tokenToVerify.codeStatus).json(tokenToVerify);
        }
      } catch (err) {
        next(err);
      }
    }
  );
};
