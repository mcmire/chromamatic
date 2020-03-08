import React from "react";

//import { COLOR_REPRESENTATION_NAMES } from "../lib/colorRepresentationsByName";

import styles from "./Swatch.css";

export default function Swatch({
  colorsByRepresentationName,
  lastColorUpdated
}) {
  return (
    <div
      className={styles.swatch}
      style={{
        backgroundColor: lastColorUpdated.toFormattedString({ hex: true }),
        color: lastColorUpdated.textColor
      }}
    />
  );
}
