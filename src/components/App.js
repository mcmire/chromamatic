import React, { useEffect, useState } from "react";
import _ from "../vendor/lodash";

import colorRepresentationsByName, {
  COLOR_REPRESENTATION_NAMES
} from "../lib/colorRepresentationsByName";
import StrictMap from "../lib/StrictMap";
import ColorSpaceColorEditor from "./ColorSpaceColorEditor";
import HexColorEditor from "./HexColorEditor";
import Swatch from "./Swatch";

import styles from "./App.css";

const LOCAL_STORAGE_KEY = "lastColorUpdated";

function App() {
  function onColorSpaceColorFieldChange(
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
    const allColorsAreValid = colorsByRepresentationName.every(
      (color, colorRepresentationName) => color.isValid()
    );

    if (allColorsAreValid) {
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

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          representationName: newSelectedColor.representation.name,
          data: newSelectedColor.toSerializable()
        })
      );
    }

    setColorsByRepresentationName(newColorsByRepresentationName);
  }

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

  useEffect(() => {
    const saveData = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (saveData != null) {
      const { representationName, data } = JSON.parse(saveData);
      const representation = colorRepresentationsByName.fetch(
        representationName
      );
      try {
        const color = representation.buildColor(data).withNormalizedData();
        _onColorFieldChange(color, representation);
      } catch (e) {
        console.error(
          "Corrupt save data in localStorage, cannot restore.",
          saveData,
          e
        );
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  const colorEditors = COLOR_REPRESENTATION_NAMES.map(
    (representationName, index) => {
      const color = colorsByRepresentationName.fetch(representationName);
      const representation = colorRepresentationsByName.fetch(
        representationName
      );

      if (representationName === "hex") {
        return (
          <HexColorEditor
            className={styles.hexColorEditor}
            key={index}
            representation={representation}
            color={color}
            onColorFieldChange={onHexColorFieldChange}
            onColorFieldBlur={onColorFieldBlur}
          />
        );
      } else {
        return (
          <ColorSpaceColorEditor
            key={index}
            representation={representation}
            color={color}
            onColorFieldChange={onColorSpaceColorFieldChange}
            onColorFieldBlur={onColorFieldBlur}
          />
        );
      }
    }
  );

  return (
    <div className={styles.app}>
      <Swatch
        colorsByRepresentationName={colorsByRepresentationName}
        lastColorUpdated={lastColorUpdated}
      />
      <div className={styles.colorEditors}>{colorEditors}</div>
    </div>
  );
}

export default App;
