import colorStringify from "color-stringify";

import Color from "./Color";
import colorRepresentationsByName from "./colorRepresentationsByName";
import { parseColor } from "./colorUtils";

export default class HexColor extends Color {
  constructor(data) {
    super(colorRepresentationsByName.fetch("hex"), data);
  }

  get name() {
    return this.data;
  }

  get string() {
    return this.data;
  }

  _runValidations() {
    if (!/^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(this.data)) {
      this._addError("data", "is not a valid hex color");
    }
  }

  withNormalizedData() {
    const normalizedData = colorStringify(parseColor(this.data), "hex");
    if (/^#[A-Fa-f0-9]{3}$/.test(normalizedData)) {
      const digits = normalizedData.slice(1);
      return this.cloneWith(
        "#" +
          digits[0] +
          digits[0] +
          digits[1] +
          digits[1] +
          digits[2] +
          digits[2]
      );
    } else {
      return this.cloneWith(normalizedData);
    }
  }

  cloneWith(data) {
    return new this.constructor(data);
  }

  convertTo(otherRepresentation) {
    return this.rgb().convertTo(otherRepresentation);
  }

  rgb() {
    return colorRepresentationsByName
      .fetch("rgb")
      .buildColor(parseColor(this.data));
  }

  hex() {
    return this;
  }
}
