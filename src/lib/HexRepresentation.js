import HexColor from "./HexColor";
import Representation from "./Representation";

export default class HexRepresentation extends Representation {
  constructor() {
    super("hex");
  }

  typeCheckColorData(data) {}

  black() {
    return new HexColor("#000000");
  }

  buildColor(hexString) {
    return new HexColor(hexString);
  }
}
