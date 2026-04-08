import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lista do Chá de Bebê",
    short_name: "Chá de Bebê",
    description: "Lista universal com reserva de presentes em tempo real",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#db2777",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  };
}
