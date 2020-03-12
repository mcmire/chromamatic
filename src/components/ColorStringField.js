import React from "react";

import styles from "./ColorStringField.css";

export default function ColorStringField({
  className,
  colorForm,
  onUpdate,
  onLeave
}) {
  function onChange(event) {
    const input = event.target;
    onUpdate(colorForm, input.value);
  }

  function onBlur(event) {
    onLeave(colorForm);
  }

  const classes = [
    styles.colorStringField,
    styles[`${colorForm.representation.name}Field`]
  ];
  if (!colorForm.isValid()) {
    classes.push(styles.hasErrors);
  }

  return (
    <input
      className={classes.join(" ")}
      type="text"
      value={colorForm.data}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
