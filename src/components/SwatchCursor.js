import React from "react";

import styles from "./SwatchCursor.css";

const CURSOR_SIZE = 17;

export default function SwatchCursor({ cursorPosition, colorAtPosition }) {
  const cursorColor = colorAtPosition.textColor;

  return (
    <svg
      className={styles.cursor}
      width={CURSOR_SIZE}
      height={CURSOR_SIZE}
      viewBox={`0 0 ${CURSOR_SIZE} ${CURSOR_SIZE}`}
      style={{
        left: `${cursorPosition.x - CURSOR_SIZE / 2 - 1}px`,
        top: `${cursorPosition.y - CURSOR_SIZE / 2}px`
      }}
    >
      <circle
        stroke={cursorColor}
        strokeWidth="1px"
        cx={CURSOR_SIZE / 2}
        cy={CURSOR_SIZE / 2 + 1}
        r={CURSOR_SIZE / 2 - 2}
        fill="none"
      />
      <circle
        cx={CURSOR_SIZE / 2}
        cy={CURSOR_SIZE / 2 + 1}
        r="1"
        fill={cursorColor}
      />
    </svg>
  );
}
