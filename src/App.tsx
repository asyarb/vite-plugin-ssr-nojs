import * as React from 'react'
import { Route, Routes } from 'react-router-dom'
import 'minireset.css'
import './index.css'

import { HomePage } from './routes/Home'
import { AboutPage } from './routes/About'

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  )
}
