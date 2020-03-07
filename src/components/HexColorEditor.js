import React from "react";

import styles from "./HexColorEditor.css";

export default function HexColorEditor({
  className,
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
    <div className={`${className} ${styles.colorEditor}`}>
      <label className={styles.representationName}>hex</label>
      <input
        className={classes.join(" ")}
        type="text"
        value={color.data}
        onChange={onChange}
        onBlur={onColorFieldBlur}
      />
    </div>
  );
}
