import type { NextConfig } from "next";

const supabaseImageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    serverActions: {
      // Leave multipart overhead above the 2 MB restaurant-logo limit.
      bodySizeLimit: "3mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: supabaseImageUrl ? {
    remotePatterns: [{
      protocol: supabaseImageUrl.protocol.slice(0, -1) as "http" | "https",
      hostname: supabaseImageUrl.hostname,
      ...(supabaseImageUrl.port ? { port: supabaseImageUrl.port } : {}),
      pathname: "/storage/v1/object/sign/**",
    }],
  } : undefined,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
