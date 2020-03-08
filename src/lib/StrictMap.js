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

  withPairSet(key, value) {
    return cloneWith({ [key]: value });
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

  without(key) {
    return this.cloneWith(_.omit(this.toPlainObject(), key));
  }

  toPlainObject() {
    return _.fromPairs(_.toPairs(this));
  }
}
