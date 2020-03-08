export class InvalidColorError extends Error {}

export class InvalidColorStringError extends Error {}

InvalidColorStringError.create = function(colorSpace, input) {
  return new this(
    `Could not parse color string as ${colorSpace.name}: ${input}`
  );
};
