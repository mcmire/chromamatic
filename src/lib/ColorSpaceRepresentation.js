import _ from "../vendor/lodash";
import colorSpaceRegistry from "color-space";

import Representation from "./Representation";
import RepresentationComponent from "./RepresentationComponent";
import ColorInColorSpace from "./ColorInColorSpace";

export default class ColorSpaceRepresentation extends Representation {
  constructor({ name, components }) {
    super(name);
    this.components = components.map(component => {
      return new RepresentationComponent(component);
    });
  }

  typeCheckColorData(data) {
    if (!_.isPlainObject(data)) {
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
        return (
          component.normalize(color.get(component.name)).toString() +
          (component.cssSuffix != null ? component.cssSuffix : "")
        );
      });
      return `${this.name}(${formattedNumbers.join(", ")})`;
    }
  }

  black() {
    return this.buildColor(_.times(this.components.length, _.constant(0)));
  }

  buildColor(valuesOrData) {
    const data = _.isPlainObject(valuesOrData)
      ? valuesOrData
      : _.fromPairs(_.zip(this.componentNames, valuesOrData));

    return new ColorInColorSpace(this, data);
  }

  convertColor(color) {
    const sourceColorSpace = colorSpaceRegistry[color.representation.name];
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
