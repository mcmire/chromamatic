import ColorTupleForm from "./ColorTupleForm";
import ColorStringForm from "./ColorStringForm";

export default class ColorRepresentation {
  constructor(name) {
    this.name = name;
  }

  buildFormFrom(color) {
    if (this.name === "tuple") {
      return new ColorTupleForm(color.colorSpace, color.toPlainObject());
    } else {
      const hex = this.name === "hex";
      return new ColorStringForm(
        color.colorSpace,
        this,
        color.toFormattedString({ hex })
      );
    }
  }
}
