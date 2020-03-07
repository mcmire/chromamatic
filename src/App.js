import React, { useState } from "react";
import _ from "lodash";
import Color from "color";

import styles from "./App.module.css";

_.mixin({
  fetch: function(object, key) {
    if (key in object) {
      return object[key];
    } else {
      throw new Error(`No such key in object: ${key}`);
    }
  }
});

const colorSpaceNames = ["rgb", "hsl", "lab", "hex"];
const colorSpacesByName = {
  rgb: {
    name: "rgb",
    components: [
      { name: "r", step: 1, min: 0, max: 255, round: 0 },
      { name: "g", step: 1, min: 0, max: 255, round: 0 },
      { name: "b", step: 1, min: 0, max: 255, round: 0 }
    ]
  },
  hsl: {
    name: "hsl",
    components: [
      { name: "h", step: 1, min: 0, max: 360, suffix: "°", round: 0 },
      { name: "s", step: 1, min: 0, max: 100, suffix: "%", round: 0 },
      { name: "l", step: 1, min: 0, max: 100, suffix: "%", round: 0 }
    ]
  },
  lab: {
    name: "lab",
    components: [
      { name: "l", step: 0.1, min: 0, max: 100, round: 1 },
      { name: "a", step: 0.1, round: 1 },
      { name: "b", step: 0.1, round: 1 }
    ]
  },
  hex: {
    name: "hex",
    components: []
  }
};

function roundNumber(number, precision = 0) {
  if (precision === 0) {
    return Math.round(number);
  } else {
    const multiplier = Math.pow(10, precision);
    return Math.round(number * multiplier) / multiplier;
  }
}

function buildFormalColor(color) {
  return Color(color);
}

function Swatch({ colorsByColorSpaceName }) {
  const wrappedColorsByColorSpaceName = _.reduce(
    colorsByColorSpaceName,
    (obj, color, colorSpaceName) => {
      const colorSpace = _.fetch(colorSpacesByName, colorSpaceName);
      const wrappedColor = new WrappedColor(colorSpace, color);
      return { ...obj, [colorSpaceName]: wrappedColor };
    },
    {}
  );

  const content = colorSpaceNames.map(colorSpaceName => {
    const wrappedColor = _.fetch(wrappedColorsByColorSpaceName, colorSpaceName);
    return (
      <div key={colorSpaceName} style={{ color: wrappedColor.textColor }}>
        {wrappedColor.name}
      </div>
    );
  });

  const defaultWrappedColor = _.fetch(wrappedColorsByColorSpaceName, "rgb");

  return (
    <div
      className={styles.swatch}
      style={{ backgroundColor: defaultWrappedColor.code }}
    >
      <div className={styles.swatchContent}>{content}</div>
    </div>
  );
}

class WrappedColor {
  constructor(colorSpace, color) {
    this.colorSpace = colorSpace;
    this.color = color;

    try {
      this.formalColor = buildFormalColor(color);
      this.code = this.formalColor.hex();
      this.hex = this.code;
      this.textColor = this.formalColor.luminosity() >= 0.5 ? "black" : "white";
    } catch (e) {
      if (/Unable to parse color/.test(e.message)) {
        console.warn(`Unable to parse color ${color}`);
        // don't worry about it
        this.code = this.color;
        this.hex = this.color;
        this.textColor = "red";
      } else {
        throw e;
      }
    }
  }

  get name() {
    if (this.formalColor) {
      if (this.colorSpace.name === "rgb" || this.colorSpace.name === "hsl") {
        return this.formalColor.string(3);
      } else if (this.colorSpace.name === "hex") {
        return this.hex;
      } else {
        const values = this.colorSpace.components.map(component => {
          const number = this.formalColor[component.name]();
          return roundNumber(number, component.round);
        });
        return `${this.colorSpace.name}(${values.join(",")})`;
      }
    } else if (typeof this.color === "string") {
      return this.color;
    } else {
      return "(invalid color)";
    }
  }
}

function TripletTextField({ colorSpace, color, component, onColorUpdated }) {
  function onChange(event) {
    const input = event.target;
    onColorUpdated(colorSpace, component, input.value);
  }

  const number = _.fetch(color, component.name);
  const value = isNaN(number)
    ? "0"
    : roundNumber(number, component.round).toString();

  const extraProps = {};

  if ("min" in component) {
    extraProps.min = component.min;
  }

  if ("max" in component) {
    extraProps.max = component.max;
  }

  return (
    <>
      <input
        className={styles.textField}
        type="number"
        step={component.step}
        value={value}
        onChange={onChange}
        {...extraProps}
      />
      {"suffix" in component ? component.suffix : <>&nbsp;</>}
    </>
  );
}

function TripletTextFieldGroup({
  colorSpace,
  color,
  component,
  onColorUpdated
}) {
  return (
    <fieldset className={`${styles.fieldset} ${styles.labeledInput}`}>
      <label className={styles.label}>{component.name.toUpperCase()}</label>
      <TripletTextField
        colorSpace={colorSpace}
        color={color}
        component={component}
        onColorUpdated={onColorUpdated}
      />
    </fieldset>
  );
}

function ColorFields({ colorSpace, color, onColorUpdated }) {
  const content = colorSpace.components.map((component, index) => (
    <TripletTextFieldGroup
      key={index}
      colorSpace={colorSpace}
      color={color}
      component={component}
      onColorUpdated={onColorUpdated}
    />
  ));

  return (
    <fieldset className={`${styles.fieldset} ${styles.triplet}`}>
      {content}
    </fieldset>
  );
}

function HexColorField({ colorsByColorSpaceName, onColorUpdated }) {
  function onChange(event) {
    const input = event.target;
    onColorUpdated(input.value);
  }

  const wrappedColorsByColorSpaceName = _.reduce(
    colorsByColorSpaceName,
    (obj, color, colorSpaceName) => {
      const colorSpace = _.fetch(colorSpacesByName, colorSpaceName);
      const wrappedColor = new WrappedColor(colorSpace, color);
      return { ...obj, [colorSpaceName]: wrappedColor };
    },
    {}
  );
  const wrappedColor = _.fetch(wrappedColorsByColorSpaceName, "hex");

  return (
    <fieldset className={`${styles.fieldset} ${styles.triplet}`}>
      <label className={styles.label}>Hex</label>
      <input
        className={`${styles.textField} ${styles.hexColorField}`}
        type="text"
        value={wrappedColor.color}
        onChange={onChange}
      />
    </fieldset>
  );
}

function App() {
  const initialState = _.reduce(
    colorSpacesByName,
    (obj, colorSpace, colorSpaceName) => {
      const color =
        colorSpace.components.length > 0
          ? colorSpace.components.reduce((obj2, component) => {
              return { ...obj2, [component.name]: 0 };
            }, {})
          : "#000000";
      return { ...obj, [colorSpaceName]: color };
    },
    {}
  );
  const [colorsByColorSpaceName, setColorsByColorSpaceName] = useState(
    initialState
  );

  function onTripletColorUpdated(
    selectedColorSpace,
    selectedComponent,
    newValue
  ) {
    const selectedColor = _.fetch(
      colorsByColorSpaceName,
      selectedColorSpace.name
    );
    const newSelectedColor = {
      ...selectedColor,
      [selectedComponent.name]: newValue
    };
    _onColorUpdated(newSelectedColor, selectedColorSpace);
  }

  function onHexColorUpdated(newValue) {
    _onColorUpdated(newValue, colorSpacesByName.hex);
  }

  function _onColorUpdated(newSelectedColor, selectedColorSpace) {
    const unselectedColorSpaceNames = _.difference(
      Object.keys(colorsByColorSpaceName),
      [selectedColorSpace.name]
    );
    let newSelectedFormalColor;

    try {
      newSelectedFormalColor = buildFormalColor(newSelectedColor);
    } catch (e) {
      if (/Unable to parse color/.test(e.message)) {
        console.warn(`Unable to parse color ${newSelectedColor}`);
        // don't worry about it
      } else {
        throw e;
      }
    }

    if (newSelectedFormalColor) {
      const newColorsByColorSpaceName = unselectedColorSpaceNames.reduce(
        (obj, unselectedColorSpaceName) => {
          const newUnselectedFormalColor = newSelectedFormalColor[
            unselectedColorSpaceName
          ]();
          const newUnselectedInformalColor =
            typeof newUnselectedFormalColor === "string"
              ? newUnselectedFormalColor
              : newUnselectedFormalColor.object();
          return {
            ...obj,
            [unselectedColorSpaceName]: newUnselectedInformalColor
          };
        },
        { [selectedColorSpace.name]: newSelectedColor }
      );
      setColorsByColorSpaceName(newColorsByColorSpaceName);
    } else {
      setColorsByColorSpaceName({
        ...colorsByColorSpaceName,
        [selectedColorSpace.name]: newSelectedColor
      });
    }
  }

  const colorFields = colorSpaceNames.map((colorSpaceName, index) => {
    const color = _.fetch(colorsByColorSpaceName, colorSpaceName);
    const colorSpace = _.fetch(colorSpacesByName, colorSpaceName);
    return (
      <ColorFields
        key={index}
        colorSpace={colorSpace}
        color={color}
        onColorUpdated={onTripletColorUpdated}
      />
    );
  });

  return (
    <>
      <Swatch colorsByColorSpaceName={colorsByColorSpaceName} />
      <form>
        {colorFields}
        <HexColorField
          colorsByColorSpaceName={colorsByColorSpaceName}
          onColorUpdated={onHexColorUpdated}
        />
      </form>
    </>
  );
}

export default App;
