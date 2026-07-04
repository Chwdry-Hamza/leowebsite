/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  // Render <head> metadata (title/description/canonical/OG/Twitter/robots)
  // synchronously in <head> for ALL requests instead of streaming it into the
  // <body>. Next 15.2+ streams metadata for JS-capable clients; matching every
  // user agent here forces the blocking (in-head) path everywhere, so the SEO
  // tags are always present in the served HTML <head> (as in the Next-16 site).
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;
