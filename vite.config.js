// @ts-check
import 'dotenv/config'
import { defineConfig } from 'vite'
import postcssNesting from 'postcss-nesting'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isProd = mode === 'production'

    const config = {
        define: {
            global: 'globalThis',
        },
        root: 'example',
        // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
        esbuild: {
            logOverride: { 'this-is-undefined-in-esm': 'silent' }
        },
        publicDir: '_public',
        css: {
            postcss: {
                plugins: [
                    postcssNesting
                ],
            },
        },
        server: {
            port: 8888,
            host: true,
            open: true,
        },
        build: {
            minify: isProd,
            outDir: '../public',
            emptyOutDir: true,
            sourcemap: 'inline'
        }
    }

    // In production, swap the real debug module for a noop so logging
    // is stripped from the bundle without leaving an unresolved bare
    // specifier. In dev and staging, let Vite bundle the real module.
    if (isProd) {
        config.resolve = {
            alias: {
                '@substrate-system/debug': '@substrate-system/debug/noop',
            },
        }
    }

    return config
})
