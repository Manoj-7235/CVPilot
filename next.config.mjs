import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type-safety is verified locally via `npx tsc --noEmit`
    // Skipping in Render container keeps build under 512MB RAM
    ignoreBuildErrors: true,
  },
  eslint: {
    // Linting is verified locally; skipping in container conserves memory
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

export default nextConfig;
