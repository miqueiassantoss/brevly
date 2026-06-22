import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <div className="min-h-screen bg-[#eef0f4] pt-8 md:pt-22 pb-30 md:pb-8 flex justify-center">
      <div className="w-full max-w-246 px-3 flex flex-col">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:shortenedUrl" element={null} />
            <Route path="*" element={null} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
