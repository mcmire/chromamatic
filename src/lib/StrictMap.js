import _ from "../vendor/lodash";

export default class StrictMap extends Map {
  constructor(content = {}) {
    super(_.toPairs(content));
  }

  clone() {
    return this.reduce((clone, value, key) => {
      return clone.set(key, value);
    }, new this.constructor());
  }

  cloneWith(object) {
    return _.reduce(
      object,
      (clone, value, key) => {
        return clone.set(key, value);
      },
      this.clone()
    );
  }

  fetch(key) {
    if (this.has(key)) {
      return this.get(key);
    } else {
      throw new Error(
        `${this.constructor.name} does not have the key '${key}'`
      );
    }
  }

  reduce(fn, memo = null) {
    return _.reduce(this.toPlainObject(), fn, memo);
  }

  every(fn) {
    return _.every(this.toPlainObject(), fn);
  }

  toPlainObject() {
    return _.fromPairs(_.toPairs(this));
  }
}
