export class Property {
  constructor() {}

  /**
   * Parse the input values and return a value
   * @param {Array} values - list of values
   * @param {Any} def - default value
   */
  static loadValue(values, def) {
    // return any value in values
    for (let i = 0; i < values.length; i++) {
      if (values[i] !== undefined) {
        return values[i];
      }
    };

    // no valid values, return the default value
    return def;
  }
}
