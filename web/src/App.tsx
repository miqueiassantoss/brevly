import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 text-blue-base font-sans text-xl font-bold">Brevly — Foundation ready.</div>} />
    </Routes>
  )
}

export default App
