import { parseColor } from "./colorUtils";
import ColorForm from "./ColorForm";
import { InvalidColorStringError } from "./errors";

const HSLUV_REGEXP = /^hsluv\((\d(?:\.\d+)?)+, (\d+(?:\.\d+)?)%, (\d+(?:\.\d+)?)%\)$/;

export default class ColorStringForm extends ColorForm {
  constructor(colorSpace, representation, data) {
    super(colorSpace, data);
    this.representation = representation;
  }

  attemptToBuildColor({ normalize = false } = {}) {
    if (this.colorSpace.name === "hsluv") {
      const match = HSLUV_REGEXP.exec(this.data);

      if (match) {
        return this._succeedWith(
          this.colorSpace.buildColor(match.slice(1), { normalize })
        );
      } else {
        const error = InvalidColorStringError.create(
          this.colorSpace,
          this.data
        );
        return this._failWith(error);
      }
    } else {
      try {
        return this._succeedWith(
          this.colorSpace.buildColor(parseColor(this.colorSpace, this.data), {
            normalize
          })
        );
      } catch (error) {
        if (error instanceof InvalidColorStringError) {
          return this._failWith(error);
        } else {
          throw error;
        }
      }
    }
  }

  cloneWith(data) {
    return new this.constructor(this.colorSpace, this.representation, data);
  }

  cloneFromColor(color) {
    const data = color.toFormattedString({
      hex: this.representation.name === "hex"
    });
    return this.cloneWith(data);
  }
}
