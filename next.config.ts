import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Clerk auth middleware handles route protection
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
