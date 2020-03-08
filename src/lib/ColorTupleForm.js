import _ from "../vendor/lodash";

import { InvalidColorError } from "./errors";
import ColorForm from "./ColorForm";
import ColorRepresentation from "./ColorRepresentation";

export default class ColorTupleForm extends ColorForm {
  get(componentName) {
    return _.demand(this.data, componentName);
  }

  get representation() {
    return new ColorRepresentation("tuple");
  }

  attemptToBuildColor() {
    let color;

    try {
      return this._succeedWith(this.colorSpace.buildColor(this.data));
    } catch (error) {
      if (error instanceof InvalidColorError) {
        return this._failWith(error);
      } else {
        throw error;
      }
    }
  }

  hasErrorsOn(componentName) {
    const result = this.attemptToBuildColor();
    return !result.ok && result.value.componentName === componentName;
  }

  forceBuildNormalizedColor() {
    const normalizedComponents = this.colorSpace.components.reduce(
      (obj, component) => {
        return {
          ...obj,
          [component.name]: component.normalize(this.get(component.name))
        };
      },
      {}
    );

    return this.colorSpace.buildColor(normalizedComponents);
  }

  cloneWith(updatedComponents) {
    return new this.constructor(this.colorSpace, {
      ...this.data,
      ...updatedComponents
    });
  }

  cloneFromColor(color) {
    return this.cloneWith(color.toPlainObject());
  }

  /*
  _runValidations() {
    return this.representation.components.reduce((errors, component) => {
      const value = this.data.get(component.name);
      const parsedValue = parseFloat(value);

      if (isNaN(parsedValue)) {
        errors.push(`${component.name} is not a number`);
      } else if (value == null || value === "") {
        errors.push(`${component.name} must be set`);
      } else if (component.min != null && value < component.min) {
        errors.push(`${component.name} must be <= ${component.min}`);
      } else if (component.max != null && value > component.max) {
        errors.push(`${component.name} must be >= ${component.max}`);
      }

      return errors;
    }, []);
  }
  */
}
