import React, { useEffect, useLayoutEffect, useRef } from "react";

import styles from "./Swatch.css";

const SIZE = 200;
const worker = new Worker("../worker.js");

export default function Swatch({
  colorsByRepresentationName,
  lastColorUpdated
}) {
  const onscreenCanvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  useEffect(() => {
    offscreenCanvasRef.current = onscreenCanvasRef.current.transferControlToOffscreen();
    worker.postMessage(
      {
        message: "start",
        canvas: offscreenCanvasRef.current,
        canvasSize: SIZE
      },
      [offscreenCanvasRef.current]
    );
  }, []);

  useEffect(() => {
    worker.postMessage({
      message: "draw",
      color: lastColorUpdated.convertTo("rgb").toPlainObject()
    });
  }, [lastColorUpdated]);

  return (
    <canvas
      width={SIZE}
      height={SIZE}
      ref={onscreenCanvasRef}
      className={styles.swatch}
    />
  );
}
