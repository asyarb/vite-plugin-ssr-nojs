import * as path from 'path'
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import { ssrNoJsPlugin } from './plugin'

export default defineConfig({
  plugins: [
    reactRefresh(),
    ssrNoJsPlugin({
      renderModulePath: path.resolve(__dirname, 'src/entry-server.tsx'),
      viteOutputPath: path.resolve(__dirname, 'dist'),
      routes: ['/', '/about'],
    }),
  ],
})
