import path from "node:path";

/** @type {import("next").NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  devIndicators: false,
};

export default nextConfig;