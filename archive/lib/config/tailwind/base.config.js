/**
 * Base Tailwind CSS configuration shared across all apps
 * Apps should extend this and add their own content paths
 *
 * Usage in app's tailwind.config.js:
 * const baseConfig = require('@lib/config/tailwind/base.config')
 * module.exports = {
 *   ...baseConfig,
 *   content: ['./your-app-specific-paths/**\/*.{js,ts,jsx,tsx,mdx}']
 * }
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
