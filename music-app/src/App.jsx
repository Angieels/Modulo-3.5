import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from 'src/components/Layout'
import Home from './pages/Home'

const Soon = ({ name }) => <h1 className="text-3xl font-black">{name}</h1>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="buscar" element={<Soon name="Buscar" />} />
          <Route path="estudio" element={<Soon name="Estudio" />} />
          <Route path="biblioteca" element={<Soon name="Biblioteca" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}