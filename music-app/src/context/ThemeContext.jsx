
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";



const THEMES = [
  {
    id: "midnight",
    name: "Midnight Burgundy",
    description: "Negro, gris humo y vino oscuro",
    colors: {
      page: "#0A0A0A",
      card: "#1C1B1A",
      soft: "#333230",
      text: "#F2F0ED",
      muted: "#B7B4AF",
      accent: "#B7B4AF",
      primary: "#381E1F",
      border: "#736E6A",
      input: "#171615",
      buttonText: "#FFFFFF",
    },
  },
  {
    id: "rose",
    name: "Rose Eclipse",
    description: "Rosa empolvado, coral y ciruela",
    colors: {
      page: "#F6E9E3",
      card: "#FFF7F2",
      soft: "#F3D5CD",
      text: "#381E2C",
      muted: "#783345",
      accent: "#D54C5C",
      primary: "#783345",
      border: "#E4B5A5",
      input: "#FFFFFF",
      buttonText: "#FFFFFF",
    },
  },
  {
    id: "blueberry",
    name: "Blueberry Dream",
    description: "Azul noche, índigo y violeta",
    colors: {
      page: "#000229",
      card: "#10143D",
      soft: "#252653",
      text: "#E3ECF5",
      muted: "#C0B8E8",
      accent: "#A5A7E4",
      primary: "#6B4CD5",
      border: "#494477",
      input: "#10132F",
      buttonText: "#FFFFFF",
    },
  },
  
  {
    id: "vanilla",
    name: "Vanilla Bloom",
    description: "Rosa pastel, vainilla y tonos naturales",
    colors: {
      page: "#F6CFD3",
      card: "#FEF7E7",
      soft: "#FBE0E2",
      text: "#35434E",
      muted: "#687782",
      accent: "#B87177",
      primary: "#B87177",
      border: "#ACBAC7",
      input: "#FEF7E7",
      buttonText: "#FFFFFF",
    },
  },

];

const STORAGE_KEY = "beatboard-theme";

const ThemeContext = createContext(null);

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEMES.some((theme) => theme.id === saved)
      ? saved
      : "plum";
  } catch {
    return "plum";
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  const colors = theme.colors;

  root.dataset.bbTheme = theme.id;

  root.style.setProperty("--bb-page", colors.page);
  root.style.setProperty("--bb-card", colors.card);
  root.style.setProperty("--bb-soft", colors.soft);
  root.style.setProperty("--bb-text", colors.text);
  root.style.setProperty("--bb-muted", colors.muted);
  root.style.setProperty("--bb-accent", colors.accent);
  root.style.setProperty("--bb-primary", colors.primary);
  root.style.setProperty("--bb-border", colors.border);
  root.style.setProperty("--bb-input", colors.input);
  root.style.setProperty("--bb-button-text", colors.buttonText);
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(getInitialTheme);

  const theme =
    THEMES.find((item) => item.id === themeId) ?? THEMES[0];

  useEffect(() => {
    applyTheme(theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme.id);
    } catch (error) {
      console.warn("No se pudo guardar el tema:", error);
    }
  }, [theme]);

  function setTheme(id) {
    if (THEMES.some((item) => item.id === id)) {
      setThemeId(id);
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themes: THEMES,
        themeId,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme debe utilizarse dentro de ThemeProvider."
    );
  }

  return context;
}
