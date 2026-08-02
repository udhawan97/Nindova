# Separate the public site from the Session artifact

Nindova will use a small workspace with an Astro/Starlight public site and a Vite-built TypeScript Session core. The same Session build will produce a portable self-contained HTML file and an installable PWA wrapper, keeping documentation and marketing calm and searchable without making the nightly experience depend on a site framework.
