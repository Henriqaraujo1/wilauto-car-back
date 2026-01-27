import createHttpError from "http-errors";
import WorkPositionModel from "../models/workPositionModel.mjs";

const PositionModelInstance = new WorkPositionModel();

export default class PositionService {
  async getAllPositions() {
    try {
      const findAllPosition = await PositionModelInstance.getAllPosition();
      if (!findAllPosition) {
        return createHttpError({
          codeStatus: 404,
          message: "Não foi encontrada nenhuma profissão",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Profissões carregadas com sucesso",
          allPosition: findAllPosition,
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
  async getIdPosition(idPosition) {
    try {
      const infoPosition = await PositionModelInstance.getPositionById(
        idPosition
      );
      if (!infoPosition) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Profissão não encontrada",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Profissão carregada com sucesso",
          infoPosition: infoPosition,
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
  async getNamePosition(dataPosition) {
    try {
      const namePosition = dataPosition;
      const findPosition = await PositionModelInstance.getPositionByName(
        namePosition
      );
      if (!findPosition) {
        return createHttpError({
          codeStatus: 404,
          message: "Profissão não encontrada",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Profissão encontrada",
          districtPosition: findPosition,
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
  async createPosition(dataPosition) {
    try {
      const newPosition = dataPosition;

      const findPosition = await this.getNamePosition(newPosition);
      if (findPosition.codeStatus !== 404) {
        return createHttpError({
          codeStatus: 409,
          message: "Profissão já cadastrada",
        });
      } else {
        const createPosition = await PositionModelInstance.createPosition(
          newPosition
        );

        if (createPosition) {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 200,
            message: "Profissão criada com sucesso",
            newPosition: createPosition,
          };
        } else {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 400,
            message: "Não foi possivel criar essa profissão",
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
  
  async updatePosition(idPosition, data) {
    try {
      const upPosition = await PositionModelInstance.updatePosition(
        idPosition,
        data
      );
      if (!upPosition) {
        return createHttpError({
          codeStatus: 404,
          message: "Profissão não encontrada",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Profissão Atualizada com sucesso",
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
  async deletePosition(idPosition) {
    try {
      const downPosition = await PositionModelInstance.deletePosition(
        idPosition
      );
      if (downPosition.codeStatus === 500) {
        if (downPosition.info.code === "23503") {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 423,
            message:
              "Essa profissão possui sub-profissãos com seu nome e não pode ser apagada",
          };
        }
      }
      if (!downPosition) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Profissão não encontrada",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Profissão apagada com sucesso",
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
