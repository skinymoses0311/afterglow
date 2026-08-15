/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Convex deployment the browser talks to. Set in .env.production / .env.local. */
  readonly VITE_CONVEX_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
