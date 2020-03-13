import _ from "../vendor/lodash";
import React from "react";

import ColorTupleComponentField from "./ColorTupleComponentField";
import ColorStringField from "./ColorStringField";

import styles from "./ColorSpaceGroup.css";

function ColorTupleFieldGroup({
  colorForm,
  onFieldFocus,
  onFieldUpdate,
  onFieldLeave
}) {
  return (
    <span className={styles.colorFieldGroup}>
      {colorForm.colorSpace.components.map((component, index) => (
        <span key={index} className={styles.labeledInput}>
          <label className={styles.label}>{component.name.toUpperCase()}</label>
          <ColorTupleComponentField
            colorForm={colorForm}
            component={component}
            onFocus={onFieldFocus}
            onUpdate={onFieldUpdate}
            onLeave={onFieldLeave}
          />
        </span>
      ))}
    </span>
  );
}

function ColorStringFieldGroup({
  colorForm,
  onFieldFocus,
  onFieldUpdate,
  onFieldLeave
}) {
  return (
    <span className={styles.colorFieldGroup}>
      <ColorStringField
        colorForm={colorForm}
        onFocus={onFieldFocus}
        onUpdate={onFieldUpdate}
        onLeave={onFieldLeave}
      />
    </span>
  );
}

export default function ColorSpaceGroup({
  colorSpace,
  colorFormsByRepresentationName,
  onColorTupleComponentFieldUpdate,
  onColorStringFieldUpdate,
  onColorEditorLeave,
  onMouseOverColorSpaceName,
  onMouseOutColorSpaceName,
  onSelectColorSpace,
  isHighlighted,
  isSelected
}) {
  function onMouseOver(event) {
    onMouseOverColorSpaceName(colorSpace);
  }

  function onMouseOut(event) {
    onMouseOutColorSpaceName(colorSpace);
  }

  function onClick(event) {
    event.preventDefault();
    onSelectColorSpace(colorSpace);
  }

  const elements = _.map(colorSpace.representationNames, representationName => {
    const colorForm = _.demand(
      colorFormsByRepresentationName,
      representationName
    );
    if (representationName === "tuple") {
      return (
        <ColorTupleFieldGroup
          key={representationName}
          colorForm={colorForm}
          onFieldFocus={onSelectColorSpace}
          onFieldUpdate={onColorTupleComponentFieldUpdate}
          onFieldLeave={onColorEditorLeave}
        />
      );
    } else {
      return (
        <ColorStringFieldGroup
          key={representationName}
          colorForm={colorForm}
          onFieldFocus={onSelectColorSpace}
          onFieldUpdate={onColorStringFieldUpdate}
          onFieldLeave={onColorEditorLeave}
        />
      );
    }
  });

  const classes = [styles.colorSpaceGroup];

  if (isSelected) {
    classes.push(styles.colorSpaceGroupSelected);
  } else {
    classes.push(styles.colorSpaceGroupUnselected);
  }

  if (isHighlighted) {
    classes.push(styles.colorSpaceGroupHighlighted);
  } else {
    classes.push(styles.colorSpaceGroupUnhighlighted);
  }

  return (
    <div className={classes.join(" ")}>
      <a
        href="#"
        className={styles.colorSpaceName}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
      >
        {colorSpace.name}
      </a>
      <span className={styles.elements}>{elements}</span>
    </div>
  );
}
