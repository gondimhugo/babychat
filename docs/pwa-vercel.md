# Guia rápido: PWA instalável (Next.js App Router + Vercel)

## 1) Dependências

```bash
npm i next-pwa
```

## 2) Configuração do `next.config.js`

```js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
```

## 3) Manifest no App Router

Crie `app/manifest.ts`:

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lista do Chá de Bebê",
    short_name: "Chá de Bebê",
    description: "Lista universal com reserva em tempo real",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#db2777",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

## 4) Metadata global

Em `app/layout.tsx`, garanta:

```ts
export const metadata = {
  applicationName: "Lista do Chá de Bebê",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lista do Chá de Bebê",
  },
};
```

## 5) Assets e HTTPS

- Coloque ícones em `public/icons`.
- Vercel já entrega HTTPS por padrão (requisito para instalação PWA).
- Faça um deploy de produção para validar o install prompt no Chrome/Android.

## 6) Checklist de validação

- `manifest.webmanifest` acessível.
- Service Worker registrado em produção.
- Lighthouse (PWA) sem falhas críticas.
