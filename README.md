# Vite Plugin SSR No JS

A simple Vite plugin to use your preferred JS library as a templating language
for static HTML. This plugin will render your provided app as a series of
`.html` files with no JavaScript included.

## Installation

```sh
# yarn
yarn add -D @asyarb/vite-plugin-ssr-nojs

# npm
npm i -D @asyarb/vite-plugin-ssr-nojs
```

## Usage

1. Add the plugin to your Vite config file. See comments for additional
   information regarding options to pass the plugin.

   ```ts
   // vite.config.ts
   import * as path from 'path'
   import { defineConfig } from 'vite'
   import reactRefresh from '@vitejs/plugin-react-refresh'
   import { ssrNoJsPlugin } from '@asyarb/vite-plugin-ssr-nojs'

   export default defineConfig({
     plugins: [
       reactRefresh(),
       ssrNoJsPlugin({
         // An absolute path to a file that renders your app in a server-side
         // context (e.g. ReactDOMServer.renderToStaticMarkup)
         renderModulePath: path.resolve(__dirname, 'src/entry-server.tsx'),

         // An absolute path to the output directory of your vite builds.
         viteOutputPath: path.resolve(__dirname, 'dist'),

         // A list of routes to statically render. Can be a static array or a
         // function that returns an array of routes.
         routes: ['/', '/about'], // routes: async () => ['/', '/about']

         // A static string that will be used as the injection point for your
         // server-rendered HTML. Default: `<!--ssr-html-->`.
         htmlInjectionString: '<!--ssr-html-->',
       }),
     ],
   })
   ```

2. Setup the file specified in `renderModulePath`. The example below uses React,
   and React Router, but any framework will work.

   ```tsx
   // src/entry-server.tsx
   import * as React from 'react'
   import * as ReactDOMServer from 'react-dom/server'
   import { StaticRouter } from 'react-router-dom/server'

   import { App } from './App'

   // Your renderable module must export a function called `render` that
   // receives the current `route` as a paramter.
   export function render(route: string) {
     return ReactDOMServer.renderToStaticMarkup(
       <StaticRouter location={route}>
         <App />
       </StaticRouter>
     )
   }

   // src/App.tsx
   // Imports condensed for brevity.
   export const App = () => {
     return (
       <Routes>
         <Route path="/" element={<HomePage />} />
         <Route path="/about" element={<AboutPage />} />
       </Routes>
     )
   }
   ```

3. Add your `htmlInjectionString` to your `index.html` file. This will be
   replaced with your app's SSR HTML at build time.

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <link rel="icon" type="image/svg+xml" href="/src/assets/favicon.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Vite App</title>
     </head>
     <body>
       <div id="app"><!--ssr-html--></div>

       <script type="module" src="/src/main.tsx"></script>
     </body>
   </html>
   ```

4. Run `vite build`. Your statically generated HTML files will be available in
   vite's output directory.

## License

MIT.
