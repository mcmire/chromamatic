import React from "react";

import ColorSpaceColorComponentField from "./ColorSpaceColorComponentField";

import styles from "./ColorSpaceColorEditor.css";

export default function ColorSpaceColorEditor({
  representation,
  color,
  onColorFieldChange,
  onColorFieldBlur
}) {
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
    <fieldset className={styles.representationFields}>
      <span className={styles.representationName}>{representation.name}</span>
      {content}
    </fieldset>
  );
}
