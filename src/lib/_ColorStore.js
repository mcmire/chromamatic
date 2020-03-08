/*
export default class ColorStore {
  constructor(colorSpaceStoresByName) {
    this.colorSpaceStoresByName = colorSpaceStoresByName;
  }

  find(colorSpace, representation) {
    return this.colorSpaceStoresByName
      .fetch(colorSpace.name)
      .fetch(representation.name);
  }

  withUpdatedColor(colorSpace, representation, color) {
    const colorsByRepresentationName = this.colorSpaceStoresByName.fetch(
      colorSpace.name
    );
    return new this.constructor(
      this.colorSpaceStoresByName.withPairSet(
        colorSpace.name,
        colorsByRepresentationName.withPairSet(representation.name, color)
      )
    );
  }
}

ColorStore.fromColorSpaceNames = function(colorSpaceNames) {
  const colorSpaceStoresByName = colorSpaceNames.reduce(
    (map, colorSpaceName) => {
      return map.withPairSet(colorSpaceName, new StrictMap());
    },
    new StrictMap()
  );
  return new this(colorSpaceStoresByName);
};
*/
