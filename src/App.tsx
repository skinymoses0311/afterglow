import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import Index from "@/pages/Index";
import Waitlist from "@/pages/Waitlist";
import Merchants from "@/pages/Merchants";
import Book from "@/pages/Book";
import Unsubscribe from "@/pages/Unsubscribe";
import NotFound from "@/pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Toaster position="top-center" richColors />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/waitlist" element={<Waitlist />} />
      <Route path="/merchants" element={<Merchants />} />
      <Route path="/book" element={<Book />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
