import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHostname = null;

if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    supabaseHostname = url.hostname;
  } catch (error) {
    console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL env var', error);
  }
}

if (!supabaseHostname) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL env var is required');
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        port: '',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
