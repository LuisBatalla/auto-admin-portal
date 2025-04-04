
/// <reference types="vite/client" />
/// <reference types="@capacitor/cli" />
/// <reference types="@capacitor/core" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
