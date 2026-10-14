
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const THEMES = [
  {
    id: "plum",
    name: "Plum Latte",
    description: "Malva, rosa empolvado y mocha",
    colors: {
      page: "#171321",
      card: "#241D2B",
      soft: "#342937",
      text: "#F0D8E5",
      muted: "#C19FAD",
      accent: "#F0D8E5",
      primary: "#4B3F4B",
      border: "#4B3F4B",
      input: "#201A29",
      buttonText: "#F0D8E5",
    },
  },
  {
    id: "mocha",
    name: "Mocha Cream",
    description: "Café oscuro y crema cálida",
    colors: {
      page: "#211915",
      card: "#30231D",
      soft: "#423128",
      text: "#F4E7D8",
      muted: "#BDA694",
      accent: "#D5B394",
      primary: "#70513F",
      border: "#4A382E",
      input: "#281E19",
      buttonText: "#FFF5EA",
    },
  },
  {
    id: "lavender",
    name: "Lavender Haze",
    description: "Ciruela, lavanda y rosa suave",
    colors: {
      page: "#191725",
      card: "#252235",
      soft: "#343047",
      text: "#EAE4FA",
      muted: "#B8AECF",
      accent: "#D6C6F2",
      primary: "#5A4D73",
      border: "#49415F",
      input: "#201D2E",
      buttonText: "#F8F3FF",
    },
  },
  {
    id: "forest",
    name: "Sage After Hours",
    description: "Verde bosque y salvia",
    colors: {
      page: "#151E1A",
      card: "#202D26",
      soft: "#304238",
      text: "#E0EBDD",
      muted: "#A8BBA9",
      accent: "#C6D8B8",
      primary: "#496453",
      border: "#3B5043",
      input: "#19251E",
      buttonText: "#F1F7ED",
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
