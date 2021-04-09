import * as React from 'react'
import ReactDOM from 'react-dom'
import 'minireset.css'
import './index.css'

import { HomePage } from './pages'

ReactDOM.render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>,
  document.getElementById('root')
)
