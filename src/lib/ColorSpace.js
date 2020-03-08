import _ from "../vendor/lodash";
import colorSpaceRegistry from "color-space";

import { InvalidColorError } from "./errors";
import ColorComponent from "./ColorComponent";
import ColorRepresentation from "./ColorRepresentation";
import Color from "./Color";

export default class ColorSpace {
  constructor({ name, components, representations }) {
    this.name = name;
    this.components = components.map(component => {
      return new ColorComponent(component);
    });
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

  validateColorComponents(givenComponents) {
    if (!_.isPlainObject(givenComponents)) {
      throw new Error("Given color components should be an object");
    }

    this.components.forEach(component => {
      const value = givenComponents[component.name];

      if (value == null || value === "") {
        const error = new InvalidColorError(`${component.name} must be set`);
        error.componentName = component.name;
        return error;
      }
      const parsedValue = parseFloat(value);

      if (isNaN(parsedValue)) {
        const error = new InvalidColorError(
          `${component.name} is not a number`
        );
        error.componentName = component.name;
        return error;
      }
      /*
      if (component.min != null && value < component.min) {
        throw new InvalidColorError(
          `${component.name} must be <= ${component.min}`
        );
      } else if (component.max != null && value > component.max) {
        throw new InvalidColorError(
          `${component.name} must be >= ${component.max}`
        );
      }
      */
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
    return this.buildColor(_.times(this.components.length, _.constant(0)));
  }

  buildColor(valuesOrData) {
    const data = _.isPlainObject(valuesOrData)
      ? valuesOrData
      : _.fromPairs(_.zip(this.componentNames, valuesOrData));

    return new Color(this, data);
  }

  convertColor(color) {
    const sourceColorSpace = colorSpaceRegistry[color.colorSpace.name];
    const targetColorSpace = sourceColorSpace[this.name];
    const newValues = this._clampValues(targetColorSpace(color.values));
    return this.buildColor(newValues);
  }

  get componentNames() {
    return this.components.map(component => component.name);
  }

  /*
  stringifyColor(color) {
    return colorStringify(parseColor(color.toPlainObject()), this.name);
  }
  */

  _clampValues(values) {
    return _.zip(values, this.components).map(([value, component]) => {
      return component.normalize(value);
    });
  }
}
