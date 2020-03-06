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

const colorSpaceComponentsByColorSpace = {
  rgb: [
    { prop: "r", label: "R" },
    { prop: "g", label: "G" },
    { prop: "b", label: "B" }
  ]
};

class WrappedColor {
  constructor(color) {
    this.code = color.hex();
    this.name = this.code;
    this.textColor = color.luminance() >= 0.5 ? "black" : "white";
  }
}

function TripletTextField({ colorSpace, color, component, onColorUpdated }) {
  function onChange(event) {
    const input = event.target;
    console.log("Color updated", colorSpace, component.prop, input.value);
    onColorUpdated(colorSpace, component.prop, input.value);
  }
  return (
    <input
      className={styles.textField}
      type="number"
      value={color.get(`${colorSpace}.${component.prop}`)}
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
    <fieldset className={`${styles.fieldset} ${styles.inputGroup}`}>
      <label className={styles.label}>{component.label}</label>
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
  const components = _.fetch(colorSpaceComponentsByColorSpace, colorSpace);
  const content = components.map((component, index) => (
    <TripletTextFieldGroup
      key={index}
      colorSpace={colorSpace}
      color={color}
      component={component}
      onColorUpdated={onColorUpdated}
    />
  ));

  return <fieldset className={styles.fieldset}>{content}</fieldset>;
}

function App() {
  const [colorsByColorSpace, setColorsByColorSpace] = useState({
    rgb: chroma("black")
  });

  function onColorUpdated(colorSpace, component, value) {
    const allColorSpaceExceptUpdating = _.difference(
      Object.keys(colorsByColorSpace),
      colorSpace
    );
    const newColor = _.fetch(colorsByColorSpace, colorSpace).set(
      `${colorSpace}.${component}`,
      value
    );
    const newColorsByColorSpace = allColorSpaceExceptUpdating.reduce(
      (obj, colorSpace) => {
        const newConvertedColor = chroma[colorSpace](...newColor[colorSpace]());
        return { ...obj, [colorSpace]: newConvertedColor };
      },
      { [colorSpace]: newColor }
    );
    setColorsByColorSpace(newColorsByColorSpace);
  }

  const colorFields = _.map(colorsByColorSpace, (color, colorSpace) => (
    <ColorFields
      key={colorSpace}
      colorSpace={colorSpace}
      color={color}
      onColorUpdated={onColorUpdated}
    />
  ));

  return (
    <>
      <div className={styles.swatches}>
        {Object.values(colorsByColorSpace).map(color => {
          const wrappedColor = new WrappedColor(color);
          return (
            <div
              className={styles.swatch}
              style={{
                backgroundColor: wrappedColor.code,
                width: "100px",
                height: "100px"
              }}
            >
              <span style={{ color: wrappedColor.textColor }}>
                {wrappedColor.name}
              </span>
            </div>
          );
        })}
      </div>

      <form>{colorFields}</form>
    </>
  );
}

export default App;
