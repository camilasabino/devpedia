/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['test/**/*.test.ts'],
  },
});
