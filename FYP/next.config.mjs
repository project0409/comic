/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // We intentionally avoid <img> tags in the reader canvas.
    // Other parts of the app can use Next Image if you later add remote covers.
    remotePatterns: []
  },
  headers: async () => {
    // Basic hardening for the "anti-piracy" reader surface.
    return [
      {
        source: "/read/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      }
    ];
  }
};

export default nextConfig;

