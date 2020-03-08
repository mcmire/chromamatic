import lodash from "lodash";

lodash.mixin({
  demand: function(object, path) {
    if (!lodash.isObject(object)) {
      throw new Error(`Not an object: ${JSON.stringify(object)}`);
    }

    if (lodash.has(object, path)) {
      return lodash.get(object, path);
    } else {
      throw new Error(
        `No such key path in object: ${path}; keys: ${JSON.stringify(
          Object.keys(object)
        )}`
      );
    }
  }
});

export default lodash;
