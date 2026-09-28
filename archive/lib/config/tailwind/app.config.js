/**
 * Shared Tailwind CSS configuration for Next.js apps.
 * Includes a default set of content globs for common folders.
 */
const baseConfig = require("./base.config");

const content = [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
  "./blocks/**/*.{js,ts,jsx,tsx,mdx}",
  "./containers/**/*.{js,ts,jsx,tsx,mdx}",
  "./features/**/*.{js,ts,jsx,tsx,mdx}",
  "./list/**/*.{js,ts,jsx,tsx,mdx}",
  "./tradingview/**/*.{js,ts,jsx,tsx,mdx}",
  "./dydx/**/*.{js,ts,jsx,tsx,mdx}",
  "./fe/**/*.{js,ts,jsx,tsx,mdx}",
  "../data/fe/**/*.{js,ts,jsx,tsx,mdx}",
];

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content,
};
