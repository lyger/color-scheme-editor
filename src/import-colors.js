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
            placeholder="Paste color codes and labels separated by tabs e.g.&#10;#ff0000&#9;Main&#10;#00ff00&#9;Secondary&#10;#0000ff&#9;Tertiary"
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
