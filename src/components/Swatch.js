import _ from "../vendor/lodash";
import React, { useEffect, useState, useRef } from "react";

import styles from "./Swatch.css";
import SwatchAxesSelectors from "./SwatchAxesSelectors";
import SwatchCursor from "./SwatchCursor";

const SWATCH_SIZE = 200;
const SWATCH_TO_RGB_RATIO = 255 / SWATCH_SIZE;
const RGB_TO_SWATCH_RATIO = SWATCH_SIZE / 255;
const ALL_AXES = ["r", "g", "b"];

function setPixelOn(imageData, { x, y }, { r, g, b, a }) {
  const index = (x + y * imageData.width) * 4;
  imageData.data[index + 0] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
}

function redrawCanvas(canvas, color, axes, sliderAxis) {
  const SWATCH_TO_RGB_RATIO = 255 / SWATCH_SIZE;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(SWATCH_SIZE, SWATCH_SIZE);
  for (let y = 0; y < SWATCH_SIZE; y++) {
    for (let x = 0; x < SWATCH_SIZE; x++) {
      const colorComponents = {
        [sliderAxis]: color.get(sliderAxis),
        [axes.x]: x * SWATCH_TO_RGB_RATIO,
        [axes.y]: y * SWATCH_TO_RGB_RATIO,
        a: 255
      };
      setPixelOn(imageData, { x, y }, colorComponents);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
const redrawCanvasAfterThrottling = _.throttle(redrawCanvas, 100);

function determineCursorPositionFrom(color, axes) {
  return _.reduce(
    axes,
    (obj, colorComponentName, axisName) => {
      return {
        ...obj,
        [axisName]: color.get(colorComponentName) * RGB_TO_SWATCH_RATIO
      };
    },
    {}
  );
}

export default function Swatch({
  colorSpacesByName,
  colorsByColorSpaceName,
  lastColorUpdated,
  axes,
  onColorComponentUpdate,
  onColorUpdate,
  onAxesUpdate
}) {
  function onChangeSlider(event) {
    const value = event.target.value;
    const rgb = _.demand(colorSpacesByName, "rgb");
    onColorComponentUpdate(
      color,
      _.demand(rgb.componentsByName, sliderAxis),
      value
    );
  }

  function onMouseDown(event) {
    if (event.button === 0) {
      event.preventDefault();
      setMouseIsDown(true);
      updateCursorPosition(event);
    }
  }

  function onMouseUp(event) {
    if (event.button === 0) {
      // NOTE: Cannot preventDefault() here because it prevents the slider from
      // keeping its value in Firefox
      setMouseIsDown(false);
    }
  }

  function onMouseMove(event) {
    event.preventDefault();
    updateCursorPosition(event);
  }

  function updateCursorPosition(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    const relativeX = event.pageX - rect.x;
    const relativeY = event.pageY - rect.y;
    setCursorPosition({ x: relativeX, y: relativeY });
    onColorUpdate(determineColorAtPosition({ x: relativeX, y: relativeY }));
  }

  function determineColorAtPosition({ x, y }) {
    const newColor = color.cloneWith({
      [axes.x]: x * SWATCH_TO_RGB_RATIO,
      [axes.y]: y * SWATCH_TO_RGB_RATIO
    });
    return rgb.convertColor(newColor); // this is a hack to normalize - FIXME
  }

  const color = lastColorUpdated.convertTo("rgb");
  const canvasRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(
    determineCursorPositionFrom(color, axes)
  );
  const [mouseIsDown, setMouseIsDown] = useState(false);

  const rgb = _.demand(colorSpacesByName, "rgb");
  const sliderAxis = _.difference(ALL_AXES, _.values(axes))[0];

  useEffect(() => {
    document.body.addEventListener("mouseup", onMouseUp);

    return () => {
      document.body.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    if (mouseIsDown) {
      document.body.addEventListener("mousemove", onMouseMove);
    } else {
      document.body.removeEventListener("mousemove", onMouseMove);
    }

    return () => {
      document.body.removeEventListener("mousemove", onMouseMove);
    };
  }, [mouseIsDown]);

  useEffect(() => {
    redrawCanvasAfterThrottling(canvasRef.current, color, axes, sliderAxis);
    setCursorPosition(determineCursorPositionFrom(color, axes));
  }, [lastColorUpdated, axes]);

  return (
    <div className={styles.swatchContainer}>
      <SwatchAxesSelectors
        allAxes={ALL_AXES}
        selectedAxes={axes}
        onSelectAxes={onAxesUpdate}
      />
      <div className={styles.swatchAndSlider}>
        <div className={styles.swatch}>
          <SwatchCursor
            cursorPosition={cursorPosition}
            colorAtPosition={determineColorAtPosition(cursorPosition)}
          />
          <canvas
            width={SWATCH_SIZE}
            height={SWATCH_SIZE}
            ref={canvasRef}
            onMouseDown={onMouseDown}
          />
        </div>
        <input
          className={styles.slider}
          type="range"
          min="0"
          max="255"
          onChange={onChangeSlider}
          value={color.get(sliderAxis)}
        />
      </div>
    </div>
  );
}
