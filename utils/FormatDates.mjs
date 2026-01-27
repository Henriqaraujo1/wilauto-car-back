import { format } from "date-fns-tz";
import { compareAsc, parse } from "date-fns";

export default class FormatDates {
  getDateWithHour() {
    // ! - Formatando a data para o formato 'DD-MM-YYYY e HH:mm'

    const data = new Date();

    return format(data, "dd/MM/yyyy - HH:mm:ss");
  }

  getDateNoHour() {
    // ! - Formatando a data para o formato 'DD-MM-YYYY'

    const data = new Date();
    return format(data, "dd/MM/yyyy");
  }
  getMonth() {
    // ! - Formatando a data para o formato 'DD-MM-YYYY e HH:mm'
    const data = new Date();

    return format(data, "MM/yyyy");
  }

  formatDateNoHour(dateString) {
    const organizeDate = parse(dateString, "yyyy-MM-dd", new Date(), {
      timeZone: "America/Sao_Paulo",
    });

    return format(organizeDate, "dd/MM/yyyy");
  }
  formatMonth(dateString) {
    let organizeDate;
    if (dateString.length === 10) {
      organizeDate = parse(dateString, "dd/MM/yyyy", new Date(), {
        timeZone: "America/Sao_Paulo",
      });
    } else {
      organizeDate = parse(dateString, "dd/MM/yyyy - HH:mm", new Date(), {
        timeZone: "America/Sao_Paulo",
      });
    }

    return format(organizeDate, "MM/yyyy");
  }
  formatDateWithHour(dateString) {
    const organizeDate = parse(dateString, "yyyy-MM-dd HH:mm:ss", new Date(), {
      timeZone: "America/Sao_Paulo",
    });
    
    return format(organizeDate, "dd/MM/yyyy - HH:mm");
  }
  formatDateOfBase(dateString) {
    const organizeDate = parse(dateString, "dd/MM/yyyy", new Date(), {
      timeZone: "America/Sao_Paulo",
    });

    return format(organizeDate, "dd/MM/yyyy");
  }
  formatToMonthWithHour(dateString) {
    const organizeDate = parse(dateString, "dd/MM/yyyy - HH:mm", new Date(), {
      timeZone: "America/Sao_Paulo",
    });

    return format(organizeDate, "MM/yyyy");
  }

  compareDatesAfter(dateFirst, dateSecond) {
    let dateBefore;

    if (dateFirst.length === 18) {
      dateBefore = parse(dateFirst, "dd/MM/yyyy", new Date(), {
        timeZone: "America/Sao_Paulo",
      });
    } else {
      dateBefore = parse(dateFirst, "dd/MM/yyyy", new Date(), {
        timeZone: "America/Sao_Paulo",
      });
    }

    const dateAfter = parse(dateSecond, "dd/MM/yyyy", new Date(), {
      timeZone: "America/Sao_Paulo",
    });
    return compareAsc(dateBefore, dateAfter);
  }

  compareMonthDates(firstMonth, secondMonth) {
    const formatFirstMonth = parse(firstMonth, "MM/yyyy", new Date(), {
      timeZone: "America/Sao_Paulo",
    });


    const formatSecondMonth = parse(secondMonth, "MM/yyyy", new Date(), {
      timeZone: "America/Sao_Paulo",
    });

    return compareAsc(formatFirstMonth, formatSecondMonth);
  }

  getNameMonth(infoMonth) {
    const [month, year] = infoMonth.split("/");

    const newMonth = new Date(year, month - 1, 1);

    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
    }).format(newMonth);
  }
}

// -1: Indica que a primeira data é anterior à segunda data.
// 0: Indica que as duas datas são iguais.
// 1: Indica que a primeira data é posterior à segunda data.
