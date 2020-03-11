function setPixelOn(imageData, { x, y }, { r, g, b, a }) {
  const index = (x + y * imageData.width) * 4;
  imageData.data[index + 0] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
}

self.hasStarted = false;

self.onmessage = event => {
  switch (event.data.message) {
    case "start":
      self.hasStarted = true;
      self.canvas = event.data.canvas;
      self.canvasSize = event.data.canvasSize;
      break;
    case "draw":
      const color = event.data.color;
      const swatchToRgbRatio = 255 / self.canvasSize;
      const ctx = self.canvas.getContext("2d");
      const imageData = ctx.createImageData(self.canvasSize, self.canvasSize);
      for (let y = 0; y < self.canvasSize; y++) {
        for (let x = 0; x < self.canvasSize; x++) {
          const g = x * swatchToRgbRatio;
          const b = y * swatchToRgbRatio;
          setPixelOn(imageData, { x, y }, { r: color.r, g: g, b: b, a: 255 });
        }
      }
      ctx.putImageData(imageData, 0, 0);
      break;
    default:
      throw new Error(`Unknown message ${event.data.message}!`);
      break;
  }
};
