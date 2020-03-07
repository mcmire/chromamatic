import colorParse from "color-parse";

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

export function parseColor(input) {
  const parsedColor = colorParse(input);

  if (parsedColor.space == null) {
    throw new Error(`Couldn't parse color: ${input}`);
  } else {
    return parsedColor.values;
  }
}
