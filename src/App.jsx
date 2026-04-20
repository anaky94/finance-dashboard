import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Depenses from './pages/Depenses'
import Revenus from './pages/Revenus'
import Bourse from './pages/Bourse'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/depenses" element={<Depenses />} />
            <Route path="/revenus" element={<Revenus />} />
            <Route path="/bourse" element={<Bourse />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
