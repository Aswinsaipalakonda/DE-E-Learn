import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DataDock • Data Engineering | MVGRCE",
    short_name: "DataDock",
    description:
      "Official Academic Portal for the Department of Data Engineering, MVGR College of Engineering (Autonomous).",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#0B1F3B",
    icons: [
      {
        src: "/De_logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/De_logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
