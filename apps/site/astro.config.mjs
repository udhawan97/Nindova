import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const base = process.env.NINDOVA_BASE_PATH ?? "/";
const site = "https://udhawan97.github.io";
const nonCanonical404Url = new URL(base, site).href.replace(/\/$/, "");

export default defineConfig({
  site,
  base,
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
  integrations: [
    starlight({
      title: "Nindova",
      description: "Product and implementation notes for Nindova House, its Grand Salon games, and the bounded Night Room.",
      customCss: ["./src/styles/global.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/udhawan97/Nindova",
        },
      ],
      sidebar: [
        {
          label: "Start",
          items: [
            { label: "Documentation", slug: "docs" },
            { label: "Getting started", slug: "docs/getting-started" },
            { label: "Downloads", slug: "docs/downloads" },
            { label: "Product contract", slug: "docs/product-contract" },
            { label: "Sector Sprint", slug: "docs/sector-sprint" },
            { label: "Masala Mound Session", slug: "docs/nightly-arc" },
            { label: "Night and local state", slug: "docs/night-and-local-state" },
            { label: "Privacy and local state", slug: "docs/privacy-local-state" },
            { label: "Dawn", slug: "docs/dawn" },
            { label: "Accessibility", slug: "docs/accessibility" },
          ],
        },
        {
          label: "Build",
          items: [
            { label: "Architecture", slug: "docs/architecture" },
            { label: "Visual identity", slug: "docs/visual-identity" },
            { label: "Testing", slug: "docs/testing" },
            { label: "Research receipts", slug: "docs/research-receipts" },
            { label: "Roadmap", slug: "docs/roadmap" },
            { label: "Deferred iOS Wall", slug: "docs/ios-wall" },
            { label: "Known limitations", slug: "docs/known-limitations" },
          ],
        },
      ],
    }),
    sitemap({ filter: (page) => page !== nonCanonical404Url }),
  ],
});
