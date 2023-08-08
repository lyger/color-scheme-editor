import { useState } from "react";

export default function ImportColors({ onImport }) {
  const [colorText, setColorText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const newColors = colorText
          .trim()
          .replace(/\n+/, "\n")
          .split("\n")
          .map((line, index) => {
            const splitChar = line.includes("\t")
              ? "\t"
              : line.includes(",")
              ? ","
              : " ";
            const [color, label] = line.split(splitChar, 2);
            return { index, color, label };
          });
        console.log(newColors);
        onImport(newColors);
      }}
    >
      <div className="field">
        <label className="label">Colors</label>
        <div className="control">
          <textarea
            className="textarea"
            value={colorText}
            onChange={(e) => setColorText(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="button is-primary">
        Import
      </button>
    </form>
  );
}
