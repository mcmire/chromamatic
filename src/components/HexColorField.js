import React from "react";

import styles from "./HexColorField.css";

export default function HexColorField({
  color,
  onColorFieldChange,
  onColorFieldBlur
}) {
  function onChange(event) {
    const input = event.target;
    onColorFieldChange(input.value);
  }

  const classes = [styles.textField, styles.hexColorField];
  if (!color.isValid()) {
    classes.push(styles.hasErrors);
  }

  return (
    <fieldset className={styles.representationFields}>
      <label className={styles.representationName}>hex</label>
      <input
        className={classes.join(" ")}
        type="text"
        value={color.data}
        onChange={onChange}
        onBlur={onColorFieldBlur}
      />
    </fieldset>
  );
}
