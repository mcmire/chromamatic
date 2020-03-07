import React from "react";

import ColorSpaceColorComponentField from "./ColorSpaceColorComponentField";

import styles from "./ColorSpaceColorEditor.css";

export default function ColorSpaceColorEditor({
  representation,
  color,
  onColorFieldChange,
  onColorFieldBlur
}) {
  function onClickColorName(event) {
    event.target.select();
  }
  const content = representation.components.map((component, index) => (
    <fieldset key={index} className={styles.labeledInput}>
      <label className={styles.label}>{component.name.toUpperCase()}</label>
      <ColorSpaceColorComponentField
        representation={representation}
        color={color}
        component={component}
        onColorFieldChange={onColorFieldChange}
        onColorFieldBlur={onColorFieldBlur}
      />
    </fieldset>
  ));

  return (
    <div className={styles.colorEditor}>
      <span className={styles.representationName}>{representation.name}</span>
      <span className={styles.representationFields}>{content}</span>
      <input
        type="text"
        className={`${styles.colorName} ${styles.textField}`}
        onClick={onClickColorName}
        value={color.name}
        readOnly
      />
    </div>
  );
}
