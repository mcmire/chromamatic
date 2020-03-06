import React, { useState } from "react";
import _ from "lodash";
import chroma from "chroma-js";

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

const colorSpaceNames = ["rgb", "hsl", "lab"];
const colorSpacesByName = {
  rgb: {
    name: "rgb",
    components: [
      { name: "r", step: 1, min: 0, max: 255 },
      { name: "g", step: 1, min: 0, max: 255 },
      { name: "b", step: 1, min: 0, max: 255 }
    ]
  },
  hsl: {
    name: "hsl",
    components: [
      { name: "h", step: 0.1, min: 0, max: 1 },
      { name: "s", step: 0.1, min: 0, max: 1 },
      { name: "l", step: 0.1, min: 0, max: 1 }
    ]
  },
  lab: {
    name: "lab",
    components: [
      { name: "l", step: 0.1, min: 0, max: 1 },
      { name: "a", step: 0.1, min: 0, max: 1 },
      { name: "b", step: 0.1, min: 0, max: 1 }
    ]
  }
};

function roundNumber(number) {
  return Math.round(number * 1000) / 1000;
}

class WrappedColor {
  constructor(colorSpace, color) {
    this.colorSpace = colorSpace;
    this.color = color;
    this.code = color.hex();
    this.textColor = color.luminance() >= 0.5 ? "black" : "white";
  }

  get name() {
    if (this.colorSpace.name === "rgb" || this.colorSpace.name === "hsl") {
      return this.color.css(this.colorSpace.name);
    } else {
      const values = this.colorSpace.components.map(component => {
        const number = this.color.get(
          `${this.colorSpace.name}.${component.name}`
        );
        return roundNumber(number);
      });
      return `${this.colorSpace.name}(${values.join(",")})`;
    }
  }
}

function TripletTextField({ colorSpace, color, component, onColorUpdated }) {
  function onChange(event) {
    const input = event.target;
    onColorUpdated(colorSpace, component, input.value);
  }

  const number = color.get(`${colorSpace.name}.${component.name}`);
  const value = isNaN(number) ? "0" : number.toString();

  return (
    <input
      className={styles.textField}
      type="number"
      step={component.step}
      min={component.min}
      max={component.max}
      value={value}
      onChange={onChange}
    />
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

function Swatch({ colorSpace, color }) {
  const wrappedColor = new WrappedColor(colorSpace, color);
  return (
    <div
      className={styles.swatch}
      style={{ backgroundColor: wrappedColor.code }}
    >
      <span style={{ color: wrappedColor.textColor }}>{wrappedColor.name}</span>
    </div>
  );
}

function Swatches({ colorsByColorSpaceName }) {
  const content = _.map(colorsByColorSpaceName, (color, colorSpaceName) => {
    const colorSpace = _.fetch(colorSpacesByName, colorSpaceName);
    return (
      <Swatch key={colorSpaceName} colorSpace={colorSpace} color={color} />
    );
  });

  return <div className={styles.swatches}>{content}</div>;
}

function App() {
  const initialState = Object.keys(colorSpacesByName).reduce(
    (obj, colorSpaceName) => {
      return { ...obj, [colorSpaceName]: chroma(0, 0, 0, colorSpaceName) };
    },
    {}
  );
  const [colorsByColorSpaceName, setColorsByColorSpace] = useState(
    initialState
  );

  function onColorUpdated(colorSpace, component, value) {
    const allColorSpaceNamesExceptOneBeingUpdated = _.difference(
      Object.keys(colorsByColorSpaceName),
      [colorSpace.name]
    );
    const existingColor = _.fetch(colorsByColorSpaceName, colorSpace.name);
    const newColor = existingColor.set(
      `${colorSpace.name}.${component.name}`,
      value
    );
    /*
    console.log(
      "colorSpace",
      colorSpace.name,
      "component",
      component.name,
      "existingColor",
      existingColor,
      "newColor",
      newColor,
      "value",
      value
    );
    */
    const newColorsByColorSpaceName = allColorSpaceNamesExceptOneBeingUpdated.reduce(
      (obj, colorSpaceName) => {
        const newConvertedColor = chroma[colorSpaceName](
          ...newColor[colorSpaceName]()
        );
        return { ...obj, [colorSpaceName]: newConvertedColor };
      },
      { [colorSpace.name]: newColor }
    );
    setColorsByColorSpace(newColorsByColorSpaceName);
  }

  const colorFields = colorSpaceNames.map((colorSpaceName, index) => {
    const color = _.fetch(colorsByColorSpaceName, colorSpaceName);
    const colorSpace = _.fetch(colorSpacesByName, colorSpaceName);
    return (
      <ColorFields
        key={index}
        colorSpace={colorSpace}
        color={color}
        onColorUpdated={onColorUpdated}
      />
    );
  });

  return (
    <>
      <Swatches colorsByColorSpaceName={colorsByColorSpaceName} />
      <form>{colorFields}</form>
    </>
  );
}

export default App;
