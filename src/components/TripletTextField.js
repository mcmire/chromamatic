import React from "react";

import styles from "./TripletTextField.module.css";

export default function TripletTextField({
  representation,
  color,
  component,
  onColorFieldChange,
  onColorFieldBlur
}) {
  function onChange(event) {
    const input = event.target;
    onColorFieldChange(representation, component, input.value);
  }

  const classes = [styles.textField];
  if (color.hasErrorsOn(component.name)) {
    classes.push(styles.hasErrors);
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
