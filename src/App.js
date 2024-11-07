import "./styles.css";
import DraftEditor from "./components/DraftEditor.js";

export default function App() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <DraftEditor />
    </div>
  );
}
