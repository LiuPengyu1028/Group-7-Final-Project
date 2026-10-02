import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

function Welcome() {
  return (
    <main className="welcome">
      <p className="eyebrow">Roadwise · Historical safety explorer</p>
      <h1>Understand the conditions around recorded accidents.</h1>
      <p>Place the Kaggle sample in <code>data/raw/</code> and run the preparation script to load the course demo.</p>
      <p className="notice">Historical data — descriptive patterns only, not a live prediction.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Welcome />
  </React.StrictMode>,
);
