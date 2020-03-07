import React from "react";

import TripletTextField from "./TripletTextField";

import styles from "./TripletTextFieldGroup.css";

export default function TripletTextFieldGroup({
  representation,
  color,
  component,
  onColorFieldChange,
  onColorFieldBlur
}) {
  return (
    <fieldset className={styles.labeledInput}>
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
