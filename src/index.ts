import * as path from 'path'
import * as fs from 'fs'
import { parse as parseHTML } from 'node-html-parser'
import { Plugin, createServer } from 'vite'

interface PluginOptions {
  /**
   * Absolute path to a module that exports a single `render` function that
   * receives the current route and renders your HTML string. (e.g.
   * ReactDOMServer.renderToStaticMarkup
   */
  renderModulePath: string

  /**
   * Absolute path to vite's output directory. This is typically `dist/`.
   */
  viteOutputPath: string

  /**
   * An array of route names to pass to your render function. Can be an array
   * of strings or an async function that returns an array of strings.
   */
  routes: string[] | (() => Promise<string[]> | string[])

  /**
   * The string in your `index.html` file to replace with the SSR'd HTML.
   * Must be a statically replacable string like `<!--ssr-html-->`. Defaults to
   * `<!--ssr-html-->`.
   */
  htmlInjectionString?: string
}

function removeRuntimeTagsFromHtml(html: string) {
  const document = parseHTML(html, { comment: true })

  const scriptTags = (document.querySelectorAll(
    'head > script'
  ) as unknown) as HTMLScriptElement[]

  const linkTags = (document.querySelectorAll(
    'head > link'
  ) as unknown) as HTMLLinkElement[]

  scriptTags.forEach((script) => script.remove())
  linkTags.forEach(
    (link) => link.getAttribute('href')?.endsWith('.js') && link.remove()
  )

  return document.toString()
}

interface RenderModule {
  render: (route: string) => Promise<string> | string
}

export function ssrNoJsPlugin({
  renderModulePath,
  viteOutputPath,
  routes,
  htmlInjectionString = '<!--ssr-html-->',
}: PluginOptions): Plugin {
  return {
    name: 'vite-plugin-ssr-nojs',
    async writeBundle() {
      let resolvedRoutes: string[]

      const templatePath = path.join(viteOutputPath, 'index.html')
      const templateHtml = fs.readFileSync(templatePath, 'utf-8')
      const noJsHtml = removeRuntimeTagsFromHtml(templateHtml)

      const vite = await createServer({
        server: { middlewareMode: true },
      })

      if (typeof routes === 'function') {
        resolvedRoutes = await routes()
      } else {
        resolvedRoutes = routes
      }

      const { render } = (await vite.ssrLoadModule(
        renderModulePath
      )) as RenderModule

      for (const route of resolvedRoutes) {
        const appHtml = await render(route)
        const routeHtml = noJsHtml.replace(htmlInjectionString, appHtml)

        const resolvedRouteName = route === '/' ? '/index' : route

        const outputPath = path.join(
          viteOutputPath,
          `${resolvedRouteName}.html`
        )
        fs.writeFileSync(outputPath, routeHtml)

        console.log('SSG: ', outputPath)
      }

      vite.close()
    },
    enforce: 'post',
    apply: 'build',
  }
}
