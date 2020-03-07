import React from "react";

import TripletTextFieldGroup from "./TripletTextFieldGroup";

import styles from "./ColorSpaceColorFields.module.css";

export default function ColorSpaceColorFields({
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
    <fieldset className={styles.representationFields}>
      <span className={styles.representationName}>{representation.name}</span>
      {content}
    </fieldset>
  );
}
