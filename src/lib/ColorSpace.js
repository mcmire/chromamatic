import _ from "../vendor/lodash";
import colorSpaceRegistry from "color-space";

import { InvalidColorError } from "./errors";
import { coerceToNumber, isPlainObject, toObject, zip } from "./utils";
import ColorComponent from "./ColorComponent";
import ColorRepresentation from "./ColorRepresentation";
import Color from "./Color";
import benchmark from "./benchmark";

export default class ColorSpace {
  constructor({ name, components, representations }) {
    this.name = name;
    this.components = components.map(component => {
      return new ColorComponent(component);
    });
    this.componentsByName = _.keyBy(this.components, "name");
    this.representationNames = representations;
    this.representationsByName = this.representationNames.reduce(
      (obj, representationName) => {
        return {
          ...obj,
          [representationName]: new ColorRepresentation(representationName)
        };
      },
      {}
    );
  }

  get componentNames() {
    return this.components.map(component => component.name);
  }

  validateColorComponents(givenComponents) {
    this.components.forEach(component => {
      const value = givenComponents[component.name];

      if (value == null || value === "") {
        const error = new InvalidColorError(`${component.name} must be set`);
        error.componentName = component.name;
        return error;
      }
      const parsedValue = coerceToNumber(value);

      if (isNaN(parsedValue)) {
        const error = new InvalidColorError(
          `${component.name} is not a number`
        );
        error.componentName = component.name;
        return error;
      }
    });
  }

  nameColor(color) {
    if (this.name === "hsluv") {
      const formattedNumbers = this.components.map(component => {
        return (
          component.normalize(color.get(component.name)).toString() +
          (component.cssSuffix != null ? component.cssSuffix : "")
        );
      });
      return `${this.name}(${formattedNumbers.join(", ")})`;
    } else {
      return this.stringifyColor(color);
    }
  }

  black() {
    const minValues = this.components.map(component => component.min);
    return this.buildColor(minValues);
  }

  white() {
    const maxValues = this.components.map(component => component.max);
    return this.buildColor(maxValues);
  }

  buildColor(valuesOrData, { normalize = false } = {}) {
    const data = isPlainObject(valuesOrData)
      ? valuesOrData
      : toObject(zip(this.componentNames, valuesOrData));
    const normalizedData = normalize ? this._normalizeData(data) : data;

    return new Color(this, normalizedData);
  }

  convertColor(color) {
    const newNormalizedColor = benchmark.time("convertColor", () => {
      const sourceColorSpace = colorSpaceRegistry[color.colorSpace.name];
      const targetColorSpace = sourceColorSpace[this.name];
      const newColor = targetColorSpace(color.values);
      const newValues = this._normalizeValues(newColor);
      return this.buildColor(newValues);
    });

    return newNormalizedColor;
  }

  _normalizeData(data) {
    return _.reduce(
      data,
      (obj, value, name) => {
        const component = _.demand(this.componentsByName, name);
        return {
          ...obj,
          [name]: component.normalize(value)
        };
      },
      {}
    );
  }

  _normalizeValues(values) {
    return zip(values, this.components).map(([value, component]) => {
      return component.normalize(value);
    });
  }
}
