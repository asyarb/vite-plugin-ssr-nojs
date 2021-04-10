import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'

import { App } from './App'

export function render(route: string) {
  return ReactDOMServer.renderToStaticMarkup(
    <StaticRouter location={route}>
      <App />
    </StaticRouter>
  )
}
