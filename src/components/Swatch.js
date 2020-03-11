import _ from "../vendor/lodash";
import React, { useEffect, useLayoutEffect, useState, useRef } from "react";

import styles from "./Swatch.css";

const SWATCH_SIZE = 200;
const CURSOR_SIZE = 17;
const swatchToRgbRatio = 255 / SWATCH_SIZE;
const rgbToSwatchRatio = SWATCH_SIZE / 255;

function setPixelOn(imageData, { x, y }, { r, g, b, a }) {
  const index = (x + y * imageData.width) * 4;
  imageData.data[index + 0] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
}

function redrawCanvas(canvas, color) {
  const swatchToRgbRatio = 255 / SWATCH_SIZE;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(SWATCH_SIZE, SWATCH_SIZE);
  for (let y = 0; y < SWATCH_SIZE; y++) {
    for (let x = 0; x < SWATCH_SIZE; x++) {
      const g = x * swatchToRgbRatio;
      const b = y * swatchToRgbRatio;
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
    const newColor = color.cloneWith({
      g: relativeX * swatchToRgbRatio,
      b: relativeY * swatchToRgbRatio
    });
    const rgb = _.demand(colorSpacesByName, "rgb");
    const newNormalizedColor = rgb.convertColor(newColor); // this is a hack - FIXME
    setCursorPosition({ x: relativeX, y: relativeY });
    onColorUpdate(newNormalizedColor);
  }

  const color = lastColorUpdated.convertTo("rgb");
  const canvasRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({
    x: color.get("g") * rgbToSwatchRatio,
    y: color.get("b") * rgbToSwatchRatio
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
      x: color.get("g") * rgbToSwatchRatio,
      y: color.get("b") * rgbToSwatchRatio
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
      <svg
        className={styles.cursor}
        width={CURSOR_SIZE}
        height={CURSOR_SIZE}
        viewBox={`0 0 ${CURSOR_SIZE} ${CURSOR_SIZE}`}
        style={{
          left: `${cursorPosition.x - CURSOR_SIZE / 2 - 1}px`,
          top: `${cursorPosition.y - CURSOR_SIZE / 2}px`,
          color: "red"
        }}
      >
        <circle
          stroke="rgba(255, 255, 255, 1)"
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
          fill="rgba(255, 255, 255, 1)"
        />
      </svg>
    </div>
  );
}
