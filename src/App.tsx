import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ConvexProvider } from "convex/react";
import { Toaster } from "sonner";

import { ConsentBanner } from "@/components/ConsentBanner";
import { RouteTracker } from "@/components/RouteTracker";
import { convex } from "@/lib/convex";
import Index from "@/pages/Index";
import Waitlist from "@/pages/Waitlist";
import Merchants from "@/pages/Merchants";
import Book from "@/pages/Book";
import Unsubscribe from "@/pages/Unsubscribe";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";

const App = () => (
  <ConvexProvider client={convex}>
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      {/* Inside the router so it can read the location; outside Routes so it
          survives every navigation. */}
      <RouteTracker />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/merchants" element={<Merchants />} />
        <Route path="/book" element={<Book />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ConsentBanner />
    </BrowserRouter>
  </ConvexProvider>
);

export default App;
