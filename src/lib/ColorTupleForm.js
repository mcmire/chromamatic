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

  attemptToBuildColor({ normalize = false } = {}) {
    let color;

    try {
      return this._succeedWith(
        this.colorSpace.buildColor(this.data, { normalize })
      );
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

  cloneWith(updatedComponents) {
    return new this.constructor(this.colorSpace, {
      ...this.data,
      ...updatedComponents
    });
  }

  cloneFromColor(color) {
    return this.cloneWith(color.toPlainObject());
  }
}
