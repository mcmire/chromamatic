import React, { useEffect, useState } from "react";
import _ from "../vendor/lodash";

import colorSpacesByName, { COLOR_SPACE_NAMES } from "../lib/colorSpacesByName";
import ColorSpaceGroup from "./ColorSpaceGroup";
import Swatch from "./Swatch";

import styles from "./App.css";

const LOCAL_STORAGE_KEY = "lastColorUpdated";

function App() {
  // TODO: Update these callbacks. Whose responsibility is it to update the
  // color itself? Why are these called on*()?

  function onColorTupleComponentFieldUpdate(
    colorForm,
    component,
    newComponentValue
  ) {
    _onColorFormUpdate(colorForm, { [component.name]: newComponentValue });
  }

  function onColorStringFieldUpdate(colorForm, newString) {
    _onColorFormUpdate(colorForm, newString);
  }

  function onColorComponentUpdate(color, component, newComponentValue) {
    //console.log("onColorComponentUpdate");

    const newColor = color.cloneWith({ [component.name]: newComponentValue });
    _onColorUpdate(newColor, {
      representation: { name: "tuple" },
      toSerializable: () => {
        return newColor.toPlainObject();
      }
    });
  }

  function onColorUpdate(newColor) {
    _onColorUpdate(newColor, {
      representation: { name: "tuple" },
      toSerializable: () => {
        return newColor.toPlainObject();
      }
    });
  }

  function _onColorFormUpdate(selectedColorForm, newData) {
    const colorSpaceName = selectedColorForm.colorSpace.name;
    const representationName = selectedColorForm.representation.name;
    const newSelectedColorForm = selectedColorForm.cloneWith(newData);
    const result = newSelectedColorForm.attemptToBuildColor();

    if (result.ok) {
      _onColorUpdate(result.value, newSelectedColorForm);
    } else {
      setColorFormsByColorSpaceName({
        ...colorFormsByColorSpaceName,
        [colorSpaceName]: {
          ...colorFormsByColorSpaceName[colorSpaceName],
          [representationName]: newSelectedColorForm
        }
      });
    }
  }

  function _onColorUpdate(
    selectedColor,
    selectedColorForm,
    { normalize = false } = {}
  ) {
    const newColorsByColorSpaceName = _.reduce(
      Object.keys(colorsByColorSpaceName),
      (obj, colorSpaceName) => {
        return {
          ...obj,
          [colorSpaceName]: selectedColor.convertTo(colorSpaceName)
        };
      },
      {}
    );
    setColorsByColorSpaceName(newColorsByColorSpaceName);

    const newColorFormsByColorSpaceName = _updateColorFormsByColorSpaceName(
      (colorSpaceName, representationName, colorForm) => {
        return colorForm.cloneFromColor(
          newColorsByColorSpaceName[colorSpaceName],
          { normalize }
        );
      }
    );
    setColorFormsByColorSpaceName(newColorFormsByColorSpaceName);

    setLastColorUpdated(selectedColor);

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        colorSpaceName: selectedColor.colorSpace.name,
        representationName: selectedColorForm.representation.name,
        data: selectedColorForm.toSerializable()
      })
    );
  }

  function onColorEditorLeave(selectedColorForm) {
    const allColorForms = _.flatMap(
      colorFormsByColorSpaceName,
      (colorFormsByRepresentationName, colorSpaceName) =>
        _.values(colorFormsByRepresentationName)
    );
    const allColorFormsAreValid = _.every(allColorForms, "isValid");

    if (allColorFormsAreValid) {
      const normalizedColor = selectedColorForm.buildColor({ normalize: true });
      // TODO: This may not even be necessary
      const normalizedColorForm = selectedColorForm.cloneFromColor(
        normalizedColor,
        { normalize: true }
      );
      _onColorUpdate(normalizedColor, normalizedColorForm, { normalize: true });
    }
  }

  function _updateColorFormsByColorSpaceName(fn) {
    return _.reduce(
      colorFormsByColorSpaceName,
      (obj, colorFormsByRepresentationName, colorSpaceName) => {
        const newColorFormsByRepresentationName = _.reduce(
          colorFormsByRepresentationName,
          (obj2, colorForm, representationName) => {
            return {
              ...obj2,
              [representationName]: fn(
                colorSpaceName,
                representationName,
                colorForm
              )
            };
          },
          {}
        );
        return { ...obj, [colorSpaceName]: newColorFormsByRepresentationName };
      },
      {}
    );
  }

  function _buildInitialState() {
    const initialState = {};

    initialState.colorsByColorSpaceName = _.reduce(
      colorSpacesByName,
      (obj, colorSpace, colorSpaceName) => {
        return { ...obj, [colorSpaceName]: colorSpace.black() };
      },
      {}
    );

    initialState.colorFormsByColorSpaceName = _.reduce(
      colorSpacesByName,
      (obj, colorSpace, colorSpaceName) => {
        const color = _.demand(
          initialState.colorsByColorSpaceName,
          colorSpaceName
        );
        return {
          ...obj,
          [colorSpaceName]: _.reduce(
            colorSpace.representationsByName,
            (obj2, representation, representationName) => {
              return {
                ...obj2,
                [representationName]: representation.buildFormFrom(color)
              };
            },
            {}
          )
        };
      },
      {}
    );

    return initialState;
  }

  const initialState = _buildInitialState();
  const [colorsByColorSpaceName, setColorsByColorSpaceName] = useState(
    initialState.colorsByColorSpaceName
  );
  const [colorFormsByColorSpaceName, setColorFormsByColorSpaceName] = useState(
    initialState.colorFormsByColorSpaceName
  );
  const [lastColorUpdated, setLastColorUpdated] = useState(
    _.demand(colorsByColorSpaceName, COLOR_SPACE_NAMES[0])
  );

  useEffect(() => {
    const saveData = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (saveData != null) {
      try {
        const { colorSpaceName, representationName, data } = JSON.parse(
          saveData
        );
        const existingColorForm = _.demand(
          colorFormsByColorSpaceName,
          `${colorSpaceName}.${representationName}`
        );
        const newColorForm = existingColorForm.cloneWith(data);
        const color = newColorForm.buildColor();

        _onColorFormUpdate(newColorForm, color.toPlainObject());
      } catch (e) {
        console.error(
          "Corrupt save data in localStorage, cannot restore.",
          saveData,
          e.message
        );
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  const colorSpaceGroups = _.map(COLOR_SPACE_NAMES, (colorSpaceName, index) => {
    const colorSpace = _.demand(colorSpacesByName, colorSpaceName);
    const colorFormsByRepresentationName = _.demand(
      colorFormsByColorSpaceName,
      colorSpaceName
    );
    return (
      <ColorSpaceGroup
        key={index}
        colorSpace={colorSpace}
        colorFormsByRepresentationName={colorFormsByRepresentationName}
        onColorTupleComponentFieldUpdate={onColorTupleComponentFieldUpdate}
        onColorStringFieldUpdate={onColorStringFieldUpdate}
        onColorEditorLeave={onColorEditorLeave}
      />
    );
  });

  return (
    <div className={styles.app}>
      <Swatch
        colorSpacesByName={colorSpacesByName}
        colorsByColorSpaceName={colorsByColorSpaceName}
        lastColorUpdated={lastColorUpdated}
        onColorComponentUpdate={onColorComponentUpdate}
        onColorUpdate={onColorUpdate}
      />
      <div className={styles.colorEditors}>{colorSpaceGroups}</div>
    </div>
  );
}

export default App;
