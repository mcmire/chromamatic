import React, { useState } from "react";
import _ from "../vendor/lodash";

import colorRepresentationsByName, {
  COLOR_REPRESENTATION_NAMES
} from "../lib/colorRepresentationsByName";
import StrictMap from "../lib/StrictMap";
import ColorSpaceColorFields from "./ColorSpaceColorFields";
import HexColorField from "./HexColorField";
import Swatch from "./Swatch";

function App() {
  const initialState = colorRepresentationsByName.reduce(
    (map, representation, representationName) => {
      return map.cloneWith({ [representationName]: representation.black() });
    },
    new StrictMap()
  );
  const [colorsByRepresentationName, setColorsByRepresentationName] = useState(
    initialState
  );
  const [lastColorUpdated, setLastColorUpdated] = useState(
    colorsByRepresentationName.fetch("rgb")
  );

  function onTripletColorFieldChange(
    selectedRepresentation,
    selectedComponent,
    newValue
  ) {
    const selectedColor = colorsByRepresentationName.fetch(
      selectedRepresentation.name
    );
    _onColorFieldChange(
      selectedColor.cloneWith({ [selectedComponent.name]: newValue }),
      selectedRepresentation
    );
  }

  function onHexColorFieldChange(newHexString) {
    const selectedColor = colorsByRepresentationName.fetch("hex");
    _onColorFieldChange(
      selectedColor.cloneWith(newHexString),
      colorRepresentationsByName.fetch("hex")
    );
  }

  function onColorFieldBlur() {
    const newColorsByRepresentationName = colorsByRepresentationName.reduce(
      (map, color, colorRepresentationName) => {
        return map.cloneWith({
          [colorRepresentationName]: color.withNormalizedData()
        });
      },
      new StrictMap()
    );

    setColorsByRepresentationName(newColorsByRepresentationName);
  }

  function _onColorFieldChange(newSelectedColor, selectedRepresentation) {
    newSelectedColor.validate();

    let newColorsByRepresentationName = colorsByRepresentationName.cloneWith({
      [selectedRepresentation.name]: newSelectedColor
    });

    if (newSelectedColor.isValid()) {
      const unselectedRepresentationNames = _.difference(
        Array.from(colorsByRepresentationName.keys()),
        [selectedRepresentation.name]
      );

      const additionalColorsByRepresentationName = unselectedRepresentationNames.reduce(
        (obj, unselectedRepresentationName) => {
          const newUnselectedColor = newSelectedColor.convertTo(
            colorRepresentationsByName.fetch(unselectedRepresentationName)
          );
          return {
            ...obj,
            [unselectedRepresentationName]: newUnselectedColor
          };
        },
        {}
      );

      newColorsByRepresentationName = newColorsByRepresentationName.cloneWith(
        additionalColorsByRepresentationName
      );

      setLastColorUpdated(newSelectedColor);
    }

    setColorsByRepresentationName(newColorsByRepresentationName);
  }

  const colorFields = COLOR_REPRESENTATION_NAMES.map(
    (representationName, index) => {
      const color = colorsByRepresentationName.fetch(representationName);
      const representation = colorRepresentationsByName.fetch(
        representationName
      );

      if (representationName === "hex") {
        return (
          <HexColorField
            key={index}
            representation={representation}
            color={color}
            onColorFieldChange={onHexColorFieldChange}
            onColorFieldBlur={onColorFieldBlur}
          />
        );
      } else {
        return (
          <ColorSpaceColorFields
            key={index}
            representation={representation}
            color={color}
            onColorFieldChange={onTripletColorFieldChange}
            onColorFieldBlur={onColorFieldBlur}
          />
        );
      }
    }
  );

  return (
    <>
      <Swatch
        colorsByRepresentationName={colorsByRepresentationName}
        lastColorUpdated={lastColorUpdated}
      />
      <form>{colorFields}</form>
    </>
  );
}

export default App;
