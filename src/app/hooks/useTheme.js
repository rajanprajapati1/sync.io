import { useState, useEffect, useContext, createContext } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState("dark");
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode");
    if (savedMode && (savedMode === "light" || savedMode === "dark")) {
      setMode(savedMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
    setIsLoading(false);
  }, []);

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("theme-mode", mode);
      // Update meta theme-color for PWA
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", mode === "dark" ? "#121212" : "#1976d2");
      }
    }
  }, [mode, isLoading]);

  const toggleTheme = () => {
    setMode(prevMode => prevMode === "light" ? "dark" : "light");
  };

  const value = {
    mode,
    toggleTheme,
    isLoading,
    isDark: mode === "dark",
    isLight: mode === "light"
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};