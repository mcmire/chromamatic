import _ from "./lodash";
import representationRegistry from "color-space";
import colorStringify from "color-stringify";
import colorParse from "color-parse";
import StrictMap from "./StrictMap";

function roundNumber(number, precision = 0) {
  if (precision === 0) {
    return Math.round(number);
  } else {
    const multiplier = Math.pow(10, precision);
    return Math.round(number * multiplier) / multiplier;
  }
}

// https://github.com/smockle/contrast/blob/master/src/lib/eightbit.ts
function linearizeRGBComponent(n) {
  const unit = n / 255;
  return unit <= 0.03928 ? unit / 12.92 : Math.pow((unit + 0.055) / 1.055, 2.4);
}

// https://github.com/jonathantneal/postcss-wcag-contrast/blob/master/index.js
// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
function calculateRelativeLuminance(r, g, b) {
  const R = linearizeRGBComponent(r);
  const G = linearizeRGBComponent(g);
  const B = linearizeRGBComponent(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function parseColor(input) {
  const parsedColor = colorParse(input);

  if (parsedColor.space == null) {
    throw new Error(`Couldn't parse color: ${input}`);
  } else {
    return parsedColor.values;
  }
}

class Representation {
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

class ColorSpaceRepresentation extends Representation {
  constructor({ name, components }) {
    super(name);
    this.components = components.map(component => {
      return new RepresentationComponent(component);
    });
  }

  typeCheckColorData(data) {
    if (!_.isPlainObject(data)) {
      debugger;
      throw new Error("Given color should be an object");
    }

    this.components.forEach(component => {
      if (data[component.name] == null) {
        throw new Error(`Missing component: '${component.name}'`);
      }
    });
  }

  nameColor(color) {
    if (this.name === "rgb" || this.name === "hsl") {
      return this.stringifyColor(color);
    } else {
      const formattedNumbers = this.components.map(component => {
        return component.normalize(color.get(component.name));
      });
      return `${this.name}(${formattedNumbers.join(", ")})`;
    }
  }

  black() {
    return this.buildColor(_.times(this.components.length, _.constant(0)));
  }

  buildColor(values) {
    return new ColorInColorSpace(
      this,
      _.fromPairs(_.zip(this.componentNames, values))
    );
  }

  convertColor(color) {
    const sourceColorSpace = representationRegistry[color.representation.name];
    const targetColorSpace = sourceColorSpace[this.name];
    const newValues = this._clampValues(targetColorSpace(color.values));
    return this.buildColor(newValues);
  }

  get componentNames() {
    return this.components.map(component => component.name);
  }

  _clampValues(values) {
    return _.zip(values, this.components).map(([value, component]) => {
      return component.normalize(value);
    });
  }
}

class HexRepresentation extends Representation {
  constructor() {
    super("hex");
  }

  typeCheckColorData(data) {}

  black() {
    return new HexColor("#000000");
  }

  buildColor(hexString) {
    return new HexColor(hexString);
  }
}

class RepresentationComponent {
  constructor({
    name,
    step,
    min = null,
    max = null,
    precision = null,
    suffix = null
  }) {
    this.name = name;
    this.step = step;
    this.min = min;
    this.max = max;
    this.precision = precision;
    this.suffix = suffix;
  }

  normalize(value) {
    if (isNaN(value)) {
      if (this.min != null) {
        return this.min;
      } else if (this.max != null) {
        return this.max;
      } else {
        return 0;
      }
    } else if (this.min != null && value < this.min) {
      return this.min;
    } else if (this.max != null && value > this.max) {
      return this.max;
    } else {
      return this.round(value);
    }
  }

  round(value) {
    if (this.precision != null) {
      return roundNumber(value, this.precision);
    } else {
      return value;
    }
  }
}

class Color {
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

class ColorInColorSpace extends Color {
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

      if (value == null || value === "") {
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
      return otherRepresentation.convertColor(this);
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

class HexColor extends Color {
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

const colorRepresentationsByName = new StrictMap({
  rgb: new ColorSpaceRepresentation({
    name: "rgb",
    components: [
      {
        name: "r",
        step: 1,
        min: 0,
        max: 255,
        precision: 0
      },
      {
        name: "g",
        step: 1,
        min: 0,
        max: 255,
        precision: 0
      },
      {
        name: "b",
        step: 1,
        min: 0,
        max: 255,
        precision: 0
      }
    ]
  }),
  hsl: new ColorSpaceRepresentation({
    name: "hsl",
    components: [
      {
        name: "h",
        step: 1,
        min: 0,
        max: 360,
        suffix: "°",
        precision: 1
      },
      {
        name: "s",
        step: 1,
        min: 0,
        max: 100,
        suffix: "%",
        precision: 1
      },
      {
        name: "l",
        step: 1,
        min: 0,
        max: 100,
        suffix: "%",
        precision: 1
      }
    ]
  }),
  lab: new ColorSpaceRepresentation({
    name: "lab",
    components: [
      {
        name: "l",
        step: 0.1,
        min: 0,
        max: 100,
        precision: 1
      },
      { name: "a", step: 0.1, precision: 1 },
      { name: "b", step: 0.1, precision: 1 }
    ]
  }),
  hex: new HexRepresentation()
});

export default colorRepresentationsByName;
