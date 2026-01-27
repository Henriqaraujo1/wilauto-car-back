import axios from "axios";
import FormatDates from "./FormatDates.mjs";

const FormatDatesService = new FormatDates();

export default class calculateDolar {
  async calcularPrecoReais(valorUSD) {
    const response = await axios.get(
      "https://economia.awesomeapi.com.br/json/last/USD-BRL"
    );

    const cotacao = parseFloat(response.data.USDBRL.ask); // preço de venda do dólar

    const valorBRL = valorUSD * cotacao;
    const dateNow = FormatDatesService.formatDateWithHour(
        response.data.USDBRL.create_date
      )
    return {
      valorUSD,
      dateCotation: dateNow,
      cotacao,
      valorBRL: parseFloat(valorBRL.toFixed(2)),
    };
  }
}
