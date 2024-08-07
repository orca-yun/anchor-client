import path from 'path'
import eslintPlugin from 'vite-plugin-eslint'
import { defineConfig } from 'vite'
import postcssPresetEnv from 'postcss-preset-env'
import react from '@vitejs/plugin-react'
import ReactRefresh from '@vitejs/plugin-react-refresh'
import svgr from 'vite-plugin-svgr'
// import vitePluginImp from 'vite-plugin-imp'
// import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
// @ts-ignore
import { dependencies } from './package.json'

const isProd = process.env.NODE_ENV === 'production'
let publicPath: string = './'
if (isProd) {
  publicPath = '/orca-static/anchor'
}

const Chunks = {
  react: ['react', 'react-dom', 'react-router', 'react-router-dom'],
  antd: ['antd', '@ant-design/icons'],
  lodash: ['lodash'],
}

function renderChunks(deps: Record<string, string>) {
  let chunks = {
    vendor: [],
  }
  const customModules = Object.keys(Chunks).reduce((a, b) => a.concat(Chunks[b]), [])
  Object.keys(deps).forEach((key) => {
    if (customModules.includes(key)) return
    chunks.vendor.push(key)
  })
  return chunks
}

// https://vitejs.dev/config/
export default defineConfig({
  base: publicPath,
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        manualChunks: {
          ...Chunks,
          ...renderChunks(dependencies),
        },
      },
    },
    // sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react({
      babel: {
        parserOpts: {plugins: ['decorators-legacy', 'classProperties']},
      },
    }),
    eslintPlugin({
      cache: false,
      failOnWarning: true,
    }),
    // vitePluginImp({
    //     exclude: ['lodash'],
    //     libList: [
    //         {
    //             libName: 'antd',
    //             style: (name) => `antd/es/${name}/style`,
    //         },
    //     ],
    // }),
    ReactRefresh(),
    svgr({
      include: 'src/svgIcons/*.svg',
    }),
    postcssPresetEnv(),
    isProd ? viteCompression() : undefined,
  ].filter(Boolean),
})
