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

const colorSpaceNames = [
  //"rgb",
  "hsl"
  //"lab"
];
const colorSpacesByName = {
  /*
  rgb: {
    name: "rgb",
    components: [
      { name: "r", step: 1, min: 0, max: 255 },
      { name: "g", step: 1, min: 0, max: 255 },
      { name: "b", step: 1, min: 0, max: 255 }
    ]
  }
  */
  hsl: {
    name: "hsl",
    components: [
      { name: "h", step: 0.1, min: 0, max: 1 },
      { name: "s", step: 0.1, min: 0, max: 1 },
      { name: "l", step: 0.1, min: 0, max: 1 }
    ]
  }
  /*
  lab: {
    name: "lab",
    components: [
      { name: "l", step: 0.1, min: 0, max: 1 },
      { name: "a", step: 0.1, min: 0, max: 1 },
      { name: "b", step: 0.1, min: 0, max: 1 }
    ]
  }
  */
};

function roundNumber(number) {
  return Math.round(number * 1000) / 1000;
}

function buildChroma(colorSpace, color) {
  console.log(`chroma(${JSON.stringify(color)})`);
  return chroma(color);
}

class WrappedColor {
  constructor(colorSpace, color) {
    this.colorSpace = colorSpace;
    this.color = color;
    this.chroma = buildChroma(colorSpace, color);
    this.code = this.chroma.hex();
    this.textColor = this.chroma.luminance() >= 0.5 ? "black" : "white";
  }

  get name() {
    if (this.colorSpace.name === "rgb" || this.colorSpace.name === "hsl") {
      return this.chroma.css(this.colorSpace.name);
    } else {
      const values = this.colorSpace.components.map(component => {
        const number = this.chroma.get(
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

  const number = _.fetch(color, component.name);
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
  const initialState = _.reduce(
    colorSpacesByName,
    (obj, colorSpace, colorSpaceName) => {
      const color = colorSpace.components.reduce((obj2, component) => {
        return { ...obj2, [component.name]: 0 };
      }, {});
      return { ...obj, [colorSpaceName]: color };
    },
    {}
  );
  const [colorsByColorSpaceName, setColorsByColorSpace] = useState(
    initialState
  );

  function onColorUpdated(selectedColorSpace, selectedComponent, newValue) {
    const unselectedColorSpaceNames = _.difference(
      Object.keys(colorsByColorSpaceName),
      [selectedColorSpace.name]
    );
    const selectedColor = _.fetch(
      colorsByColorSpaceName,
      selectedColorSpace.name
    );
    const newSelectedColor = {
      ...selectedColor,
      [selectedComponent.name]: newValue
    };
    const newSelectedChroma = buildChroma(selectedColorSpace, newSelectedColor);
    console.log(
      "newSelectedColor",
      newSelectedColor,
      "newSelectedChroma",
      newSelectedChroma[selectedColorSpace.name]()
    );
    const newColorsByColorSpaceName = unselectedColorSpaceNames.reduce(
      (obj, unselectedColorSpaceName) => {
        const unselectedColorSpace = _.fetch(
          colorSpacesByName,
          unselectedColorSpaceName
        );
        const newUnselectedColor = unselectedColorSpace.components.reduce(
          (obj, component) => {
            return {
              ...obj,
              [component.name]: newSelectedChroma.get(
                `${unselectedColorSpaceName}.${component.name}`
              )
            };
          },
          {}
        );
        return { ...obj, [unselectedColorSpaceName]: newUnselectedColor };
      },
      { [selectedColorSpace.name]: newSelectedColor }
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
