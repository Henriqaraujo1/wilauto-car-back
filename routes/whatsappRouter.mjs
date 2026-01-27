import { Router } from "express";
import TokenServices from "../services/TokenServices.mjs";
import WhatsappService from "../controllers/WhatsappService.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();
const WppServiceInstance = new WhatsappService();

export default (app) => {
  app.use("/api/whatsapp", router);

  router.post("/config-whatsapp", async (req, res) => {
    const { clientId } = req.body;
    try {
      await WppServiceInstance.startWhatsApp(clientId);
      const qrCode = await WppServiceInstance.getQrCode();

      console.log(qrCode)
      

      res.json({
        errorStatus: false,
        successStatus: true,
        codeStatus: 200,
        message: `WhatsApp iniciado`,
        qrCode,
      });
    } catch (err) {
      res.status(500).json({
        errorStatus: true,
        successStatus: false,
        codeStatus: responsePosition.codeStatus,
        message: responsePosition.message,
        message: "Erro ao configurar WhatsApp",
        err,
      });
    }
  });

  router.post("/send-note", async (req, res) => {
    const { phone, fileUrl } = req.body;
    try {
      await WppServiceInstance.sendNote(phone, fileUrl);
      res.json({ message: "Nota fiscal enviada com sucesso!" });
    } catch (err) {
      res.status(500).json({ message: "Erro ao enviar nota fiscal", err });
    }
  });
};
