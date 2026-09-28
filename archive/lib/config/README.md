# @lib/config - Shared Configuration Library

This package provides shared configuration files for all apps in the monorepo, eliminating duplicate configuration code.

## Available Configurations

### TypeScript (`/typescript`)

- `nextjs.json` - Base TypeScript config for Next.js apps
- `base.json` - Base TypeScript configuration
- `react-library.json` - TypeScript config for React libraries

### Next.js (`/next`)

- `base.config.js` - Standard Next.js config for most apps
  - Includes: transpilePackages, reactStrictMode, eslint settings, Mantine optimizations, image remotePatterns
- `common.config.js` - Special config for the @apps/common package
  - Includes: webpack extensionAlias configuration

### PostCSS (`/postcss`)

- `postcss.config.cjs` - Shared PostCSS configuration
  - Includes: Mantine presets, Tailwind CSS, autoprefixer, CSS variables

### Tailwind CSS (`/tailwind`)

- `base.config.js` - Base Tailwind configuration with common theme extensions
  - Apps extend this and add their own content paths
- `app.config.js` - App preset with common content globs

### ESLint (`/eslint`)

- `base.js` - Base ESLint configuration
- `next.js` - ESLint config for Next.js apps
- `react-internal.js` - ESLint config for internal React packages

### Jest (`/jest`)

- `next-app.js` - Shared Next.js Jest factory for app tests

## Usage Examples

### TypeScript Configuration

```json
// apps/yourapp/tsconfig.json
{
  "extends": "@lib/config/typescript/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Next.js Configuration

```javascript
// apps/yourapp/next.config.js
const baseConfig = require("@lib/config/next/base");

module.exports = {
  ...baseConfig,
  // Add app-specific overrides here
};
```

### PostCSS Configuration

```javascript
// apps/yourapp/postcss.config.cjs
module.exports = require("@lib/config/postcss");
```

### Tailwind Configuration

```javascript
// apps/yourapp/tailwind.config.js
module.exports = require("@lib/config/tailwind/app");
```

To add extra content paths, spread the shared config and extend:

```javascript
// apps/yourapp/tailwind.config.js
const appConfig = require("@lib/config/tailwind/app");

module.exports = {
  ...appConfig,
  content: [...appConfig.content, "../data/fe/**/*.{js,ts,jsx,tsx,mdx}"],
};
```

### Jest Configuration

```typescript
// apps/yourapp/jest.config.ts
import { createNextJestConfig } from "@lib/config/jest/next-app";

export default createNextJestConfig({
  testEnvironment: "jsdom",
});
```

## Benefits

1. **Consistency**: All apps use the same base configurations
2. **Maintainability**: Update configs in one place instead of multiple apps
3. **DRY Principle**: No duplicate configuration code
4. **Flexibility**: Apps can still override or extend base configs as needed

## Adding New Apps

When adding new apps to the monorepo:

1. Extend the appropriate configs from `@lib/config`
2. Only add app-specific overrides in the app's config files
3. Keep the shared configs generic and reusable
