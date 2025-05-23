import {withSentryConfig} from "@sentry/nextjs";
// import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/dist/shared/lib/constants.js";
import createMdx from '@next/mdx';
import rehypeMdxImportMedia from "rehype-mdx-import-media";
import rehypePrettyCode from "rehype-pretty-code";
import { transformerNotationDiff } from "@shikijs/transformers";
import rehypeSlug from "rehype-slug";
import { remarkTableOfContents } from "remark-table-of-contents";

/** @type {import('next').NextConfig} */
const nextConfig = (phase/*: string*/)  => {

  /** @type {import('rehype-pretty-code').Options} */
  const rehypePrettyCodeOptions = {
    theme: 'dracula',
    keepBackgroud:false,
    defaultLang: {
      block: 'js',
      inline: 'js',
    },
    tokensMap: {
      fn: 'entity.name.function',
      cmt: 'comment',
      str: 'string',
      var: 'entity.name.variable',
      obj: 'variable.other.object',
      prop: 'meta.property.object',
      int: 'constant.numeric',
  },
    transformers: [transformerNotationDiff({
      matchAlgorithm: 'v3',
    })],
  }

  /** @type {import('remark-table-of-contents').IRemarkTableOfContentsOptions} */
  const remarkTableOfContentsOptions = {
    containerAttributes: {
      id: 'articleToc',
    },
    navAttributes: {
      'aria-label': 'table of contents'
    },
    maxDepth: 3,
  }

  const withMDX = createMdx({
    extension: /\.mdx?$/,
    options: {
      // optional remark and rehype plugins
      remarkPlugins: [[remarkTableOfContents, remarkTableOfContentsOptions]],
      rehypePlugins: [rehypeSlug, [rehypePrettyCode, rehypePrettyCodeOptions], rehypeMdxImportMedia],
    },
  })

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    console.log('happy dev session ;)')
  }

  const nextConfigOptions/*NextConfig */= {
    reactStrictMode: true,
    poweredByHeader: false,
    experimental: {
      typedRoutes: true,
    },
    headers: async () => {
      return [
        {
          source: '/(.*)',
          headers: securityHeadersConfig(phase)
        },
      ];
    },
    // configure 'pageExtensions' to include MDX files
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx', 'md'],
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      formats: ['image/avif', 'image/webp'],
      deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920, 2176, 3840],
    },
  };

  return withMDX(nextConfigOptions)

}

const securityHeadersConfig = (phase/*: string*/) => {
 
  const cspReportOnly = true

  const reportingUrl = 'https://o4509180916072448.ingest.us.sentry.io/api/4509180924067840/security/?sentry_key=5dc339089c8534193e1ba793f16588ae'
  const reportingDomainWildcard = 'https://*.ingest.us.sentry.io'

  const cspHeader = () => {

      const upgradeInsecure = (phase !== PHASE_DEVELOPMENT_SERVER && !cspReportOnly) ? 'upgrade-insecure-requests;' : ''

      // reporting uri (CSP v1)
      const reportCSPViolations = `report-uri ${reportingUrl};`
      // worker-src is for sentry replay
      // child-src is because safari <= 15.4 does not support worker-src
      const defaultCSPDirectives = `
          default-src 'none';
          media-src 'self';
          object-src 'none';
          worker-src 'self' blob:;
          child-src 'self' blob:;
          manifest-src 'self';
          base-uri 'none';
          form-action 'none';
          frame-ancestors 'none';
          ${upgradeInsecure}
      `

      // when environment is preview enable unsafe-inline scripts for vercel preview feedback/comments feature
      // and allow vercel's domains based on:
      // https://vercel.com/docs/workflow-collaboration/comments/specialized-usage#using-a-content-security-policy
      // and allow also vitals.vercel-insights
      // based on: https://vercel.com/docs/speed-insights#content-security-policy
      if (process.env.VERCEL_ENV === 'preview') {
          return `
              ${defaultCSPDirectives}
              font-src 'self' https://vercel.live/ https://assets.vercel.com https://fonts.gstatic.com;
              style-src 'self' 'unsafe-inline' https://vercel.live/fonts;
              script-src 'self' 'unsafe-inline' https://vercel.live/;
              connect-src 'self' https://vercel.live/ https://vitals.vercel-insights.com https://*.pusher.com/ wss://*.pusher.com/ ${reportingDomainWildcard};
              img-src 'self' data: https://vercel.com/ https://vercel.live/;
              frame-src 'self' https://vercel.live/;
              ${reportCSPViolations}
          `
      }

      // for production environment allowing vitals.vercel-insights.com
      // based on: https://vercel.com/docs/speed-insights#content-security-policy
      if (process.env.VERCEL_ENV === 'production') {
          return `
              ${defaultCSPDirectives}
              font-src 'self';
              style-src 'self' 'unsafe-inline';
              script-src 'self' 'unsafe-inline';
              connect-src 'self' https://vitals.vercel-insights.com ${reportingDomainWildcard};
              img-src 'self' data:;
              frame-src 'none';
              $${reportCSPViolations}
          `
      }

      // for dev environment enable unsafe-eval for hot-reload
      return `
          ${defaultCSPDirectives}
          font-src 'self';
          style-src 'self' 'unsafe-inline';
          script-src 'self' 'unsafe-inline' 'unsafe-eval';
          connect-src 'self';
          img-src 'self' data:;
          frame-src 'none';
      `

  }

  const extraSecurityHeaders = []

  if (phase !== PHASE_DEVELOPMENT_SERVER) {
    extraSecurityHeaders.push(
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000', // 1 year
      },
    )
  }

  const headers = [
      ...extraSecurityHeaders,
      {
          key: cspReportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
          value: cspHeader().replace(/\n/g, ''),
      },
      {
        key: 'Referrer-Policy',
        value: 'same-origin',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
  ]

  return headers

}

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "ignaciops",
project: "javascript-nextjs",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});