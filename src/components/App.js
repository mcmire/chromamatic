import React, { useEffect, useState } from "react";
import _ from "../vendor/lodash";

import colorSpacesByName, { COLOR_SPACE_NAMES } from "../lib/colorSpacesByName";
import ColorSpaceGroupIndicator from "./ColorSpaceGroupIndicator";
import ColorSpaceGroup from "./ColorSpaceGroup";
import Swatch from "./Swatch";

import styles from "./App.css";

const LOCAL_STORAGE_KEY = "saveData";

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

  function onMouseOverColorSpaceName(colorSpace) {
    setHighlightedColorSpace(colorSpace);
    setLastHighlightedColorSpace(colorSpace);
  }

  function onMouseOutColorSpaceName() {
    setHighlightedColorSpace(null);
    setLastHighlightedColorSpace(selectedColorSpace);
  }

  function onSelectColorSpace(colorSpace) {
    //setSelectedColorSpace(colorSpace);
    onColorUpdate(_.demand(colorsByColorSpaceName, colorSpace.name));
    setLastHighlightedColorSpace(colorSpace);
  }

  function onAxesUpdate(axes) {
    setAxesByColorSpaceName({
      ...axesByColorSpaceName,
      [selectedColorSpace.name]: axes
    });
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

    initialState.lastColorUpdated = _.demand(
      initialState.colorsByColorSpaceName,
      "rgb"
    );

    initialState.axesByColorSpaceName = {
      rgb: { x: "g", y: "b" },
      hsl: { x: "h", y: "s" },
      hsluv: { x: "h", y: "s" }
    };

    return initialState;
  }

  function _persistSaveData() {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        color: {
          colorSpaceName: lastColorUpdated.colorSpace.name,
          data: lastColorUpdated.toPlainObject()
        },
        axesByColorSpaceName: axesByColorSpaceName
      })
    );
  }

  function _loadSaveData() {
    const saveData = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (saveData != null) {
      try {
        const {
          color: { colorSpaceName, data },
          axesByColorSpaceName
        } = JSON.parse(saveData);

        const newColor = colorsByColorSpaceName[colorSpaceName].cloneWith(data);
        _onColorUpdate(newColor, {
          representation: { name: "tuple" },
          toSerializable: () => {
            return newColor.toPlainObject();
          }
        });
        setAxesByColorSpaceName(axesByColorSpaceName);
      } catch (e) {
        console.error(
          "Corrupt save data in localStorage, cannot restore.",
          saveData,
          e.message
        );
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }

  const initialState = _buildInitialState();
  const [colorsByColorSpaceName, setColorsByColorSpaceName] = useState(
    initialState.colorsByColorSpaceName
  );
  const [colorFormsByColorSpaceName, setColorFormsByColorSpaceName] = useState(
    initialState.colorFormsByColorSpaceName
  );
  const [lastColorUpdated, setLastColorUpdated] = useState(
    initialState.lastColorUpdated
  );
  const [axesByColorSpaceName, setAxesByColorSpaceName] = useState(
    initialState.axesByColorSpaceName
  );
  const [highlightedColorSpace, setHighlightedColorSpace] = useState(null);
  const [lastHighlightedColorSpace, setLastHighlightedColorSpace] = useState(
    null
  );
  const selectedColorSpace = lastColorUpdated.colorSpace;

  useEffect(_loadSaveData, []);
  useEffect(_persistSaveData, [lastColorUpdated, axesByColorSpaceName]);

  const colorSpaceGroups = _.map(COLOR_SPACE_NAMES, (colorSpaceName, index) => {
    const colorSpace = _.demand(colorSpacesByName, colorSpaceName);
    const colorFormsByRepresentationName = _.demand(
      colorFormsByColorSpaceName,
      colorSpaceName
    );
    const isHighlighted =
      highlightedColorSpace != null &&
      highlightedColorSpace.name === colorSpaceName;
    const isSelected = colorSpace.name === selectedColorSpace.name;
    return (
      <ColorSpaceGroup
        key={index}
        colorSpace={colorSpace}
        colorFormsByRepresentationName={colorFormsByRepresentationName}
        onColorTupleComponentFieldUpdate={onColorTupleComponentFieldUpdate}
        onColorStringFieldUpdate={onColorStringFieldUpdate}
        onColorEditorLeave={onColorEditorLeave}
        onMouseOverColorSpaceName={onMouseOverColorSpaceName}
        onMouseOutColorSpaceName={onMouseOutColorSpaceName}
        onSelectColorSpace={onSelectColorSpace}
        isHighlighted={isHighlighted}
        isSelected={isSelected}
      />
    );
  });

  return (
    <div className={styles.app}>
      <Swatch
        colorSpacesByName={colorSpacesByName}
        colorsByColorSpaceName={colorsByColorSpaceName}
        lastColorUpdated={lastColorUpdated}
        axes={_.demand(axesByColorSpaceName, selectedColorSpace.name)}
        onColorComponentUpdate={onColorComponentUpdate}
        onColorUpdate={onColorUpdate}
        onAxesUpdate={onAxesUpdate}
      />
      <div className={styles.colorEditors}>{colorSpaceGroups}</div>
    </div>
  );
}

export default App;
