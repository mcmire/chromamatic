import Color from "./Color";
import StrictMap from "./StrictMap";
import colorRepresentationsByName from "./colorRepresentationsByName";

export default class ColorInColorSpace extends Color {
  constructor(representation, data) {
    super(representation, data);
    this.data = new StrictMap(data);
  }

  get name() {
    return this.representation.nameColor(this);
  }

  get values() {
    const obj = this.toPlainObject();
    return this.representation.componentNames.map(name => obj[name]);
  }

  _runValidations() {
    this.errors = {};

    this.representation.components.forEach(component => {
      const value = this.data.get(component.name);
      const parsedValue = parseFloat(value);

      if (isNaN(parsedValue)) {
        this._addError(component.name, "is not a number");
      } else if (value == null || value === "") {
        this._addError(component.name, "must be set");
      } else if (component.min != null && value < component.min) {
        this._addError(component.name, `must be <= ${component.min}`);
      } else if (component.max != null && value > component.max) {
        this._addError(component.name, `must be >= ${component.max}`);
      }
    });
  }

  withNormalizedData() {
    const newData = this.representation.components.reduce((obj, component) => {
      return {
        ...obj,
        [component.name]: component.normalize(this.data.get(component.name))
      };
    }, {});

    return new this.constructor(this.representation, newData);
  }

  cloneWith(data) {
    return new this.constructor(this.representation, {
      ...this.toPlainObject(),
      ...data
    });
  }

  convertTo(otherRepresentation) {
    if (otherRepresentation.name === "hex") {
      return this.hex();
    } else {
      return otherRepresentation.convertColor(this.withNormalizedData());
    }
  }

  rgb() {
    if (this.representation.name === "rgb") {
      return this;
    } else {
      return this.convertTo(colorRepresentationsByName.fetch("rgb"));
    }
  }

  hex() {
    const hex = colorRepresentationsByName.fetch("hex");
    return hex.buildColor(hex.stringifyColor(this.rgb()));
  }

  get(key) {
    return this.data.fetch(key);
  }

  toPlainObject() {
    return this.data.toPlainObject();
  }
}
