import { useMemo } from "react";

export default function ExportColors({ colors }) {
  const colorText = useMemo(() => {
    return colors
      .reduce((acc, { color, label }) => acc + `${color}\t${label}\n`, "")
      .trim();
  }, [colors]);
  return (
    <div className="field">
      <label className="label">Colors</label>
      <div className="control">
        <textarea className="textarea" value={colorText} readOnly />
      </div>
    </div>
  );
}
