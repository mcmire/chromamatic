import _ from "../vendor/lodash";
import {
  parseColor,
  stringifyColor,
  calculateRelativeLuminance
} from "./colorUtils";

import StrictMap from "./StrictMap";
import colorSpacesByName from "./colorSpacesByName";

export default class Color {
  constructor(colorSpace, components) {
    this.colorSpace = colorSpace;
    this.colorSpace.validateColorComponents(components);

    this.components = new StrictMap(components);
  }

  get name() {
    return this.colorSpace.nameColor(this);
  }

  get values() {
    return this.colorSpace.componentNames
      .map(name => this.get(name))
      .map(value => parseFloat(value, 10));
  }

  get textColor() {
    return this._calculateRelativeLuminance() >= 0.5 ? "black" : "white";
  }

  get(componentName) {
    return this.components.fetch(componentName);
  }

  cloneWith(updatedComponents) {
    return new this.constructor(this.colorSpace, {
      ...this.toPlainObject(),
      ...updatedComponents
    });
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

  toFormattedString({ hex = false } = {}) {
    if (hex) {
      return stringifyColor(this.convertTo("rgb").values, "hex");
    } else {
      return stringifyColor(this.values, this.colorSpace.name);
    }
  }

  toPlainObject() {
    return this.components.toPlainObject();
  }

  _calculateRelativeLuminance() {
    return calculateRelativeLuminance(...this.convertTo("rgb").values);
  }
}
