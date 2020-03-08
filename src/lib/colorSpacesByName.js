import ColorSpace from "./ColorSpace";

export const COLOR_SPACE_NAMES = ["rgb", "hsl", "hsluv"];

const colorSpacesByName = {
  rgb: new ColorSpace({
    name: "rgb",
    components: [
      {
        name: "r",
        step: 1,
        min: 0,
        max: 255,
        precision: 0
      },
      {
        name: "g",
        step: 1,
        min: 0,
        max: 255,
        precision: 0
      },
      {
        name: "b",
        step: 1,
        min: 0,
        max: 255,
        precision: 0
      }
    ],
    representations: ["tuple", "cssString", "hex"]
  }),
  hsl: new ColorSpace({
    name: "hsl",
    components: [
      {
        name: "h",
        step: 1,
        min: 0,
        max: 360,
        suffix: "°",
        precision: 1
      },
      {
        name: "s",
        step: 1,
        min: 0,
        max: 100,
        suffix: "%",
        cssSuffix: "%",
        precision: 1
      },
      {
        name: "l",
        step: 1,
        min: 0,
        max: 100,
        suffix: "%",
        cssSuffix: "%",
        precision: 1
      }
    ],
    representations: ["tuple", "cssString"]
  }),
  hsluv: new ColorSpace({
    name: "hsluv",
    components: [
      {
        name: "h",
        step: 1,
        min: 0,
        max: 360,
        suffix: "°",
        precision: 1
      },
      {
        name: "s",
        step: 1,
        min: 0,
        max: 100,
        suffix: "%",
        cssSuffix: "%",
        precision: 1
      },
      {
        name: "l",
        step: 1,
        min: 0,
        max: 100,
        suffix: "%",
        cssSuffix: "%",
        precision: 1
      }
    ],
    representations: ["tuple", "cssString"]
  })
};

export default colorSpacesByName;
