export default class ColorForm {
  constructor(colorSpace, data) {
    this.colorSpace = colorSpace;
    this.data = data;

    if (data == null) {
      throw new Error("data cannot be null");
    }
  }

  attemptToBuildColor() {
    throw new Error(
      `${this.constructor.name} must implement #attemptToBuildColor`
    );
  }

  buildColor(...args) {
    const result = this.attemptToBuildColor(...args);

    if (result.ok) {
      return result.value;
    } else {
      throw result.value;
    }
  }

  isValid() {
    return this.attemptToBuildColor().ok;
  }

  cloneWith(additionalData) {
    throw new Error(`${this.constructor.name} must implement #cloneWith`);
  }

  cloneFromColor(color) {
    throw new Error(`${this.constructor.name} must implement #cloneFromColor`);
  }

  toSerializable() {
    return this.data;
  }

  _succeedWith(value) {
    return { ok: true, value: value };
  }

  _failWith(errors) {
    return { ok: false, value: errors };
  }
}
