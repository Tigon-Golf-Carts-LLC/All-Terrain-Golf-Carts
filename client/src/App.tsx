import { Route, Router, Switch, useLocation } from "wouter";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StickyCallButton } from "@/components/StickyCallButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import snapshot from "@/data/inventory.json";
import { blogPosts } from "@/data/blogPosts";
import { getPreset } from "@/data/filterPresets";
import { getGuide } from "@/data/guides";
import { locations } from "@/data/locations";
import type { InventorySnapshot } from "@/lib/inventory";
import { useDocumentHead } from "@/seo/head";

import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import Financing from "@/pages/Financing";
import GuidePage from "@/pages/GuidePage";
import Guides from "@/pages/Guides";
import Home from "@/pages/Home";
import Inventory from "@/pages/Inventory";
import InventoryDetail from "@/pages/InventoryDetail";
import InventoryPreset from "@/pages/InventoryPreset";
import LocationPage from "@/pages/LocationPage";
import ModelXT4 from "@/pages/ModelXT4";
import ModelXT6 from "@/pages/ModelXT6";
import NotFound from "@/pages/not-found";
import ServiceAreas from "@/pages/ServiceAreas";

const inventory = snapshot as unknown as InventorySnapshot;

/**
 * `/inventory/:slug` is shared by two kinds of page: the prerendered filter
 * presets (`/inventory/new/`) and the item detail pages
 * (`/inventory/2026-evolution-d-max-xt4-red/`). Presets are checked first
 * because their slugs are reserved; `script/fetch-data.ts` rejects an item slug
 * that would collide.
 */
function InventorySlug({ slug }: { slug: string }) {
  const preset = getPreset(slug);
  if (preset) return <InventoryPreset preset={preset} />;

  const item = inventory.items.find((candidate) => candidate.slug === slug);
  if (item) return <InventoryDetail item={item} />;

  return <NotFound />;
}

function GuideSlug({ slug }: { slug: string }) {
  const guide = getGuide(slug);
  return guide ? <GuidePage guide={guide} /> : <NotFound />;
}

function BlogSlug({ slug }: { slug: string }) {
  const post = blogPosts.find((candidate) => candidate.slug === slug);
  return post ? <BlogPost slug={post.slug} /> : <NotFound />;
}

function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/inventory/:slug">{(params) => <InventorySlug slug={params.slug} />}</Route>
      <Route path="/evolution-d-max-xt4" component={ModelXT4} />
      <Route path="/evolution-d-max-xt6" component={ModelXT6} />
      <Route path="/financing" component={Financing} />
      <Route path="/contact" component={Contact} />
      <Route path="/guides" component={Guides} />
      <Route path="/guides/:slug">{(params) => <GuideSlug slug={params.slug} />}</Route>
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug">{(params) => <BlogSlug slug={params.slug} />}</Route>
      <Route path="/service-areas" component={ServiceAreas} />
      {locations.map((location) => (
        <Route key={location.slug} path={`/${location.slug}`}>
          <LocationPage slug={location.slug} />
        </Route>
      ))}
      <Route component={NotFound} />
    </Switch>
  );
}

/** Keeps the document head in step with the active route. */
function HeadSync() {
  const [pathname] = useLocation();
  useDocumentHead(pathname);
  return null;
}

/**
 * `ssrPath` lets the prerenderer render an arbitrary route in Node.
 *
 * `ssrSearch` is passed in the browser as well, and always as `""`. Prerendered
 * HTML is produced without a query string, so a visitor arriving at
 * `/inventory/?color=red` would otherwise hydrate against markup that shows the
 * unfiltered list and React would report a text mismatch. wouter reads
 * `ssrSearch` as `useSyncExternalStore`'s server snapshot, which is used only
 * during hydration: the first client render matches the HTML exactly, then React
 * immediately re-renders from the live query string.
 */
export default function App({ ssrPath }: { ssrPath?: string } = {}) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <Router base={base} ssrPath={ssrPath} ssrSearch="">
      <TooltipProvider>
        <HeadSync />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes />
          </main>
          <Footer />
          <StickyCallButton />
        </div>
      </TooltipProvider>
    </Router>
  );
}
