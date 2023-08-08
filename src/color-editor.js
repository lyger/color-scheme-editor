import { useCallback, useMemo, useState } from "react";
import { SketchPicker } from "react-color";
import tinycolor from "tinycolor2";

function ColorRow({ index, selected, color, label, onClick }) {
  return (
    <li>
      <a className={selected ? "is-active" : ""} onClick={() => onClick(index)}>
        <span className="swatch" style={{ backgroundColor: color }} />
        <span>{label}</span>
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
      case "original":
      default:
        sortFn = (c1, c2) => c1.index - c2.index;
    }
    newSortedColors.sort(sortFn);
    return newSortedColors;
  }, [colors, sortMethod]);
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
        </div>
        <div className="menu">
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
