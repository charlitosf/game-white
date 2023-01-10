/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_CAPTCHA_KEY: string
    readonly VITE_ENVIRONMENT: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}