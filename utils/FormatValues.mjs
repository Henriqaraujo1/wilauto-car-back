export default class FormatValues {
  lowerCaseFormat(obj) {
    const newObj = Object.entries(obj);

    return Object.fromEntries(
      newObj.map(([key, value]) => {
        return [key, value.toLowerCase()];
      })
    );
  }

  formatToUpper(obj) {
    if (!obj) return obj;

    return obj.charAt(0).toUpperCase() + obj.slice(1);
  }
}
