import * as path from 'path'
import * as fs from 'fs'
import { Plugin } from 'vite'
import { JSDOM } from 'jsdom'
import Vite from 'vite'

interface PluginOptions {
  renderModulePath: string
  viteOutputPath: string
  routes: string[]
}

function removeRuntimeTagsFromHtml(html: string) {
  const dom = new JSDOM(html)

  const scriptTags = dom.window.document.querySelectorAll<HTMLScriptElement>(
    'head > script'
  )
  const linkTags = dom.window.document.querySelectorAll<HTMLLinkElement>(
    'head > link'
  )

  scriptTags.forEach((script) => script.remove())
  linkTags.forEach((link) => link.href?.endsWith('.js') && link.remove())

  return dom.serialize()
}

interface RenderModule {
  render: (route: string) => Promise<string> | string
}

export function ssrNoJsPlugin({
  renderModulePath,
  viteOutputPath,
  routes,
}: PluginOptions): Plugin {
  return {
    name: 'vite-plugin-ssr-nojs',
    async writeBundle() {
      const templatePath = path.join(viteOutputPath, 'index.html')
      const templateHtml = fs.readFileSync(templatePath, 'utf-8')

      const noJsHtml = removeRuntimeTagsFromHtml(templateHtml)
      const vite = await Vite.createServer({
        server: { middlewareMode: true },
      })

      const { render } = (await vite.ssrLoadModule(
        renderModulePath
      )) as RenderModule

      for (const route of routes) {
        const appHtml = await render(route)
        const routeHtml = noJsHtml.replace('<!--app-html-->', appHtml)

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
