import _ from "../vendor/lodash";
import React, { useEffect, useState, useRef } from "react";
import colorSpaceRegistry from "color-space";

import benchmark from "../lib/benchmark";
import { demand } from "../lib/utils";
import SwatchAxesSelectors from "./SwatchAxesSelectors";
import SwatchCursor from "./SwatchCursor";

import styles from "./Swatch.css";

const SWATCH_SIZE = 200;
const RGB_TO_SWATCH_RATIO = SWATCH_SIZE / 255;

function buildScalesByAxis(axes, componentsByName) {
  const xComponent = demand(componentsByName, axes.x);
  const yComponent = demand(componentsByName, axes.y);
  return {
    x: {
      swatchToComponent: xComponent.max / SWATCH_SIZE,
      componentToSwatch: SWATCH_SIZE / xComponent.max
    },
    y: {
      swatchToComponent: yComponent.max / SWATCH_SIZE,
      componentToSwatch: SWATCH_SIZE / yComponent.max
    }
  };
}

function setPixelOn(imageData, { x, y }, { r, g, b, a }) {
  const index = (x + y * imageData.width) * 4;
  imageData.data[index + 0] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
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
    onColorComponentUpdate(
      lastColorUpdated,
      demand(selectedColorSpace.componentsByName, sliderAxis),
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
    onColorUpdate(mapCursorPositionToColor({ x: relativeX, y: relativeY }));
  }

  function mapColorToCursorPosition(color) {
    const axisNames = Object.keys(axes);
    return _.reduce(
      axes,
      (obj, colorComponentName, axisName) => {
        const value =
          color.get(colorComponentName) *
          scalesByAxis[axisName].componentToSwatch;
        return {
          ...obj,
          [axisName]: axisName === axisNames[1] ? SWATCH_SIZE - value : value
        };
      },
      {}
    );
  }

  function mapCursorPositionToColor(
    { x, y },
    { finalColorSpace = lastColorUpdated.colorSpace, validate = true } = {}
  ) {
    const newColor = lastColorUpdated.cloneWith(
      {
        [axes.x]: x * scalesByAxis.x.swatchToComponent,
        [axes.y]: (SWATCH_SIZE - y) * scalesByAxis.y.swatchToComponent
      },
      { validate }
    );
    return finalColorSpace.convertColor(newColor);
  }

  function redrawCanvas() {
    benchmark.measuring("buildColor", "convertColor", "setPixelOn", () => {
      if (
        (selectedColorSpace.name === "hsl" ||
          selectedColorSpace.name === "hsluv") &&
        sliderAxis === "h"
      ) {
        redrawCanvasAsCircle();
      } else {
        redrawCanvasAsSquare();
      }
    });
  }
  const redrawCanvasAfterThrottling = _.throttle(redrawCanvas, 100);

  function redrawCanvasAsSquare() {
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.createImageData(SWATCH_SIZE, SWATCH_SIZE);
    const rgb = demand(colorSpacesByName, "rgb");

    for (let y = 0; y < SWATCH_SIZE; y++) {
      for (let x = 0; x < SWATCH_SIZE; x++) {
        const newColor = benchmark.time("buildColor", () => {
          return mapCursorPositionToColor(
            { x, y },
            {
              finalColorSpace: demand(colorSpacesByName, "rgb"),
              validate: false
            }
          );
        });

        benchmark.time("setPixelOn", () => {
          setPixelOn(
            imageData,
            { x, y },
            { ...newColor.toPlainObject(), a: 255 }
          );
        });
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function redrawCanvasAsCircle() {
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.createImageData(SWATCH_SIZE, SWATCH_SIZE);
    const hComponent = demand(
      lastColorUpdated.colorSpace.componentsByName,
      "h"
    );
    const sComponent = demand(
      lastColorUpdated.colorSpace.componentsByName,
      "s"
    );
    const rgb = demand(colorSpacesByName, "rgb");

    for (let h = hComponent.min; h <= hComponent.max; h++) {
      for (let s = sComponent.min; s <= hComponent.max; s++) {
        const x = Math.round(s * Math.sin(h));
        const y = Math.round(s * Math.cos(h));

        const newColor = benchmark.time("buildColor", () => {
          return mapCursorPositionToColor(
            { x, y },
            {
              finalColorSpace: rgb,
              validate: false
            }
          );
        });

        benchmark.time("setPixelOn", () => {
          setPixelOn(
            imageData,
            { x, y },
            { ...newColor.toPlainObject(), a: 255 }
          );
        });
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const selectedColorSpace = lastColorUpdated.colorSpace;
  const scalesByAxis = buildScalesByAxis(
    axes,
    selectedColorSpace.componentsByName
  );
  const canvasRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(
    mapColorToCursorPosition(lastColorUpdated, axes, scalesByAxis)
  );
  const [mouseIsDown, setMouseIsDown] = useState(false);

  const sliderAxis = _.difference(
    selectedColorSpace.componentNames,
    Object.values(axes)
  )[0];
  const axesComponents = _.pick(lastColorUpdated.toPlainObject(), [sliderAxis]);

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
    setCursorPosition(mapColorToCursorPosition(lastColorUpdated));
  }, [lastColorUpdated, axes]);

  useEffect(redrawCanvasAfterThrottling, [
    JSON.stringify(axesComponents),
    axes,
    sliderAxis
  ]);

  return (
    <div className={styles.swatchContainer}>
      <SwatchAxesSelectors
        allAxes={selectedColorSpace.componentNames}
        selectedAxes={axes}
        onSelectAxes={onAxesUpdate}
      />
      <div className={styles.swatchAndSlider}>
        <div className={styles.swatch}>
          <SwatchCursor
            cursorPosition={cursorPosition}
            colorAtPosition={mapCursorPositionToColor(cursorPosition)}
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
          min={demand(selectedColorSpace.componentsByName, sliderAxis).min}
          max={demand(selectedColorSpace.componentsByName, sliderAxis).max}
          onChange={onChangeSlider}
          value={lastColorUpdated.get(sliderAxis)}
        />
      </div>
    </div>
  );
}
