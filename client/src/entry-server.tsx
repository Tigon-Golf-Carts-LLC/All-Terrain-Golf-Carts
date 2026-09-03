import { StrictMode } from "react";
import { renderToString } from "react-dom/server";

import App from "./App";
import { buildHeadTags } from "./seo/head";
import { routes } from "./seo/routes";

export interface RenderResult {
  html: string;
  head: string;
}

/**
 * Renders one route to static HTML plus its head block.
 *
 * Used only by `script/prerender.ts`. Because it runs the same `App` the browser
 * hydrates, a prerendered page cannot drift from what the client would render.
 */
export function render(pathname: string): RenderResult {
  const html = renderToString(
    <StrictMode>
      <App ssrPath={pathname} />
    </StrictMode>,
  );
  return { html, head: buildHeadTags(pathname) };
}

/** Every path the prerenderer should emit. */
export function allRoutes(): string[] {
  return routes.map((route) => route.path);
}

export { routes };
