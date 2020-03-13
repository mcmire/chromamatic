import _ from "../vendor/lodash";
import React from "react";

import styles from "./SwatchAxesSelectors.css";

function buildAxesFrom(values) {
  if (values.length === 3) {
    return [
      { x: values[0], y: values[1] },
      { x: values[1], y: values[2] },
      { x: values[0], y: values[2] }
    ];
  } else {
    throw new Error(
      "Finding combinations of more than 3 values is not supported"
    );
  }
}

function AxesSelector({ axes, isActive, onChoose }) {
  function onClick(event) {
    event.preventDefault();
    onChoose(axes);
  }
  const classes = [styles.axesSelector];

  if (isActive) {
    classes.push(styles.axesSelectorActive);
  }

  return (
    <button className={classes.join(" ")} onClick={onClick}>
      {axes.x.toUpperCase()} / {axes.y.toUpperCase()}
    </button>
  );
}

export default function SwatchAxesSelectors({
  allAxes,
  selectedAxes,
  onSelectAxes
}) {
  return (
    <div className={styles.selectors}>
      {_.map(buildAxesFrom(allAxes), axes => {
        const isActive = _.isEqual(selectedAxes, axes);
        return (
          <AxesSelector
            key={`${axes.x}${axes.y}`}
            axes={axes}
            isActive={isActive}
            onChoose={onSelectAxes}
          />
        );
      })}
    </div>
  );
}
