import { configDefaults, defineConfig } from 'vitest/config'

const exclude = configDefaults.exclude.concat([
  './.yarn',
  '**/dist/**',
])

export default defineConfig({
  test: {
    clearMocks: true,
    setupFiles: ['./vitest.setup.mjs'],
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude,
    typecheck: {
      include: ['src/**/*.{test,spec}?(-d).?(c|m)[jt]s?(x)'],
      exclude,
      checker: 'tsc',
      enabled: false,
      tsconfig: './tsconfig.json',
    },
  },
})
