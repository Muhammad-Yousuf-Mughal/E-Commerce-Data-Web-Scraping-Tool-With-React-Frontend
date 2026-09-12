/// <reference types="vite/client" />

/**
 * Custom Vite env vars used by the app.
 * Extend this interface to add more VITE_* variables.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
