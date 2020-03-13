import React from "react";

import styles from "./ColorStringField.css";

export default function ColorStringField({
  className,
  colorForm,
  onFocus,
  onUpdate,
  onLeave
}) {
  function _onFocus(event) {
    onFocus(colorForm.colorSpace);
  }

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
      onFocus={_onFocus}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
