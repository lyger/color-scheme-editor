import { useCallback, useMemo, useState } from "react";
import { SketchPicker } from "react-color";
import tinycolor from "tinycolor2";

function ColorRow({ index, selected, color, label, onClick }) {
  return (
    <li>
      <a className={selected ? "is-active" : ""} onClick={() => onClick(index)}>
        <span className="swatch" style={{ backgroundColor: color }} />
        <span>{label}</span>
        <span style={{ opacity: 0.5 }}> ({color})</span>
      </a>
    </li>
  );
}

export default function ColorEditor({ colors, setColors }) {
  const [selColorIndex, setSelColorIndex] = useState(null);
  const [sortMethod, setSortMethod] = useState("original");
  const editColors = useCallback(
    (index, edit) => {
      const editedColors = colors.slice();
      editedColors[index] = { ...editedColors[index], ...edit };
      setColors(editedColors);
    },
    [colors, setColors]
  );
  const sortedColors = useMemo(() => {
    const newSortedColors = colors.slice();
    let sortFn;
    switch (sortMethod) {
      case "hue":
        sortFn = (c1, c2) =>
          tinycolor(c1.color).toHsv().h - tinycolor(c2.color).toHsv().h;
        break;
      case "selected":
        const selRgb = tinycolor(colors[selColorIndex].color).toRgb();
        sortFn = (c1, c2) => {
          const rgb1 = tinycolor(c1.color).toRgb();
          const rgb2 = tinycolor(c2.color).toRgb();
          const delta1 =
            Math.abs(selRgb.r - rgb1.r) +
            Math.abs(selRgb.g - rgb1.g) +
            Math.abs(selRgb.b - rgb1.b);
          const delta2 =
            Math.abs(selRgb.r - rgb2.r) +
            Math.abs(selRgb.g - rgb2.g) +
            Math.abs(selRgb.b - rgb2.b);
          return delta1 - delta2;
        };
        break;
      case "original":
      default:
        sortFn = (c1, c2) => c1.index - c2.index;
    }
    newSortedColors.sort(sortFn);
    return newSortedColors;
  }, [colors, sortMethod, selColorIndex]);
  return (
    <div className="columns">
      {selColorIndex === null ? null : (
        <div className="column is-narrow">
          <SketchPicker
            disableAlpha
            presetColors={[]}
            color={colors[selColorIndex].color}
            onChange={(newColor) =>
              editColors(selColorIndex, { color: newColor.hex })
            }
          />
        </div>
      )}
      <div className="column">
        <div className="buttons has-addons">
          <button
            className={`button${
              sortMethod === "original" ? " is-primary" : ""
            }`}
            onClick={() => setSortMethod("original")}
          >
            Original order
          </button>
          <button
            className={`button${sortMethod === "hue" ? " is-primary" : ""}`}
            onClick={() => setSortMethod("hue")}
          >
            By hue
          </button>
          {selColorIndex === null ? null : (
            <button
              className={`button${
                sortMethod === "selected" ? " is-primary" : ""
              }`}
              onClick={() => setSortMethod("selected")}
            >
              Similar to selected
            </button>
          )}
        </div>
        <div
          className="menu"
          style={{ maxHeight: "calc(100vh - 22em)", overflowY: "scroll" }}
        >
          <ul className="menu-list">
            {sortedColors.map((color) => (
              <ColorRow
                key={color.index}
                onClick={setSelColorIndex}
                selected={color.index === selColorIndex}
                {...color}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
