import _ from "../vendor/lodash";
import React, { useEffect, useState, useRef } from "react";
import colorSpaceRegistry from "color-space";

import benchmark from "../lib/benchmark";
import SwatchAxesSelectors from "./SwatchAxesSelectors";
import SwatchCursor from "./SwatchCursor";

import styles from "./Swatch.css";

const SWATCH_SIZE = 200;
const RGB_TO_SWATCH_RATIO = SWATCH_SIZE / 255;

function buildScalesByAxis(axes, componentsByName) {
  const xComponent = _.demand(componentsByName, axes.x);
  const yComponent = _.demand(componentsByName, axes.y);
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

function redrawCanvas(canvas, color, axes, sliderAxis, scalesByAxis) {
  benchmark.measuring("buildColor", "convertColor", "setPixelOn", () => {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(SWATCH_SIZE, SWATCH_SIZE);
    const rgbConverter = colorSpaceRegistry[color.colorSpace.name]["rgb"];

    for (let y = 0; y < SWATCH_SIZE; y++) {
      for (let x = 0; x < SWATCH_SIZE; x++) {
        // ~3.3 ms (with conversion ~1.9 ms)
        const newColor = benchmark.time("buildColor", () => {
          return color
            .cloneWith(
              {
                [axes.x]: x * scalesByAxis.x.swatchToComponent,
                [axes.y]: y * scalesByAxis.y.swatchToComponent
              },
              { validate: false }
            )
            .convertTo("rgb");
        });

        // ~0.4 ms
        benchmark.time("setPixelOn", () => {
          setPixelOn(
            imageData,
            { x, y },
            { ...newColor.toPlainObject(), a: 255 }
          );
        });

        /*
        const newColor = benchmark.time("buildColor", () => {
          if (color.colorSpace.name === "rgb") {
            return [color.get("r"), color.get("g"), color.get("b")];
          } else {
            return rgbConverter([
              color.get(sliderAxis),
              x * scalesByAxis.x.swatchToComponent,
              y * scalesByAxis.y.swatchToComponent
            ]);
          }
        });

        benchmark.time("setPixelOn", () => {
          setPixelOn(
            imageData,
            { x, y },
            {
              [sliderAxis]: newColor[0],
              [axes.x]: newColor[1],
              [axes.y]: newColor[2],
              a: 255
            }
          );
        });
        */
      }
    }

    ctx.putImageData(imageData, 0, 0);
  });
}
const redrawCanvasAfterThrottling = _.throttle(redrawCanvas, 100);

function determineCursorPositionFrom(color, axes, scalesByAxis) {
  return _.reduce(
    axes,
    (obj, colorComponentName, axisName) => {
      return {
        ...obj,
        [axisName]:
          color.get(colorComponentName) *
          scalesByAxis[axisName].componentToSwatch
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
    onColorComponentUpdate(
      lastColorUpdated,
      _.demand(selectedColorSpace.componentsByName, sliderAxis),
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
    const newColor = lastColorUpdated.cloneWith({
      [axes.x]: x * scalesByAxis.x.swatchToComponent,
      [axes.y]: y * scalesByAxis.y.swatchToComponent
    });
    return selectedColorSpace.convertColor(newColor); // this is a hack to normalize - FIXME
  }

  const selectedColorSpace = lastColorUpdated.colorSpace;
  const scalesByAxis = buildScalesByAxis(
    axes,
    selectedColorSpace.componentsByName
  );
  const canvasRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(
    determineCursorPositionFrom(lastColorUpdated, axes, scalesByAxis)
  );
  const [mouseIsDown, setMouseIsDown] = useState(false);

  const sliderAxis = _.difference(
    selectedColorSpace.componentNames,
    _.values(axes)
  )[0];

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
    redrawCanvas(
      canvasRef.current,
      lastColorUpdated,
      axes,
      sliderAxis,
      scalesByAxis
    );
    setCursorPosition(
      determineCursorPositionFrom(lastColorUpdated, axes, scalesByAxis)
    );
  }, [lastColorUpdated, axes]);

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
          min={_.demand(selectedColorSpace.componentsByName, sliderAxis).min}
          max={_.demand(selectedColorSpace.componentsByName, sliderAxis).max}
          onChange={onChangeSlider}
          value={lastColorUpdated.get(sliderAxis)}
        />
      </div>
    </div>
  );
}
