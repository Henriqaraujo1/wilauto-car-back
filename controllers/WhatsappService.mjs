import { Client } from "whatsapp-web.js";
import WhatsAppWeb from "whatsapp-web.js";

// Agora você pode acessar LocalAuth e MessageMedia assim
const { LocalAuth, MessageMedia } = WhatsAppWeb;

// Armazenando os clientes WhatsApp para cada clientId
const clients = {};

export default class WhatsappService {
  constructor(socket) {
    this.socket = socket;
    this.qrcode = null;
  }

  // Função para iniciar o WhatsApp Web e gerar o QR Code
  async startWhatsApp() {
    console.time('qrCodeGeneration'); // Inicia o timer para medir o tempo
    try {
      if (!this.client) {
        // Cria uma instância única do WhatsApp com LocalAuth
        this.client = new Client({
          authStrategy: new LocalAuth(), // Não precisa de clientId
        });

        // Gera o QR Code
        this.client.on("qr", (qr) => {
          // Aqui você pode processar o QR Code para exibição
          this.qrcode = qr;
          console.timeEnd('qrCodeGeneration'); // Finaliza o timer e exibe o tempo
        });

        // Quando o cliente estiver pronto para uso
        this.client.on("ready", () => {
          console.log("WhatsApp conectado");
        });

        // Inicializa a instância do cliente
        await this.client.initialize();
      }
    } catch (err) {
      console.error("Erro ao iniciar o WhatsApp:", err);
      throw new Error("Erro ao iniciar o WhatsApp");
    }
  }

  async getQrCode() {
    return this.qrcode;
  }

  // Função para enviar uma nota fiscal via WhatsApp
  async sendNote(phone, fileUrl) {
    if (!this.client) {
      throw new Error("WhatsApp não está conectado");
    }

    try {
      // Obtém o arquivo PDF da URL
      const media = await MessageMedia.fromUrl(fileUrl);

      // Envia a nota como documento
      await this.client.sendMessage(`${phone}@c.us`, media, {
        sendMediaAsDocument: true,
      });

      console.log(`Nota fiscal enviada para ${phone}@c.us`);
    } catch (err) {
      console.error("Erro ao enviar a nota:", err);
      throw new Error("Erro ao enviar a nota fiscal");
    }
  }
}
