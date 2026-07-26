import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // SECURITY: `hostname: "**"` turned the Next image optimizer into an open
    // proxy -- anyone could pass an arbitrary https URL and have our server
    // fetch it, which is an SSRF primitive and a bandwidth amplifier. Member
    // photos come from Supabase Storage, so scope it to that host.
    //
    // NEXT_PUBLIC_SUPABASE_URL is a build-time value; the wildcard fallback
    // covers project refs while keeping the domain fixed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
