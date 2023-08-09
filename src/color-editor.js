import { useCallback, useMemo, useRef, useState } from "react";
import { SketchPicker } from "react-color";
import tinycolor from "tinycolor2";

function hsvDelta(hsv1, hsv2) {
  const hAbsDelta = Math.abs(hsv2.h - hsv1.h);
  const hDelta = Math.min(hAbsDelta, 360 - hAbsDelta) / 180;
  return hDelta + Math.abs(hsv2.s - hsv1.s) + Math.abs(hsv2.v - hsv1.v);
}

function rgbDelta(rgb1, rgb2) {
  return (
    Math.abs(rgb2.r - rgb1.r) +
    Math.abs(rgb2.g - rgb1.g) +
    Math.abs(rgb2.b - rgb1.b)
  );
}

function clip255(v) {
  return Math.max(Math.min(v, 255), 0);
}

function shiftValueAway(target, compare, step) {
  if (target === compare) return target + (Math.random() < 0.5 ? 1 : -1) * step;
  return target + Math.sign(target - compare) * step;
}

function shiftRgbAway(targetRgb, compareRgb, step) {
  step = step === undefined ? 1 : step;
  return {
    r: clip255(shiftValueAway(targetRgb.r, compareRgb.r, step)),
    g: clip255(shiftValueAway(targetRgb.g, compareRgb.g, step)),
    b: clip255(shiftValueAway(targetRgb.b, compareRgb.b, step)),
  };
}

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
  const [scrollPos, setScrollPos] = useState({
    original: 0,
    hue: 0,
    selected: 0,
  });
  const scrollRef = useRef(null);

  const editColors = useCallback(
    (index, edit) => {
      const editedColors = colors.slice();
      editedColors[index] = { ...editedColors[index], ...edit };
      setColors(editedColors);
    },
    [colors, setColors]
  );

  const colorStats = useMemo(() => {
    const newColorStats = colors.map(({ color }) => {
      const tc = tinycolor(color);
      return {
        rgb: tc.toRgb(),
        hsv: tc.toHsv(),
      };
    });
    newColorStats.forEach((cs1, index1) => {
      let nearestIndex = -1;
      let nearestDelta = 256 * 3;
      newColorStats.forEach((cs2, index2) => {
        if (index1 === index2) return;
        const delta = rgbDelta(cs1.rgb, cs2.rgb);
        if (delta < nearestDelta) {
          nearestIndex = index2;
          nearestDelta = delta;
        }
      });
      cs1.nearestIndex = nearestIndex;
    });
    return newColorStats;
  }, [colors]);

  const sortedColors = useMemo(() => {
    const newSortedColors = colors.slice();
    let sortFn;
    switch (sortMethod) {
      case "hue":
        sortFn = (c1, c2) =>
          colorStats[c1.index].hsv.h - colorStats[c2.index].hsv.h;
        break;
      case "selected":
        const selHsv = colorStats[selColorIndex].hsv;
        sortFn = (c1, c2) => {
          const hsv1 = colorStats[c1.index].hsv;
          const hsv2 = colorStats[c2.index].hsv;
          return hsvDelta(selHsv, hsv1) - hsvDelta(selHsv, hsv2);
        };
        break;
      case "original":
      default:
        sortFn = (c1, c2) => c1.index - c2.index;
    }
    newSortedColors.sort(sortFn);
    return newSortedColors;
  }, [colors, colorStats, sortMethod, selColorIndex]);

  const shiftColors = useCallback(() => {
    const shiftedColors = colors.map((c) => {
      const stats = colorStats[c.index];
      const shiftedRgb = shiftRgbAway(
        stats.rgb,
        colorStats[stats.nearestIndex].rgb,
        1
      );
      return { ...c, color: tinycolor(shiftedRgb).toHexString() };
    });
    setColors(shiftedColors);
  }, [colors, setColors, colorStats]);

  const changeSort = useCallback(
    (newSortMethod) => {
      console.log(scrollPos, sortMethod, scrollRef.current?.scrollTop);
      if (scrollRef.current) {
        const newScrollPos = { ...scrollPos };
        newScrollPos[sortMethod] = scrollRef.current.scrollTop;
        scrollRef.current.scrollTop = scrollPos[newSortMethod];
        setScrollPos(newScrollPos);
      }
      setSortMethod(newSortMethod);
    },
    [scrollRef, sortMethod, setSortMethod, scrollPos, setScrollPos]
  );

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
        <div className="buttons has-addons" style={{ display: "inline-block" }}>
          <button
            className={`button${
              sortMethod === "original" ? " is-primary is-selected" : ""
            }`}
            onClick={() => changeSort("original")}
          >
            Original order
          </button>
          <button
            className={`button${
              sortMethod === "hue" ? " is-primary is-selected" : ""
            }`}
            onClick={() => changeSort("hue")}
          >
            By hue
          </button>
          {selColorIndex === null ? null : (
            <button
              className={`button${
                sortMethod === "selected" ? " is-primary is-selected" : ""
              }`}
              onClick={() => changeSort("selected")}
            >
              Similar to selected
            </button>
          )}
        </div>
        <button
          className="button is-info"
          style={{ float: "right" }}
          onClick={shiftColors}
        >
          Shift colors away
        </button>
        <div
          className="menu"
          style={{ maxHeight: "calc(100vh - 22em)", overflowY: "scroll" }}
          ref={scrollRef}
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
