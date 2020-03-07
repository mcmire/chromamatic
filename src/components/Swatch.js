import React from "react";

import { COLOR_REPRESENTATION_NAMES } from "../lib/colorRepresentationsByName";

import styles from "./Swatch.module.css";

export default function Swatch({
  colorsByRepresentationName,
  lastColorUpdated
}) {
  const content = COLOR_REPRESENTATION_NAMES.map(representationName => {
    const color = colorsByRepresentationName.fetch(representationName);
    return <div key={representationName}>{color.name}</div>;
  });

  return (
    <div
      className={styles.swatch}
      style={{
        backgroundColor: lastColorUpdated.hex().string,
        color: lastColorUpdated.textColor
      }}
    >
      <div className={styles.swatchContent}>{content}</div>
    </div>
  );
}
