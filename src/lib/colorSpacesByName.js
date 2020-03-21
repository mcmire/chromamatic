import colorSpaceRegistry from "color-space";
import ColorSpace from "./ColorSpace";

export const COLOR_SPACE_NAMES = ["rgb", "hsl", "hsluv", "lchuv", "luv", "xyz"];

const colorSpacesByName = {
  rgb: new ColorSpace({
    name: "rgb",
    components: [
      {
        name: "r",
        step: 1,
        min: colorSpaceRegistry.rgb.min[0],
        max: colorSpaceRegistry.rgb.max[0],
        precision: 0
      },
      {
        name: "g",
        step: 1,
        min: colorSpaceRegistry.rgb.min[1],
        max: colorSpaceRegistry.rgb.max[1],
        precision: 0
      },
      {
        name: "b",
        step: 1,
        min: colorSpaceRegistry.rgb.min[2],
        max: colorSpaceRegistry.rgb.max[2],
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
        min: colorSpaceRegistry.hsl.min[0],
        max: colorSpaceRegistry.hsl.max[0],
        suffix: "°",
        precision: 1
      },
      {
        name: "s",
        step: 1,
        min: colorSpaceRegistry.hsl.min[1],
        max: colorSpaceRegistry.hsl.max[1],
        suffix: "%",
        cssSuffix: "%",
        precision: 1
      },
      {
        name: "l",
        step: 1,
        min: colorSpaceRegistry.hsl.min[2],
        max: colorSpaceRegistry.hsl.max[2],
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
        min: colorSpaceRegistry.hsluv.min[0],
        max: colorSpaceRegistry.hsluv.max[0],
        suffix: "°",
        precision: 1
      },
      {
        name: "s",
        step: 1,
        min: colorSpaceRegistry.hsluv.min[1],
        max: colorSpaceRegistry.hsluv.max[1],
        suffix: "%",
        cssSuffix: "%",
        precision: 1
      },
      {
        name: "l",
        step: 1,
        min: colorSpaceRegistry.hsluv.min[2],
        max: colorSpaceRegistry.hsluv.max[2],
        suffix: "%",
        cssSuffix: "%",
        precision: 1
      }
    ],
    representations: ["tuple", "cssString"]
  }),
  lchuv: new ColorSpace({
    name: "lchuv",
    components: [
      {
        name: "l",
        step: 1,
        min: colorSpaceRegistry.lchuv.min[0],
        max: colorSpaceRegistry.lchuv.max[0],
        precision: 1
      },
      {
        name: "c",
        step: 1,
        min: colorSpaceRegistry.lchuv.min[1],
        max: colorSpaceRegistry.lchuv.max[1],
        precision: 1
      },
      {
        name: "h",
        step: 1,
        min: colorSpaceRegistry.lchuv.min[2],
        max: colorSpaceRegistry.lchuv.max[2],
        suffix: "°",
        precision: 1
      }
    ],
    representations: ["tuple"]
  }),
  luv: new ColorSpace({
    name: "luv",
    components: [
      {
        name: "l",
        step: 1,
        min: colorSpaceRegistry.luv.min[0],
        max: colorSpaceRegistry.luv.max[0],
        precision: 1
      },
      {
        name: "u",
        step: 1,
        min: colorSpaceRegistry.luv.min[1],
        max: colorSpaceRegistry.luv.max[1],
        precision: 1
      },
      {
        name: "v",
        step: 1,
        min: colorSpaceRegistry.luv.min[2],
        max: colorSpaceRegistry.luv.max[2],
        precision: 1
      }
    ],
    representations: ["tuple"]
  }),
  xyz: new ColorSpace({
    name: "xyz",
    components: [
      {
        name: "x",
        step: 1,
        min: colorSpaceRegistry.xyz.min[0],
        max: colorSpaceRegistry.xyz.max[0],
        precision: 1
      },
      {
        name: "y",
        step: 1,
        min: colorSpaceRegistry.xyz.min[1],
        max: colorSpaceRegistry.xyz.max[1],
        precision: 1
      },
      {
        name: "z",
        step: 1,
        min: colorSpaceRegistry.xyz.min[2],
        max: colorSpaceRegistry.xyz.max[2],
        precision: 1
      }
    ],
    representations: ["tuple"]
  })
};

export default colorSpacesByName;
