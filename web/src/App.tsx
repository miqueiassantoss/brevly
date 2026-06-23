import { Routes, Route, Outlet } from 'react-router-dom'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { RedirectPage } from './pages/RedirectPage'
import { NotFoundPage } from './pages/NotFoundPage'

function WithHeader() {
  return (
    <div className="w-full max-w-246 px-3 pt-8 md:pt-22 pb-30 md:pb-8 flex flex-col">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

function WithoutHeader() {
  return (
    <main className="w-full flex flex-col justify-center">
      <Outlet />
    </main>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-[#eef0f4] flex justify-center">
      <Routes>
        <Route element={<WithHeader />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route element={<WithoutHeader />}>
          <Route path="/:shortenedUrl" element={<RedirectPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
