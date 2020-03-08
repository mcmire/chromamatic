import React from "react";

import styles from "./EditorGroup.css";

export default function EditorGroup({ name, children }) {
  return (
    <div className={styles.editorGroup}>
      <span className={styles.editorGroupName}>{name}</span>
      {children}
    </div>
  );
}
