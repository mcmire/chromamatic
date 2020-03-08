import _ from "../vendor/lodash";
import React from "react";

import ColorTupleComponentField from "./ColorTupleComponentField";
import EditorGroup from "./EditorGroup";
import ColorStringField from "./ColorStringField";

import styles from "./ColorSpaceGroup.css";

function ColorTupleFieldGroup({ colorForm, onUpdate, onLeave }) {
  return (
    <span className={styles.colorFieldGroup}>
      {colorForm.colorSpace.components.map((component, index) => (
        <span key={index} className={styles.labeledInput}>
          <label className={styles.label}>{component.name.toUpperCase()}</label>
          <ColorTupleComponentField
            colorForm={colorForm}
            component={component}
            onUpdate={onUpdate}
            onLeave={onLeave}
          />
        </span>
      ))}
    </span>
  );
}

function ColorStringFieldGroup({ colorForm, onUpdate, onLeave }) {
  return (
    <span className={styles.colorFieldGroup}>
      <ColorStringField
        colorForm={colorForm}
        onUpdate={onUpdate}
        onLeave={onLeave}
      />
    </span>
  );
}

export default function ColorSpaceGroup({
  colorSpace,
  colorFormsByRepresentationName,
  onColorTupleComponentFieldUpdate,
  onColorStringFieldUpdate,
  onColorEditorLeave
}) {
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
          onUpdate={onColorTupleComponentFieldUpdate}
          onLeave={onColorEditorLeave}
        />
      );
    } else {
      return (
        <ColorStringFieldGroup
          key={representationName}
          colorForm={colorForm}
          onUpdate={onColorStringFieldUpdate}
          onLeave={onColorEditorLeave}
        />
      );
    }
  });

  return <EditorGroup name={colorSpace.name}>{elements}</EditorGroup>;
}
