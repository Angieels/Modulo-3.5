
import { useEffect } from "react";
import {
  Route,
  Routes,
  Outlet,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";
import Melody from "./components/Melody.jsx";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Library from "./pages/Library";
import { supabase } from "./supabase";

import { ArtistProvider } from "./context/ArtistContext.jsx";
import ArtistEntry from "./pages/artist/ArtistEntry";
import ArtistOnboarding from "./pages/artist/ArtistOnboarding";
import ArtistLayout from "./pages/artist/ArtistLayout";
import Dashboard from "./pages/artist/Dashboard";
import Songs from "./pages/artist/Songs";
import Albums from "./pages/artist/Albums";
import Events from "./pages/artist/Events";
import Finances from "./pages/artist/Finances";
import Reviews from "./pages/artist/Reviews";
<<<<<<< Updated upstream
import ArtistProfile from "./pages/artist/Artistprofile.jsx";
=======
import ArtistProfile from "./pages/artist/Artistprofile.jsx";
import Search from "./pages/Search.jsx"
>>>>>>> Stashed changes

const Soon = ({ name }) => (
  <h1 className="text-3xl font-black">{name}</h1>
);

export default function App() {
  useEffect(() => {
    async function fetchTracks() {
      const { data, error } = await supabase
        .from("tracks")
        .select("*");

      if (error) {
        console.error("Error fetching tracks:", error);
        return;
      }

      console.log("Tracks cargados:", data);
    }

    fetchTracks();
  }, []);

  return (
    <>
      <Routes>
        {/* Páginas principales */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="biblioteca" element={<Library />} />
          <Route path="perfil" element={<Profile />} />
        </Route>

        {/* Página independiente de Melody */}
        <Route
          path="/melody"
          element={<Melody page />}
        />

        {/* Módulo de artistas */}
        <Route
          path="artista"
          element={
            <ArtistProvider>
              <Outlet />
            </ArtistProvider>
          }
        >
          <Route index element={<ArtistEntry />} />

          <Route
            path="registro"
            element={<ArtistOnboarding />}
          />

          <Route path="panel" element={<ArtistLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="canciones" element={<Songs />} />
            <Route path="albumes" element={<Albums />} />
            <Route path="eventos" element={<Events />} />
            <Route path="finanzas" element={<Finances />} />
            <Route path="resenas" element={<Reviews />} />
            <Route path="perfil" element={<ArtistProfile />} />
          </Route>

          {/* Redirecciones para enlaces antiguos */}
          <Route
            path="canciones"
            element={
              <Navigate
                to="/artista/panel/canciones"
                replace
              />
            }
          />
          <Route
            path="albumes"
            element={
              <Navigate
                to="/artista/panel/albumes"
                replace
              />
            }
          />
          <Route
            path="eventos"
            element={
              <Navigate
                to="/artista/panel/eventos"
                replace
              />
            }
          />
          <Route
            path="finanzas"
            element={
              <Navigate
                to="/artista/panel/finanzas"
                replace
              />
            }
          />
          <Route
            path="resenas"
            element={
              <Navigate
                to="/artista/panel/resenas"
                replace
              />
            }
          />
          <Route
            path="perfil"
            element={
              <Navigate
                to="/artista/panel/perfil"
                replace
              />
            }
          />
        </Route>
      </Routes>

      {/* Chatbot global: no se muestra duplicado en /melody */}
      <Melody />
    </>
  );
}
