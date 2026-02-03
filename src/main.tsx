import { createRoot } from "react-dom/client";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.tsx";
import "./index.css";

// Axe accessibility testing in development
if (process.env.NODE_ENV !== "production") {
  const axe = require("@axe-core/react");
  axe(React, ReactDOM, 1000); // 1000ms delay for dynamic content
}

createRoot(document.getElementById("root")!).render(<App />);
