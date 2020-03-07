import React, { useState } from "react";
import _ from "./lodash";
import colorRepresentationsByName from "./colorstuff";
import StrictMap from "./StrictMap";

import styles from "./App.module.css";

const COLOR_REPRESENTATION_NAMES = ["rgb", "hsl", "hsluv", "hex"];

function Swatch({ colorsByRepresentationName, lastColorUpdated }) {
  const content = COLOR_REPRESENTATION_NAMES.map(representationName => {
    const color = colorsByRepresentationName.fetch(representationName);
    return <div key={representationName}>{color.name}</div>;
  });

  return (
    <div
      className={styles.swatch}
      style={{
        backgroundColor: lastColorUpdated.hex().string,
        color: lastColorUpdated.textColor
      }}
    >
      <div className={styles.swatchContent}>{content}</div>
    </div>
  );
}

function TripletTextField({
  representation,
  color,
  component,
  onColorFieldChange,
  onColorFieldBlur
}) {
  function onChange(event) {
    const input = event.target;
    onColorFieldChange(representation, component, parseFloat(input.value, 10));
  }

  const classes = [styles.textField];
  if (color.hasErrorsOn(component.name)) {
    classes.push(styles.textField);
  }

  const extraProps = {};
  if ("min" in component) {
    extraProps.min = component.min;
  }
  if ("max" in component) {
    extraProps.max = component.max;
  }

  const suffix = component.suffix != null ? component.suffix : <>&nbsp;</>;

  return (
    <>
      <input
        className={classes.join(" ")}
        type="number"
        step={component.step}
        value={color.get(component.name)}
        onChange={onChange}
        onBlur={onColorFieldBlur}
        {...extraProps}
      />
      <span className={styles.suffix}>{suffix}</span>
    </>
  );
}

function TripletTextFieldGroup({
  representation,
  color,
  component,
  onColorFieldChange,
  onColorFieldBlur
}) {
  return (
    <fieldset className={`${styles.fieldset} ${styles.labeledInput}`}>
      <label className={styles.label}>{component.name.toUpperCase()}</label>
      <TripletTextField
        representation={representation}
        color={color}
        component={component}
        onColorFieldChange={onColorFieldChange}
        onColorFieldBlur={onColorFieldBlur}
      />
    </fieldset>
  );
}

function ColorSpaceColorFields({
  representation,
  color,
  onColorFieldChange,
  onColorFieldBlur
}) {
  const content = representation.components.map((component, index) => (
    <TripletTextFieldGroup
      key={index}
      representation={representation}
      color={color}
      component={component}
      onColorFieldChange={onColorFieldChange}
      onColorFieldBlur={onColorFieldBlur}
    />
  ));

  return (
    <fieldset className={`${styles.fieldset} ${styles.triplet}`}>
      <span className={styles.representationName}>{representation.name}</span>
      {content}
    </fieldset>
  );
}

function HexColorField({ color, onColorFieldChange, onColorFieldBlur }) {
  function onChange(event) {
    const input = event.target;
    onColorFieldChange(input.value);
  }

  let className = color.isValid()
    ? `${styles.textField} ${styles.hexColorField}`
    : `${styles.textField} ${styles.hexColorField} ${styles.hasErrors}`;

  return (
    <fieldset className={`${styles.fieldset} ${styles.triplet}`}>
      <label className={styles.representationName}>hex</label>
      <input
        className={className}
        type="text"
        value={color.data}
        onChange={onChange}
        onBlur={onColorFieldBlur}
      />
    </fieldset>
  );
}

function App() {
  const initialState = colorRepresentationsByName.reduce(
    (map, representation, representationName) => {
      return map.cloneWith({ [representationName]: representation.black() });
    },
    new StrictMap()
  );
  const [colorsByRepresentationName, setColorsByRepresentationName] = useState(
    initialState
  );
  const [lastColorUpdated, setLastColorUpdated] = useState(
    colorsByRepresentationName.fetch("rgb")
  );

  function onTripletColorFieldChange(
    selectedRepresentation,
    selectedComponent,
    newValue
  ) {
    const selectedColor = colorsByRepresentationName.fetch(
      selectedRepresentation.name
    );
    _onColorFieldChange(
      selectedColor.cloneWith({ [selectedComponent.name]: newValue }),
      selectedRepresentation
    );
  }

  function onHexColorFieldChange(newHexString) {
    const selectedColor = colorsByRepresentationName.fetch("hex");
    _onColorFieldChange(
      selectedColor.cloneWith(newHexString),
      colorRepresentationsByName.fetch("hex")
    );
  }

  function onColorFieldBlur() {
    const newColorsByRepresentationName = colorsByRepresentationName.reduce(
      (map, color, colorRepresentationName) => {
        return map.cloneWith({
          [colorRepresentationName]: color.withNormalizedData()
        });
      },
      new StrictMap()
    );

    setColorsByRepresentationName(newColorsByRepresentationName);
  }

  function _onColorFieldChange(newSelectedColor, selectedRepresentation) {
    newSelectedColor.validate();

    let newColorsByRepresentationName = colorsByRepresentationName.cloneWith({
      [selectedRepresentation.name]: newSelectedColor
    });

    if (newSelectedColor.isValid()) {
      const unselectedRepresentationNames = _.difference(
        Array.from(colorsByRepresentationName.keys()),
        [selectedRepresentation.name]
      );

      const additionalColorsByRepresentationName = unselectedRepresentationNames.reduce(
        (obj, unselectedRepresentationName) => {
          const newUnselectedColor = newSelectedColor.convertTo(
            colorRepresentationsByName.fetch(unselectedRepresentationName)
          );
          return {
            ...obj,
            [unselectedRepresentationName]: newUnselectedColor
          };
        },
        {}
      );

      newColorsByRepresentationName = newColorsByRepresentationName.cloneWith(
        additionalColorsByRepresentationName
      );

      setLastColorUpdated(newSelectedColor);
    }

    setColorsByRepresentationName(newColorsByRepresentationName);
  }

  const colorFields = COLOR_REPRESENTATION_NAMES.map(
    (representationName, index) => {
      const color = colorsByRepresentationName.fetch(representationName);
      const representation = colorRepresentationsByName.fetch(
        representationName
      );

      if (representationName === "hex") {
        return (
          <HexColorField
            key={index}
            representation={representation}
            color={color}
            onColorFieldChange={onHexColorFieldChange}
            onColorFieldBlur={onColorFieldBlur}
          />
        );
      } else {
        return (
          <ColorSpaceColorFields
            key={index}
            representation={representation}
            color={color}
            onColorFieldChange={onTripletColorFieldChange}
            onColorFieldBlur={onColorFieldBlur}
          />
        );
      }
    }
  );

  return (
    <>
      <Swatch
        colorsByRepresentationName={colorsByRepresentationName}
        lastColorUpdated={lastColorUpdated}
      />
      <form>{colorFields}</form>
    </>
  );
}

export default App;
