/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'res.cloudinary.com',
      'cloudinary.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'randomuser.me',
      'ui-avatars.com'
    ],
  },
};

module.exports = nextConfig;
