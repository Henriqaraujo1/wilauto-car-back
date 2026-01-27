import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import FormatDates from "../utils/FormatDates.mjs";

const DateService = new FormatDates();

// Obtém o caminho do diretório atual de forma correta
const __filename = fileURLToPath(import.meta.url); // Converte a URL para caminho de arquivo
const __dirname = path.dirname(__filename); // Obtém o diretório onde o arquivo atual está localizado

// Ajusta o caminho para a pasta "logs" que está no nível superior ao de "middlewares"
const logDirectory = path.resolve(__dirname, '..', 'logs'); // Vai um nível acima de 'middlewares' e entra em 'logs'

// Garante que o diretório de logs existe
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const errorHandler = async (err, req, res, next) => {
  try {
     // Pega apenas a parte da URL depois de "/api/"
    const match = req.originalUrl.match(/\/api\/([^\/]+)/);
    const routeName = match ? match[1] : "general"; // Se não encontrar, salva como "general"

    const logPath = path.resolve(logDirectory, `${routeName}-error.log`); // Salva o erro na pasta "logs"

    // Captura os detalhes do erro
    const errorType = err.constructor.name || "Erro desconhecido";
    const stackTrace = err.stack || "Sem stack trace disponível";
    const functionMatch = stackTrace.match(/at (\S+)/);
    const functionName = functionMatch ? functionMatch[1] : "Função não identificada";

    const logData = {
      timestamp: DateService.getDateWithHour(),
      route: req.originalUrl,
      method: req.method,
      errorType,
      functionName,
      message: err.message,
      stack: stackTrace,
      isCritical: errorType.includes("Database") || err.status >= 500, // Erros críticos
    };

    const logMessage = `${JSON.stringify(logData, null, 2)}\n`;

    // Salva o log no arquivo, tanto em produção quanto em desenvolvimento
    if (process.env.NODE_ENV === "production") {
      try {
        await fs.promises.appendFile(logPath, logMessage);  // Adiciona o log ao arquivo da rota
      } catch (writeErr) {
        console.error("Erro ao salvar log:", writeErr);
      }
    } else {
      console.error(logMessage);  // Exibe no console quando não estiver no modo de log
    }

    // Definir um status code padrão, caso o erro não tenha um
    const statusCode = err.status || 500; // Se o erro não tiver status, assume 500
    res.status(statusCode).json({
      error: "Erro interno no servidor. Por favor, tente novamente mais tarde.",
    });
  } catch (internalErr) {
    // Caso algum erro ocorra no próprio middleware de logging
    console.error("Erro no middleware de logging:", internalErr);
    res.status(500).json({
      error: "Erro crítico no servidor.",
    });
  }
};

export default errorHandler;
