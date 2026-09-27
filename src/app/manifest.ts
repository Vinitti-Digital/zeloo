import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mantena",
    short_name: "Mantena",
    description: "Gestão colaborativa de manutenção e organização",
    start_url: "/groups",
    display: "standalone",
    background_color: "#FFFDF8",
    theme_color: "#6B3418",
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
