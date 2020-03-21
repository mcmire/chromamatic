import colorParse from "color-parse";
import colorStringify from "color-stringify";
import { InvalidColorStringError } from "./errors";

// https://github.com/smockle/contrast/blob/master/src/lib/eightbit.ts
export function linearizeRGBComponent(n) {
  const unit = n / 255;
  return unit <= 0.03928 ? unit / 12.92 : Math.pow((unit + 0.055) / 1.055, 2.4);
}

// https://github.com/jonathantneal/postcss-wcag-contrast/blob/master/index.js
// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
export function calculateRelativeLuminance(r, g, b) {
  const R = linearizeRGBComponent(r);
  const G = linearizeRGBComponent(g);
  const B = linearizeRGBComponent(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function parseColor(colorSpace, input) {
  if (
    /^#/.test(input) &&
    !/^(?:#[A-Fa-f0-9]{3}|#[A-Fa-f0-9]{6})$/.test(input)
  ) {
    throw InvalidColorStringError.create(colorSpace, input);
  } else {
    const parsedColor = colorParse(input);

    if (parsedColor.space == null) {
      throw InvalidColorStringError.create(colorSpace, input);
    } else {
      return parsedColor.values;
    }
  }
}

export function stringifyColor(input, type, { normalize = false } = {}) {
  try {
    const stringifiedColor = colorStringify(input, type);

    if (stringifiedColor != null) {
      if (
        type === "hex" &&
        /^#[A-Fa-f0-9]{3}$/.test(stringifiedColor) &&
        normalize
      ) {
        const digits = stringifiedColor.slice(1);
        return (
          "#" +
          digits[0] +
          digits[0] +
          digits[1] +
          digits[1] +
          digits[2] +
          digits[2]
        );
      } else {
        return stringifiedColor;
      }
    } else {
      throw new Error(
        `Couldn't stringify color as ${type}: ${JSON.stringify(input)}. (${
          e.message
        })`
      );
    }
  } catch (e) {
    throw new Error(
      `Couldn't stringify color as ${type}: ${JSON.stringify(input)}. (${
        e.message
      })`
    );
  }
}
