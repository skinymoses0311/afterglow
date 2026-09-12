import { Link } from "react-router-dom";

import { Layout } from "@/components/layout/Layout";

/**
 * Any path not in seo/pages. Pre-rendered to dist/404.html, which nginx sends
 * with a real 404 status, so a mistyped URL is never mistaken for a page.
 */
const NotFound = () => (
  <Layout>
    <section className="flex min-h-[60vh] items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link to="/" className="text-link underline hover:no-underline">
          Return to Home
        </Link>
      </div>
    </section>
  </Layout>
);

export default NotFound;
