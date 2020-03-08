import React from "react";

import styles from "./ColorTupleComponentField.css";

export default function ColorTupleComponentField({
  colorForm,
  component,
  onUpdate,
  onLeave
}) {
  function onChange(event) {
    const input = event.target;
    onUpdate(colorForm, component, input.value);
  }

  const classes = [styles.textField];
  if (colorForm.hasErrorsOn(component.name)) {
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
        value={colorForm.get(component.name)}
        onChange={onChange}
        onBlur={onLeave}
        {...extraProps}
      />
      <span className={styles.suffix}>{suffix}</span>
    </>
  );
}
