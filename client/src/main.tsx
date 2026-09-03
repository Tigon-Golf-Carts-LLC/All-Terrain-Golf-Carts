import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import App from "./App";
import "./index.css";

const container = document.getElementById("root")!;

/**
 * Every route ships as prerendered HTML, so the normal path is hydration.
 * `createRoot` is the fallback for the 404 shell, which is served for URLs that
 * were never prerendered and therefore has an empty root.
 */
if (container.hasChildNodes()) {
  hydrateRoot(
    container,
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
