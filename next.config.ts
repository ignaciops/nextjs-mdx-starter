import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/dist/shared/lib/constants";

const nextConfig = (phase: string)  => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    console.log('happy dev session ;)')
  }

  const nextConfigOptions: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    experimental: {
      typedRoutes: true,
    }
  };

  return nextConfigOptions

}

export default nextConfig;
