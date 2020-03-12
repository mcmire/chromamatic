import _ from "../vendor/lodash";
import React, { useEffect, useState, useRef } from "react";

import styles from "./Swatch.css";
import SwatchCursor from "./SwatchCursor";

const SWATCH_SIZE = 200;
const SWATCH_TO_RGB_RATIO = 255 / SWATCH_SIZE;
const RGB_TO_SWATCH_RATIO = SWATCH_SIZE / 255;

function setPixelOn(imageData, { x, y }, { r, g, b, a }) {
  const index = (x + y * imageData.width) * 4;
  imageData.data[index + 0] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
}

function redrawCanvas(canvas, color) {
  const SWATCH_TO_RGB_RATIO = 255 / SWATCH_SIZE;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(SWATCH_SIZE, SWATCH_SIZE);
  for (let y = 0; y < SWATCH_SIZE; y++) {
    for (let x = 0; x < SWATCH_SIZE; x++) {
      const g = x * SWATCH_TO_RGB_RATIO;
      const b = y * SWATCH_TO_RGB_RATIO;
      setPixelOn(
        imageData,
        { x, y },
        { r: color.get("r"), g: g, b: b, a: 255 }
      );
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
const redrawCanvasAfterThrottling = _.throttle(redrawCanvas, 100);

let numOnChangeVerticalSliders = 0;

export default function Swatch({
  colorSpacesByName,
  colorsByColorSpaceName,
  lastColorUpdated,
  onColorComponentUpdate,
  onColorUpdate
}) {
  function onChangeVerticalSlider(event) {
    /*
    console.log(
      "onChangeVerticalSlider",
      numOnChangeVerticalSliders,
      color.toPlainObject()
    );
    */
    numOnChangeVerticalSliders++;
    const value = event.target.value;
    const rgb = _.demand(colorSpacesByName, "rgb");
    onColorComponentUpdate(color, _.demand(rgb.componentsByName, "r"), value);
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
      // NOTE: Cannot preventDefault here because it prevent the slider from
      // keeping its value in Firefox
      //event.preventDefault();
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
    const colorAtPosition = getColorAtPosition({ x: relativeX, y: relativeY });
    setCursorPosition({ x: relativeX, y: relativeY });
    onColorUpdate(colorAtPosition);
  }

  function getColorAtPosition({ x, y }) {
    const newColor = color.cloneWith({
      g: x * SWATCH_TO_RGB_RATIO,
      b: y * SWATCH_TO_RGB_RATIO
    });
    return rgb.convertColor(newColor); // this is a hack - FIXME
  }

  const rgb = _.demand(colorSpacesByName, "rgb");
  const color = lastColorUpdated.convertTo("rgb");
  const canvasRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({
    x: color.get("g") * RGB_TO_SWATCH_RATIO,
    y: color.get("b") * RGB_TO_SWATCH_RATIO
  });
  const [mouseIsDown, setMouseIsDown] = useState(false);

  useEffect(() => {
    //console.log("adding mouse up");
    document.body.addEventListener("mouseup", onMouseUp);

    return () => {
      //console.log("removing mouse up");
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
    redrawCanvasAfterThrottling(canvasRef.current, color);

    setCursorPosition({
      x: color.get("g") * RGB_TO_SWATCH_RATIO,
      y: color.get("b") * RGB_TO_SWATCH_RATIO
    });
  }, [lastColorUpdated]);

  return (
    <div className={styles.swatch}>
      <canvas
        width={SWATCH_SIZE}
        height={SWATCH_SIZE}
        ref={canvasRef}
        onMouseDown={onMouseDown}
      />
      <input
        className={`${styles.slider} ${styles.verticalSlider}`}
        type="range"
        min="0"
        max="255"
        onChange={onChangeVerticalSlider}
        value={color.get("r")}
      />
      <SwatchCursor
        cursorPosition={cursorPosition}
        colorAtPosition={getColorAtPosition(cursorPosition)}
      />
    </div>
  );
}
