import { roundNumber } from "./utils";

export default class ColorComponent {
  constructor({
    name,
    step,
    min = null,
    max = null,
    precision = null,
    suffix = null,
    cssSuffix = null
  }) {
    this.name = name;
    this.step = step;
    this.min = min;
    this.max = max;
    this.precision = precision;
    this.suffix = suffix;
    this.cssSuffix = cssSuffix;
  }

  normalize(value) {
    if (typeof value === "string") {
      value = parseFloat(value, 10);
    }

    if (isNaN(value)) {
      if (this.min != null) {
        return this.min;
      } else if (this.max != null) {
        return this.max;
      } else {
        return 0;
      }
    } else if (this.min != null && value < this.min) {
      return this.min;
    } else if (this.max != null && value > this.max) {
      return this.max;
    } else {
      return this.round(value);
    }
  }

  round(value) {
    if (this.precision != null) {
      return roundNumber(value, this.precision);
    } else {
      return value;
    }
  }
}
