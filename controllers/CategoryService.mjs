import createHttpError from "http-errors";
import CategoryModel from "../models/categoryModel.mjs";
const CategoryModelInstance = new CategoryModel();

export default class CategoryService {
  async getInfoCategory(dataCategory) {
    try {
      const nameCategory = dataCategory;
      const findCategory = await CategoryModelInstance.getNameCategory(
        nameCategory
      );
      if (!findCategory) {
        return createHttpError({
          codeStatus: 404,
          message: "Categoria não encontrada",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Categoria encontrada",
          districtCategory: findCategory,
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

  async getCategoryById(idCategory) {
    try {
      const infoCategory = await CategoryModelInstance.getInfoCategory(
        idCategory
      );
      if (!infoCategory) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Categoria não encontrada",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Categoria carregada com sucesso",
          infoCategory: infoCategory,
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

  async getAllCategory() {
    try {
      const findAllCategory = await CategoryModelInstance.getAllCategory();
      if (!findAllCategory) {
        return createHttpError({
          codeStatus: 404,
          message: "Não foi encontrada nenhuma categoria",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Categorias carregadas com sucesso",
          allCategories: findAllCategory,
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
  async createCategory(dataCategory) {
    try {
      const newCategory = dataCategory;

      const findCategory = await this.getInfoCategory(newCategory);
      if (findCategory.codeStatus !== 404) {
        return createHttpError({
          codeStatus: 409,
          message: "Categoria já cadastrada",
        });
      } else {
        const createCategory = await CategoryModelInstance.createCategory(
          newCategory
        );

        if (createCategory) {
          return {
            codeStatus: 200,
            message: "Categoria criada com sucesso",
            newCategory: createCategory,
          };
        } else {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 400,
            message: "Não foi possivel criar essa categoria",
          });
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

  async updateCategory(idCategory, data) {
    try {
      const upCategory = await CategoryModelInstance.updateCategory(
        idCategory,
        data
      );
      if (!upCategory) {
        return createHttpError({
          codeStatus: 404,
          message: "Categoria não encontrada",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Categoria Atualizada com sucesso",
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
  async deleteCategory(idCategory) {
    try {
      if (idCategory === 0) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 403,
          message:
            "Não pode apagar essa categoria, pois é usada para comissões",
        });
      }
      const downCategory = await CategoryModelInstance.deleteCategory(
        idCategory
      );
      if (downCategory.codeStatus === 500) {
        if (downCategory.info.code === "23503") {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 423,
            message:
              "Essa categoria possui sub-categorias com seu nome e não pode ser apagada",
          };
        }
      }
      if (!downCategory) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Categoria não encontrada",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Categoria apagada com sucesso",
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
