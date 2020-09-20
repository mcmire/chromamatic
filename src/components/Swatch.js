import _ from "../vendor/lodash";
import React, { useEffect, useState, useRef } from "react";
import colorSpaceRegistry from "color-space";

import benchmark from "../lib/benchmark";
import { demand } from "../lib/utils";
import SwatchAxesSelectors from "./SwatchAxesSelectors";
import SwatchCursor from "./SwatchCursor";
import ColorTupleForm from "../lib/ColorTupleForm";

import styles from "./Swatch.css";

const SWATCH_SIZE = 200;
const RGB_TO_SWATCH_RATIO = SWATCH_SIZE / 255;
const R = SWATCH_SIZE / 2;
const TWO_PI = 2 * Math.PI;

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

function determineGraphType(colorSpace, axes) {
  return axes.x === "h" || axes.y === "h" ? "polar" : "cartesian";
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
    if (graphType === "cartesian") {
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
    } else if (graphType === "polar") {
      const otherComponentName = axes.x === "h" ? axes.y : axes.x;
      const otherComponent = demand(
        lastColorUpdated.colorSpace.componentsByName,
        otherComponentName
      );

      const otherComponentRange = otherComponent.max - otherComponent.min;
      const rgb = color.convertTo("rgb");
      const h = color.get("h");
      const o = color.get(otherComponent.name);
      const theta = h * (TWO_PI / 360);
      const r = o * (R / otherComponentRange);
      const x = r * Math.cos(theta) + R;
      const y = SWATCH_SIZE - (r * Math.sin(theta) + R);
      //return axes.x === "h" ? { x: x, y: y } : { x: y, y: x };
      return { x: x, y: y };
    } else {
      throw new Error(`Unknown graph type ${graphType}`);
    }
  }

  function mapCursorPositionToColor(
    { x, y },
    { finalColorSpace = lastColorUpdated.colorSpace, validate = true } = {}
  ) {
    if (graphType === "cartesian") {
      return finalColorSpace.convertColor(
        lastColorUpdated.cloneWith(
          {
            [axes.x]: x * scalesByAxis.x.swatchToComponent,
            [axes.y]: (SWATCH_SIZE - y) * scalesByAxis.y.swatchToComponent
          },
          { validate }
        )
      );
    } else if (graphType === "polar") {
      const otherComponentName = axes.x === "h" ? axes.y : axes.x;
      const otherComponent = demand(
        lastColorUpdated.colorSpace.componentsByName,
        otherComponentName
      );
      const otherComponentRange = otherComponent.max - otherComponent.min;

      // Map (100, 100) as the new (0, 0), inverting Y
      const adjX = x - R;
      const adjY = SWATCH_SIZE - y - R;

      const r = Math.sqrt(Math.pow(adjX, 2) + Math.pow(adjY, 2));
      const theta =
        adjY >= 0 ? Math.acos(adjX / r) : TWO_PI - Math.acos(adjX / r);

      const h = theta * (360 / TWO_PI);
      const o = r * (otherComponentRange / R);

      const colorAttributes = {
        h: h,
        [otherComponentName]: o,
        [sliderAxis]: lastColorUpdated.get(sliderAxis)
      };
      const isWithinComponentRange = _.every(colorAttributes, (value, name) => {
        const component = demand(
          lastColorUpdated.colorSpace.componentsByName,
          name
        );
        return component.isWithinRange(value);
      });

      return isWithinComponentRange
        ? benchmark.time("buildColor", () => {
            return finalColorSpace.convertColor(
              lastColorUpdated.cloneWith({ h: h, [axes.y]: o }, { validate })
            );
          })
        : finalColorSpace.white();
    } else {
      throw new Error(`Unknown graph type ${graphType}`);
    }
  }

  function redrawCanvas() {
    benchmark.measuring("buildColor", "convertColor", "setPixelOn", () => {
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
    });
  }
  const redrawCanvasAfterThrottling = _.throttle(redrawCanvas, 100);

  const selectedColorSpace = lastColorUpdated.colorSpace;
  const graphType = determineGraphType(selectedColorSpace, axes);
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
