import { useState } from "react";
import "./App.css";
import ImportColors from "./import-colors";
import ColorEditor from "./color-editor";
import ExportColors from "./export-colors";

function App() {
  const [colors, setColors] = useState([]);
  return (
    <section className="section">
      <div className="container">
        {colors.length ? (
          <>
            <ColorEditor colors={colors} setColors={setColors} />
            <ExportColors colors={colors} />
          </>
        ) : (
          <ImportColors onImport={setColors} />
        )}
      </div>
    </section>
  );
}

export default App;
