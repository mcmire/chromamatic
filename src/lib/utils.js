import _ from "../vendor/lodash";

export function roundNumber(number, precision = 0) {
  if (precision === 0) {
    return Math.round(number);
  } else {
    const multiplier = Math.pow(10, precision);
    return Math.round(number * multiplier) / multiplier;
  }
}
