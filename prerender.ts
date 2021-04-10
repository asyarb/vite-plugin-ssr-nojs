import * as fs from 'fs'
import * as path from 'path'
import { JSDOM } from 'jsdom'
import rimraf from 'rimraf'

import { render } from './dist/server/entry-server'

const ROUTES = ['/', '/about']

async function prerender({ routes }: { routes: string[] }) {
  const templatePath = path.resolve(__dirname, 'dist/index.html')
  const templateHtml = fs.readFileSync(templatePath, 'utf-8')
  const dom = new JSDOM(templateHtml)

  const scriptTags = dom.window.document.querySelectorAll<HTMLScriptElement>(
    'head > script'
  )
  const linkTags = dom.window.document.querySelectorAll<HTMLLinkElement>(
    'head > link'
  )

  scriptTags.forEach((script) => script.remove())
  linkTags.forEach((link) => link.href?.endsWith('.js') && link.remove())

  const noJsHtml = dom.serialize()

  for (const route of routes) {
    const appHtml = await render(route)
    const routeHtml = noJsHtml.replace('<!--app-html-->', appHtml)

    const resolvedRouteName = route === '/' ? '/index' : route

    const outputPath = path.resolve(__dirname, `dist${resolvedRouteName}.html`)
    fs.writeFileSync(outputPath, routeHtml)

    console.log('SSG: ', outputPath)
  }

  rimraf(path.resolve(__dirname, 'dist/server'), () => {})
}

prerender({ routes: ROUTES })
