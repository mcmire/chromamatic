import _ from "../vendor/lodash";
import {
  parseColor,
  stringifyColor,
  calculateRelativeLuminance
} from "./colorUtils";
import { coerceToNumber } from "./utils";

import colorSpacesByName from "./colorSpacesByName";

export default class Color {
  constructor(colorSpace, components, { validate = true } = {}) {
    this.colorSpace = colorSpace;

    if (validate) {
      this.colorSpace.validateColorComponents(components);
    }

    this.components = components;
  }

  get name() {
    return this.colorSpace.nameColor(this);
  }

  get values() {
    return this.colorSpace.componentNames.map(name =>
      coerceToNumber(this.get(name))
    );
  }

  get textColor() {
    return this._calculateRelativeLuminance() >= 0.5 ? "black" : "white";
  }

  get(componentName) {
    return _.demand(this.components, componentName);
  }

  cloneWith(updatedComponents, { validate = true } = {}) {
    return new this.constructor(
      this.colorSpace,
      {
        ...this.toPlainObject(),
        ...updatedComponents
      },
      { validate }
    );
  }

  convertTo(otherColorSpace) {
    if (typeof otherColorSpace === "string") {
      otherColorSpace = _.demand(colorSpacesByName, otherColorSpace);
    }

    if (this.colorSpace.name === otherColorSpace.name) {
      return this;
    } else {
      return otherColorSpace.convertColor(this);
    }
  }

  toFormattedString({ hex = false, normalize = false } = {}) {
    if (hex) {
      return stringifyColor(this.convertTo("rgb").values, "hex", {
        normalize: normalize
      });
    } else {
      return stringifyColor(this.values, this.colorSpace.name, { normalize });
    }
  }

  toPlainObject() {
    return this.components;
  }

  _calculateRelativeLuminance() {
    return calculateRelativeLuminance(...this.convertTo("rgb").values);
  }
}
