import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import React, {useState, useEffect} from 'react'
import {supabase} from './supabase'

const Soon = ({ name }) => <h1 className="text-3xl font-black">{name}</h1>

export default function App() {
  const [tracks, setTracks] = useState([])
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    async function fetchTracks() {
      const { data, error } = await supabase.from('tracks').select('*')
      if (error) {
        console.error('Error fetching tracks:', error)
        return
      }
      setTracks(data)
      if (data.length > 0) {
        setCurrentTrack(data[0])
      }
    }
    fetchTracks()
  }, [])

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