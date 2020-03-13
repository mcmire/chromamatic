import React from "react";

import styles from "./ColorSpaceGroupIndicator.css";

export default function ColorSpaceGroupIndicator({
  isVisible,
  topPosition,
  type
}) {
  const classNames = [styles.svg, styles[`${type}`]];

  if (isVisible) {
    classNames.push(styles.appear);
  } else {
    classNames.push(styles.disappear);
  }

  return (
    <svg
      width="103px"
      height="33px"
      viewBox="0 0 103 33"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={classNames.join(" ")}
      style={{ top: `${topPosition}px` }}
    >
      <defs>
        <path
          d="M6,1 L73.8097488,1 C74.6913015,1 75.5571839,1.23307166 76.3196231,1.67558891 L101,16 L101,16 L76.3196231,30.3244111 C75.5571839,30.7669283 74.6913015,31 73.8097488,31 L6,31 C3.23857625,31 1,28.7614237 1,26 L1,6 C1,3.23857625 3.23857625,1 6,1 Z"
          id="ColorSpaceGroupIndicator-path-1"
        ></path>
        <filter
          x="-1.0%"
          y="-3.3%"
          width="103.5%"
          height="110.0%"
          filterUnits="objectBoundingBox"
          id="ColorSpaceGroupIndicator-filter-2"
        >
          <feMorphology
            radius="0.5"
            operator="dilate"
            in="SourceAlpha"
            result="shadowSpreadOuter1"
          ></feMorphology>
          <feOffset
            dx="1"
            dy="1"
            in="shadowSpreadOuter1"
            result="shadowOffsetOuter1"
          ></feOffset>
          <feComposite
            in="shadowOffsetOuter1"
            in2="SourceAlpha"
            operator="out"
            result="shadowOffsetOuter1"
          ></feComposite>
          <feColorMatrix
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.2 0"
            type="matrix"
            in="shadowOffsetOuter1"
          ></feColorMatrix>
        </filter>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <use
          fill="black"
          fillOpacity="1"
          filter="url(#ColorSpaceGroupIndicator-filter-2)"
          xlinkHref="#ColorSpaceGroupIndicator-path-1"
        ></use>
        <use
          strokeOpacity="0.6"
          stroke="#000000"
          strokeWidth="1"
          fillRule="evenodd"
          xlinkHref="#ColorSpaceGroupIndicator-path-1"
          className={styles.fill}
        ></use>
      </g>
    </svg>
  );
}
