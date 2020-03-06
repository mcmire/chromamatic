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

const colorSpacesByName = {
  rgb: { name: "rgb", components: ["r", "g", "b"] },
  hsl: { name: "hsl", components: ["h", "s", "l"] }
};

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
      const values = this.colorSpace.components.map(component =>
        this.color.get(`${this.colorSpace}.${component}`)
      );
      return `${this.colorSpace.name}(${values.join(",")})`;
    }
  }
}

function TripletTextField({ colorSpace, color, component, onColorUpdated }) {
  function onChange(event) {
    const input = event.target;
    console.log("Color updated", colorSpace, component, input.value);
    onColorUpdated(colorSpace, component, input.value);
  }

  const number = color.get(`${colorSpace.name}.${component}`);
  const value = isNaN(number) ? "0" : number.toString();

  return (
    <input
      className={styles.textField}
      type="number"
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
      <label className={styles.label}>{component.toUpperCase()}</label>
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
      colorSpace
    );
    const newColor = _.fetch(colorsByColorSpaceName, colorSpace.name).set(
      `${colorSpace.name}.${component}`,
      value
    );
    const newColorsByColorSpace = allColorSpaceNamesExceptOneBeingUpdated.reduce(
      (obj, colorSpaceName) => {
        const newConvertedColor = chroma[colorSpaceName](
          ...newColor[colorSpaceName]()
        );
        return { ...obj, [colorSpaceName]: newConvertedColor };
      },
      { [colorSpace]: newColor }
    );
    setColorsByColorSpace(newColorsByColorSpace);
  }

  const colorFields = _.map(colorsByColorSpaceName, (color, colorSpaceName) => {
    const colorSpace = _.fetch(colorSpacesByName, colorSpaceName);
    return (
      <ColorFields
        key={colorSpaceName}
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
