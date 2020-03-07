import colorStringify from "color-stringify";

import { parseColor } from "./colorUtils";

export default class Representation {
  constructor(name) {
    this.name = name;
  }

  typeCheckColorData(data) {
    throw new Error(
      `${this.constructor.name} must implement #typeCheckColorData`
    );
  }

  black() {
    throw new Error(`${this.constructor.name} must implement #black`);
  }

  buildColor(value) {
    throw new Error(`${this.constructor.name} must implement #buildColor`);
  }

  stringifyColor(color) {
    return colorStringify(parseColor(color.toPlainObject()), this.name);
  }
}
