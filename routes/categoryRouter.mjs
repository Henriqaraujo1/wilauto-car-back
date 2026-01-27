import { Router } from "express";
import CategoryService from "../controllers/CategoryService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const CategoryServiceInstance = new CategoryService();
/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/category", router);

  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseAllCategory =
          await CategoryServiceInstance.getAllCategory();
        switch (responseAllCategory.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responseAllCategory.codeStatus,
              message: responseAllCategory.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseAllCategory.codeStatus,
              message: responseAllCategory.message,
              allCategories: responseAllCategory.allCategories,
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
  router.get("/info-category/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoCategory = req.query.category;
        const responseNameCategory =
          await CategoryServiceInstance.getInfoCategory(infoCategory);

        switch (responseNameCategory.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responseNameCategory.codeStatus,
              message: responseNameCategory.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseNameCategory.codeStatus,
              message: responseNameCategory.message,
              category: responseNameCategory.category,
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
  router.post("/new-category", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const createCategory = req.body;

        const newCategory = await CategoryServiceInstance.createCategory(
          createCategory
        );

        switch (newCategory.codeStatus) {
          case 409:
            res.status(409).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: newCategory.codeStatus,
              message: newCategory.message,
            });
            break;
          case 404:
            res.status(404).json(newCategory);
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: newCategory.codeStatus,
              message: newCategory.message,
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
  router.post("/new-subcategory", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const createSubCategory = req.body;
        const newSubCategory = await CategoryServiceInstance.createSubCategory(
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
  router.put("/:idCategory", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idCategory = req.body.idCategory;
        const dataCategory = req.body;
        
        const updateCategory = await CategoryServiceInstance.updateCategory(
          idCategory,
          dataCategory
        );

        switch (updateCategory.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: updateCategory.codeStatus,
              message: updateCategory.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: updateCategory.codeStatus,
              message: updateCategory.message,
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
  router.delete("/delete-category/:idCategory", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idCategory = parseInt(req.params.idCategory);
        const responseCategory = await CategoryServiceInstance.deleteCategory(
          idCategory
        );

        switch (responseCategory.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: responseCategory.errorStatus,
              successStatus: responseCategory.successStatus,
              codeStatus: responseCategory.codeStatus,
              message: responseCategory.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: responseCategory.errorStatus,
              successStatus: responseCategory.successStatus,
              codeStatus: responseCategory.codeStatus,
              message: responseCategory.message,
            });
            break;
          default:
            res.status(responseCategory.codeStatus).json({
              errorStatus: responseCategory.errorStatus,
              successStatus: responseCategory.successStatus,
              codeStatus: responseCategory.codeStatus,
              message: responseCategory.message,
            });
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
};
