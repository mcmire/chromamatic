import React, { useEffect, useState } from "react";
import _ from "../vendor/lodash";

//import StrictMap from "../lib/StrictMap";
import colorSpacesByName, { COLOR_SPACE_NAMES } from "../lib/colorSpacesByName";
import ColorSpaceGroup from "./ColorSpaceGroup";
//import StringColorEditor from "./StringColorEditor";
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
    const selectedColorSpaceName = selectedColorForm.colorSpace.name;
    const selectedRepresentationName = selectedColorForm.representation.name;
    const newSelectedColorForm = selectedColorForm.cloneWith(newData);

    setColorFormsByColorSpaceName({
      ...colorFormsByColorSpaceName,
      [selectedColorSpaceName]: {
        ..._.demand(
          colorFormsByColorSpaceName,
          newSelectedColorForm.colorSpace.name
        ),
        [newSelectedColorForm.representation.name]: newSelectedColorForm
      }
    });

    const result = newSelectedColorForm.attemptToBuildColor();

    if (result.ok) {
      _onColorUpdate(result.value, newSelectedColorForm);
    }
  }

  function _onColorUpdate(newSelectedColor, newSelectedColorForm) {
    const selectedColorSpaceName = newSelectedColor.colorSpace.name;
    const nonSelectedColorSpaceNames = _.difference(
      Object.keys(colorsByColorSpaceName),
      [selectedColorSpaceName]
    );
    const newColorsByColorSpaceName = nonSelectedColorSpaceNames.reduce(
      (obj, nonSelectedColorSpaceName) => {
        const newUnselectedColor = newSelectedColor.convertTo(
          nonSelectedColorSpaceName
        );
        return {
          ...obj,
          [nonSelectedColorSpaceName]: newUnselectedColor
        };
      },
      { [selectedColorSpaceName]: newSelectedColor }
    );

    // We kind of already did this above, but just do it all over again
    const newColorFormsByColorSpaceName = _.reduce(
      colorFormsByColorSpaceName,
      (obj, colorFormsByRepresentationName, colorSpaceName) => {
        const newColorFormsByRepresentationName = _.reduce(
          colorFormsByRepresentationName,
          (obj2, colorForm, representationName) => {
            return {
              ...obj2,
              [representationName]: colorForm.cloneFromColor(
                newColorsByColorSpaceName[colorSpaceName]
              )
            };
          },
          {}
        );
        return {
          ...obj,
          [colorSpaceName]: newColorFormsByRepresentationName
        };
      },
      {}
    );

    /*
      console.log("newColorsByColorSpaceName", newColorsByColorSpaceName);
      console.log(
        "newColorFormsByColorSpaceName",
        newColorFormsByColorSpaceName
      );
      */

    setColorsByColorSpaceName(newColorsByColorSpaceName);
    setLastColorUpdated(newSelectedColor);
    setColorFormsByColorSpaceName(newColorFormsByColorSpaceName);

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        colorSpaceName: selectedColorSpaceName,
        representationName: newSelectedColorForm.representation.name,
        data: newSelectedColorForm.toSerializable()
      })
    );
  }

  function onColorEditorLeave() {
    /*
    const allColorForms = _.flatten(
      _.map(
        colorFormsByColorSpaceName,
        (colorFormsByRepresentationName, colorSpaceName) =>
          _.values(colorFormsByRepresentationName)
      )
    );
    const allColorFormsAreValid = _.every(allColorForms, "isValid");

    if (allColorsAreValid) {
      const newColorsByColorSpaceName = _.reduce(
        colorsByColorSpaceName,
        (obj, color, colorSpaceName) => {
          return { ...obj, [colorSpaceName]: color.withNormalizedData() };
        },
        {}
      );

      setColorsByColorSpaceName(newColorsByColorSpaceName);
    }
    */
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
        const result = newColorForm.attemptToBuildColor();

        if (result.ok) {
          _onColorFormUpdate(newColorForm, data);
        } else {
          console.error(
            "Corrupt save data in localStorage, cannot restore.",
            saveData
          );
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
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

  /*
  console.log(
    "COLOR_SPACE_NAMES",
    COLOR_SPACE_NAMES,
    "colorSpacesByName",
    colorSpacesByName
  );
  */

  const colorSpaceGroups = _.map(COLOR_SPACE_NAMES, (colorSpaceName, index) => {
    const colorSpace = _.demand(colorSpacesByName, colorSpaceName);
    const colorFormsByRepresentationName = _.demand(
      colorFormsByColorSpaceName,
      colorSpaceName
    );
    /*
      console.log(
        "colorFormsByColorSpaceName",
        colorFormsByColorSpaceName,
        "colorSpaceName",
        colorSpaceName,
        "colorFormsByRepresentationName",
        colorFormsByRepresentationName
      );
      */

    /*
      if (colorSpaceName === "hex") {
        return (
          <StringColorEditor
            className={styles.hexColorEditor}
            key={index}
            colorSpace={colorSpace}
            color={color}
            onColorFieldChange={onHexColorFieldChange}
            onColorFieldBlur={onColorFieldBlur}
          />
        );
      } else {
      */
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
    /*
      }
      */
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
