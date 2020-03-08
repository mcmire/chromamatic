import React from "react";

import EditorGroup from "./EditorGroup";
import ColorStringField from "./ColorStringField";

import styles from "./HexStringField.css";

export default function HexStringField({ colorForm, onUpdate, onLeave }) {
  return (
    <EditorGroup name="hex">
      <ColorStringField
        className={styles.hexStringField}
        colorForm={colorForm}
        onUpdate={onUpdate}
        onLeave={onLeave}
        onClick={onClick}
      />
    </EditorGroup>
  );
}
