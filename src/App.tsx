import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ConvexProvider } from "convex/react";
import { Toaster } from "sonner";

import { ConsentBanner } from "@/components/ConsentBanner";
import { RouteScroll } from "@/components/RouteScroll";
import { RouteTracker } from "@/components/RouteTracker";
import { convex } from "@/lib/convex";
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

const App = () => (
  <ConvexProvider client={convex}>
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      {/* Inside the router so they can read the location; outside Routes so
          they survive every navigation. */}
      <RouteScroll />
      <RouteTracker />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/merchants" element={<Merchants />} />
          <Route path="/book" element={<Book />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ConsentBanner />
    </BrowserRouter>
  </ConvexProvider>
);

export default App;
