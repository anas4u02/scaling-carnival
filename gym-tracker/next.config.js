const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  // Workbox never emitted /sw.js on the Next 16 / Turbopack Vercel build.
  // Push uses the committed public/push-sw.js instead.
  disable: true,
  register: false,
  skipWaiting: true,
  clientsClaim: true,
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  serverExternalPackages: ["web-push"],
  async headers() {
    return [
      {
        source: "/push-sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
