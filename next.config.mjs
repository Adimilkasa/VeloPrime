/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Nodemailer is Node-only and should not be bundled by Webpack.
  // Externalizing prevents resolution/bundling issues on some setups (esp. Windows).
  serverExternalPackages: ['nodemailer'],
  // Prevent dev-server chunk corruption on Windows by separating dev output
  // from production build output.
  // - `next dev`  -> .next-dev
  // - `next build`/`next start` -> .next
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  // Disables the Next.js DevTools UI in development (incl. Segment Explorer).
  // Workaround for a dev-only React Client Manifest bug that can crash with
  // "__webpack_modules__[moduleId] is not a function".
  devIndicators: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Workaround for intermittent Webpack cache corruption / ENOENT rename on Windows
      // that can cascade into React Client Manifest errors.
      config.cache = false
    }
    return config
  },
};

export default nextConfig;
