/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Specific S3 bucket URL (most specific first)
      {
        protocol: 'https',
        hostname: 'pagz-files.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
      // S3 regional URLs pattern (bucket.s3.region.amazonaws.com)
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
      // Legacy S3 URLs (bucket.s3.amazonaws.com)
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
      // All AWS S3 domains
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      // Unsplash images
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
      // Localhost
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      // Common external image domains - add more as needed
      {
        protocol: 'https',
        hostname: 'www.novaprint.ca',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.novaprint.ca',
        pathname: '/**',
      },
      // T-shirt supplier images
      {
        protocol: 'https',
        hostname: 'www.tshirt-supplier.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.tshirt-supplier.com',
        pathname: '/**',
      },
    ],
    // Allow unoptimized images as fallback if optimization fails
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
