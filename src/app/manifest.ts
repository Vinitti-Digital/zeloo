import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mantena",
    short_name: "Mantena",
    description: "Collaborative maintenance and organization",
    start_url: "/groups",
    display: "standalone",
    background_color: "#f3efe6",
    theme_color: "#1f4b3a",
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
