import { Suspense, lazy, type ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { ConsentBanner } from "@/components/ConsentBanner";
import { RouteScroll } from "@/components/RouteScroll";
import { RouteTracker } from "@/components/RouteTracker";
import type { PagePath } from "@/seo/pages";
import Index from "@/pages/Index";
import Waitlist from "@/pages/Waitlist";
import Merchants from "@/pages/Merchants";
import Book from "@/pages/Book";
import Unsubscribe from "@/pages/Unsubscribe";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

// The legal documents are large, static and rarely opened, so they load on
// demand rather than riding along in the bundle every visitor downloads to see
// the homepage.
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));

/**
 * The component for each path in seo/pages. Typed against that list, so adding
 * a page there without a component here, or the reverse, fails the build.
 */
const ELEMENTS: Record<PagePath, ReactElement> = {
  "/": <Index />,
  "/waitlist": <Waitlist />,
  "/merchants": <Merchants />,
  "/book": <Book />,
  "/about": <About />,
  "/contact": <Contact />,
  "/privacy": <Privacy />,
  "/terms": <Terms />,
  "/unsubscribe": <Unsubscribe />,
};

/**
 * Everything inside the router. The browser mounts this in a BrowserRouter
 * (main.tsx); the build renders it in a StaticRouter (entry-server.tsx) to
 * pre-render each page.
 */
const App = () => (
  <>
    <Toaster position="top-center" richColors />
    {/* Inside the router so they can read the location; outside Routes so
        they survive every navigation. */}
    <RouteScroll />
    <RouteTracker />
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes>
        {(Object.keys(ELEMENTS) as PagePath[]).map((path) => (
          <Route key={path} path={path} element={ELEMENTS[path]} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    <ConsentBanner />
  </>
);

export default App;
