import _ from "../vendor/lodash";

export function roundNumber(number, precision = 0) {
  if (precision === 0) {
    return Math.round(number);
  } else {
    const multiplier = Math.pow(10, precision);
    return Math.round(number * multiplier) / multiplier;
  }
}

export function coerceToNumber(value) {
  if (typeof value === "number") {
    return value;
  } else {
    return parseFloat(value, 10);
  }
}

export function zip(array1, array2) {
  const newArray = [];

  for (let i = 0; i < array1.length; i++) {
    newArray.push([array1[i], array2[i]]);
  }

  if (array2.length > array1.length) {
    for (let i = array1.length; i < array2.length; i++) {
      newArray.push([null, array2[i]]);
    }
  }

  return newArray;
}

export function demand(object, key) {
  if (key in object) {
    return object[key];
  } else {
    throw new Error(
      `No such key in object: ${key}; keys: ${JSON.stringify(
        Object.keys(object)
      )}`
    );
  }
}

export function toObject(pairs) {
  const newObject = {};

  for (const [key, value] of pairs) {
    newObject[key] = value;
  }

  return newObject;
}

export function isPlainObject(value) {
  return typeof value === "object" && value.constructor.name === "Object";
}
