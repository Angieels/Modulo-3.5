import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Library from "./pages/Library";
import { supabase } from "./supabase";

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
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="buscar" element={<Soon name="Buscar" />} />
        <Route path="biblioteca" element={<Library />} />
        <Route path="perfil" element={<Profile />} />
      </Route>
    </Routes>
  );
}