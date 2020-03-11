import _ from "../vendor/lodash";
import React, { useEffect, useLayoutEffect, useState, useRef } from "react";

import styles from "./Swatch.css";

const SWATCH_SIZE = 200;
const CURSOR_SIZE = 17;
const swatchToRgbRatio = 255 / SWATCH_SIZE;
const rgbToSwatchRatio = SWATCH_SIZE / 255;
const worker = new Worker("../worker.js");

export default function Swatch({
  colorSpacesByName,
  colorsByColorSpaceName,
  lastColorUpdated,
  onColorComponentUpdate,
  onColorUpdate
}) {
  /*
  function onChangeHorizontalSlider(event) {
    const value = event.target.value;
    const rgb = _.demand(colorSpacesByName, "rgb");
    onColorComponentUpdate(color, _.demand(rgb.componentsByName, "g"), value);
  }
  */

  function onChangeVerticalSlider(event) {
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
      event.preventDefault();
      setMouseIsDown(false);
    }
  }

  function onMouseMove(event) {
    event.preventDefault();
    updateCursorPosition(event);
  }

  function updateCursorPosition(event) {
    const rect = onscreenCanvasRef.current.getBoundingClientRect();
    const relativeX = event.pageX - rect.x; // - CURSOR_SIZE / 2 - 1;
    const relativeY = event.pageY - rect.y; // - CURSOR_SIZE / 2 - 1;
    const newColor = color.cloneWith({
      g: relativeX * swatchToRgbRatio,
      b: relativeY * swatchToRgbRatio
    });
    const rgb = _.demand(colorSpacesByName, "rgb");
    const newNormalizedColor = rgb.convertColor(newColor); // FIXME
    setCursorPosition({ x: relativeX, y: relativeY });
    onColorUpdate(newNormalizedColor);
  }

  const color = lastColorUpdated.convertTo("rgb");
  const onscreenCanvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({
    x: color.get("g") * rgbToSwatchRatio,
    y: color.get("b") * rgbToSwatchRatio
  });
  const [mouseIsDown, setMouseIsDown] = useState(false);

  useEffect(() => {
    offscreenCanvasRef.current = onscreenCanvasRef.current.transferControlToOffscreen();
    worker.postMessage(
      {
        message: "start",
        canvas: offscreenCanvasRef.current,
        canvasSize: SWATCH_SIZE
      },
      [offscreenCanvasRef.current]
    );
    document.body.addEventListener("mouseup", onMouseUp);

    return () => {
      document.body.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    worker.postMessage({
      message: "draw",
      color: lastColorUpdated.convertTo("rgb").toPlainObject()
    });
    setCursorPosition({
      x: color.get("g") * rgbToSwatchRatio,
      y: color.get("b") * rgbToSwatchRatio
    });
  }, [lastColorUpdated]);

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

  return (
    <div className={styles.swatch}>
      <canvas
        width={SWATCH_SIZE}
        height={SWATCH_SIZE}
        ref={onscreenCanvasRef}
        onMouseDown={onMouseDown}
      />
      {/*
      <input
        className={`${styles.slider} ${styles.horizontalSlider}`}
        type="range"
        min="0"
        max="255"
        onChange={onChangeHorizontalSlider}
        value={color.get("g")}
      />
      */}
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
