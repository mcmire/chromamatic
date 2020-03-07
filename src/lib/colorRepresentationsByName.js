import ColorSpaceRepresentation from "./ColorSpaceRepresentation";
import HexRepresentation from "./HexRepresentation";
import StrictMap from "./StrictMap";

const COLOR_REPRESENTATION_NAMES = ["rgb", "hsl", "hsluv", "hex"];

const colorRepresentationsByName = new StrictMap({
  rgb: new ColorSpaceRepresentation({
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
    ]
  }),
  hsl: new ColorSpaceRepresentation({
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
    ]
  }),
  hsluv: new ColorSpaceRepresentation({
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
    ]
  }),
  hex: new HexRepresentation()
});

export { colorRepresentationsByName as default, COLOR_REPRESENTATION_NAMES };
