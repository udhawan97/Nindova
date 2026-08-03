import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

const base = process.env.NINDOVA_BASE_PATH ?? "/";

export default defineConfig({
  base,
  site: "https://udhawan97.github.io",
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
  integrations: [
    starlight({
      title: "Nindova",
      description: "Product and implementation notes for a bounded nightly ritual.",
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
            { label: "Product contract", slug: "docs/product-contract" },
            { label: "Night and local state", slug: "docs/night-and-local-state" },
            { label: "Dawn", slug: "docs/dawn" },
            { label: "Accessibility", slug: "docs/accessibility" },
          ],
        },
        {
          label: "Build",
          items: [
            { label: "Architecture", slug: "docs/architecture" },
            { label: "Testing", slug: "docs/testing" },
            { label: "Known limitations", slug: "docs/known-limitations" },
          ],
        },
      ],
    }),
  ],
});
