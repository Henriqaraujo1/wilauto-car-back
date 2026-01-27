import createHttpError from "http-errors";
import SubCategoryModel from "../models/subCategoryModel.mjs";
const SubCategoryModelInstance = new SubCategoryModel();

export default class SubCategoryService {
  async getSubCategoryByCategory(idCategory, idSubCategory) {
    try {
      const infoSubCategory = { idCategory, idSubCategory };

      const findSubCategory =
        await SubCategoryModelInstance.getSubCategoryByOrder(infoSubCategory);

      if (findSubCategory === false) {
        return createHttpError({
          codeStatus: 404,
          message: "Sub Categorias não encontradas desse serviço",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Sub Categoria carregada com sucesso",
          subCategories: findSubCategory,
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
  async getAllSubCategoryByCategory(dataSubCategory) {
    try {
      const idCategory = dataSubCategory;
      const findSubCategory =
        await SubCategoryModelInstance.getAllSubCategoryByIdCategory(
          idCategory
        );

      if (findSubCategory === false) {
        return createHttpError({
          codeStatus: 404,
          message: "Sub Categorias não encontradas desse serviço",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Sub Categoria carregada com sucesso",
          subCategories: findSubCategory,
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
  async getInfoSubCategory(dataSubCategory) {
    try {
      const infoSubCategory = dataSubCategory;
      const findCategory =
        await SubCategoryModelInstance.getAllSubCategoryByIdCategory(
          infoSubCategory.idCategory
        );
      if (findCategory === false) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Sub Categorias não encontrada",
        });
      } else {
        const filterSubCategory = findCategory.filter((nameSubCategory) => {
          return (
            nameSubCategory.subCategoryName === infoSubCategory.nameSubCategory
          );
        });

        if (filterSubCategory.length > 0) {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Sub Categoria encontrada",
            subCategory: filterSubCategory,
          };
        } else {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Sub Categoria não encontrada",
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
  async getAllSubCategorys() {
    try {
      const findAllSubCategory =
        await SubCategoryModelInstance.getAllSubCategory();
      if (!findAllSubCategory) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi encontrada nenhuma categoria",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Categorias carregadas com sucesso",
          allCategorys: findAllSubCategory,
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

  async newSubCategory(dataCategory) {
    try {
      const newSubCategory = dataCategory;

      const findSubCategory = await this.getInfoSubCategory(newSubCategory);

      if (findSubCategory.codeStatus === 404) {
        const createSubCategory =
          await SubCategoryModelInstance.createSubCategory(newSubCategory);
        if (createSubCategory === true) {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Sub-categoria criada com sucesso",
            newCategory: createSubCategory,
          };
        }
      } else if (findSubCategory.codeStatus === 200) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 409,
          message: "Sub-categoria já existe com esse nome",
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
  async updateSubCategory(idSubCategory, dataSubCategory) {
    try {
      if (idSubCategory === 0) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 403,
          message:
            "Não pode alterar essa categoria, pois é usada para comissões",
        });
      }
      const upSubCategory = await SubCategoryModelInstance.updateSubCategory(
        idSubCategory,
        dataSubCategory
      );
      if (!upSubCategory) {
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
  async deleteSubCategory(idSubCategory) {
    try {
      if (idSubCategory === 0) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 403,
          message:
            "Não pode apagar essa categoria, pois é usada para comissões",
        });
      }
      const downSubCategory = await SubCategoryModelInstance.deleteSubCategory(
        idSubCategory
      );
      if (downSubCategory.codeStatus === 500) {
        if (downSubCategory.info.code === "23503") {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 423,
            message:
              "Essa categoria possui sub-categorias com seu nome e não pode ser apagada",
          };
        }
      }
      if (!downSubCategory) {
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
