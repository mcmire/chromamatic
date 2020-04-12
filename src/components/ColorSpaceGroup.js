import _ from "../vendor/lodash";
import React from "react";

import ColorTupleComponentField from "./ColorTupleComponentField";
import ColorStringField from "./ColorStringField";

import lockOpenPath from "../assets/lock-open-outline.svg";
import lockClosedPath from "../assets/lock-closed.svg";
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
  onFocusColorField,
  updateLockedColorSpace,
  isHighlighted,
  isSelected,
  isLocked
}) {
  function onLockIconClick(event) {
    event.preventDefault();
    updateLockedColorSpace(colorSpace);
  }

  function onColorSpaceNameMouseOver(event) {
    onMouseOverColorSpaceName(colorSpace);
  }

  function onColorSpaceNameMouseOut(event) {
    onMouseOutColorSpaceName(colorSpace);
  }

  function onColorSpaceNameClick(event) {
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
          onFieldFocus={onFocusColorField}
          onFieldUpdate={onColorTupleComponentFieldUpdate}
          onFieldLeave={onColorEditorLeave}
        />
      );
    } else {
      return (
        <ColorStringFieldGroup
          key={representationName}
          colorForm={colorForm}
          onFieldFocus={onFocusColorField}
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
        className={styles.lockIcon}
        href="#"
        onClick={onLockIconClick}
        title="Lock
        updates to this color space"
      >
        <img src={isLocked ? lockClosedPath : lockOpenPath} />
      </a>
      <a
        href="#"
        className={styles.colorSpaceName}
        onMouseOver={onColorSpaceNameMouseOver}
        onMouseOut={onColorSpaceNameMouseOut}
        onClick={onColorSpaceNameClick}
      >
        {colorSpace.name}
      </a>
      <span className={styles.elements}>{elements}</span>
    </div>
  );
}
