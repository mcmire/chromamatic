import _ from "../vendor/lodash";

import { calculateRelativeLuminance } from "./colorUtils";

export default class Color {
  constructor(representation, data) {
    this.representation = representation;
    this.data = data;
    this.representation.typeCheckColorData(data);
    this.errors = {};
  }

  _runValidations() {
    throw new Error(`${this.constructor.name} must implement #_runValidations`);
  }

  validate() {
    this._runValidations();
    return this.isValid();
  }

  isValid() {
    return _.isEmpty(this.errors);
  }

  hasErrorsOn(prop) {
    return this._errorsOn(prop).length > 0;
  }

  withNormalizedData() {
    throw new Error(
      `${this.constructor.name} must implement #withNormalizedData`
    );
  }

  convertTo(otherRepresentation) {
    throw new Error(`${this.constructor.name} must implement #convertTo`);
  }

  rgb() {
    throw new Error(`${this.constructor.name} must implement #hex`);
  }

  hex() {
    throw new Error(`${this.constructor.name} must implement #hex`);
  }

  cloneWith(data) {
    throw new Error(`${this.constructor.name} must implement #cloneWith`);
  }

  get textColor() {
    return this._calculateRelativeLuminance() >= 0.5 ? "black" : "white";
  }

  _addError(prop, message) {
    this.errors[prop] = this._errorsOn(prop).concat([message]);
  }

  _errorsOn(prop) {
    if (prop in this.errors) {
      return this.errors[prop];
    } else {
      return [];
    }
  }

  _calculateRelativeLuminance() {
    return calculateRelativeLuminance(...this.rgb().values);
  }
}
