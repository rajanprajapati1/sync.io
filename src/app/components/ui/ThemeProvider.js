import React from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { ThemeContextProvider, useTheme } from "@/app/hooks/useTheme";

const createResponsiveTheme = (mode) => {
  const isDark = mode === "dark";
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#1976d2",
        light: "#42a5f5",
        dark: "#1565c0",
      },
      secondary: {
        main: "#dc004e",
        light: "#ff5983",
        dark: "#9a0036",
      },
      background: {
        default: isDark ? "#0a0a0a" : "#f5f5f5",
        paper: isDark ? "#1a1a1a" : "#ffffff",
      },
      text: {
        primary: isDark ? "#ffffff" : "#1a1a1a",
        secondary: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
      action: {
        hover: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
        selected: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: "2.5rem",
        fontWeight: 600,
        "@media (max-width:600px)": {
          fontSize: "2rem",
        },
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
        "@media (max-width:600px)": {
          fontSize: "1.75rem",
        },
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 600,
        "@media (max-width:600px)": {
          fontSize: "1.5rem",
        },
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 600,
        "@media (max-width:600px)": {
          fontSize: "1.25rem",
        },
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 600,
        "@media (max-width:600px)": {
          fontSize: "1.125rem",
        },
      },
      h6: {
        fontSize: "1.125rem",
        fontWeight: 600,
        "@media (max-width:600px)": {
          fontSize: "1rem",
        },
      },
      body1: {
        fontSize: "1rem",
        "@media (max-width:600px)": {
          fontSize: "0.875rem",
        },
      },
      body2: {
        fontSize: "0.875rem",
        "@media (max-width:600px)": {
          fontSize: "0.8125rem",
        },
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 8,
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
        easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            scrollbarColor: isDark ? "#6b6b6b #2b2b2b" : "#c1c1c1 #f1f1f1",
            transition: "background-color 0.3s ease-in-out",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              backgroundColor: isDark ? "#2b2b2b" : "#f1f1f1",
              width: 8,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: isDark ? "#6b6b6b" : "#c1c1c1",
              minHeight: 24,
              "&:hover": {
                backgroundColor: isDark ? "#8b8b8b" : "#a1a1a1",
              },
            },
          },
          "*": {
            transition: "color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out",
          },
        }),
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 16,
            background: isDark 
              ? "linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)"
              : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 16px rgba(0, 0, 0, 0.2)"
              : "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 16px rgba(0, 0, 0, 0.04)",
            border: isDark 
              ? "1px solid rgba(255, 255, 255, 0.05)"
              : "1px solid rgba(0, 0, 0, 0.05)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: isDark
                ? "0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)"
                : "0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 20px rgba(0, 0, 0, 0.08)",
            },
            "@media (max-width:600px)": {
              borderRadius: 12,
            },
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            textTransform: "none",
            fontWeight: 500,
            padding: "10px 20px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "@media (max-width:600px)": {
              borderRadius: 8,
              minHeight: 44,
              padding: "12px 16px",
            },
          }),
          contained: ({ theme }) => ({
            background: isDark
              ? "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)"
              : "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
            boxShadow: isDark
              ? "0 4px 16px rgba(25, 118, 210, 0.3)"
              : "0 4px 16px rgba(25, 118, 210, 0.2)",
            "&:hover": {
              transform: "translateY(-1px)",
              background: isDark
                ? "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)"
                : "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
              boxShadow: isDark
                ? "0 6px 20px rgba(25, 118, 210, 0.4)"
                : "0 6px 20px rgba(25, 118, 210, 0.3)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
          }),
          outlined: ({ theme }) => ({
            borderColor: isDark ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)",
            "&:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
              borderColor: isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)",
            },
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
              transform: "scale(1.05)",
            },
            "@media (max-width:600px)": {
              padding: 12,
            },
          }),
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: 16,
            paddingRight: 16,
            "@media (max-width:600px)": {
              paddingLeft: 8,
              paddingRight: 8,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: "none",
            background: isDark 
              ? "linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)"
              : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            borderRadius: 12,
            border: isDark 
              ? "1px solid rgba(255, 255, 255, 0.05)"
              : "1px solid rgba(0, 0, 0, 0.05)",
            "@media (max-width:600px)": {
              borderRadius: 8,
            },
          }),
          elevation1: {
            boxShadow: isDark
              ? "0 2px 8px rgba(0, 0, 0, 0.3)"
              : "0 2px 8px rgba(0, 0, 0, 0.08)",
          },
          elevation2: {
            boxShadow: isDark
              ? "0 4px 16px rgba(0, 0, 0, 0.3)"
              : "0 4px 16px rgba(0, 0, 0, 0.08)",
          },
          elevation3: {
            boxShadow: isDark
              ? "0 8px 24px rgba(0, 0, 0, 0.3)"
              : "0 8px 24px rgba(0, 0, 0, 0.08)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 16,
            background: isDark 
              ? "linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)"
              : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
            border: isDark 
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.1)",
            "@media (max-width:600px)": {
              height: 28,
              fontSize: "0.75rem",
            },
          }),
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: ({ theme }) => ({
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              background: isDark 
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(0, 0, 0, 0.02)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background: isDark 
                  ? "rgba(255, 255, 255, 0.04)"
                  : "rgba(0, 0, 0, 0.04)",
              },
              "&.Mui-focused": {
                background: isDark 
                  ? "rgba(255, 255, 255, 0.06)"
                  : "rgba(0, 0, 0, 0.06)",
              },
              "@media (max-width:600px)": {
                borderRadius: 8,
              },
            },
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRadius: 16,
            background: isDark 
              ? "linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)"
              : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            border: isDark 
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.1)",
            "@media (max-width:600px)": {
              borderRadius: 12,
              margin: 8,
              width: "calc(100% - 16px)",
              maxHeight: "calc(100% - 16px)",
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            background: isDark 
              ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            borderBottom: isDark 
              ? "1px solid rgba(255, 255, 255, 0.12)"
              : "1px solid rgba(0, 0, 0, 0.12)",
            backdropFilter: "blur(10px)",
            boxShadow: isDark
              ? "0 4px 16px rgba(0, 0, 0, 0.3)"
              : "0 4px 16px rgba(0, 0, 0, 0.08)",
          }),
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            "@media (max-width:600px)": {
              minHeight: 56,
              paddingLeft: 8,
              paddingRight: 8,
            },
          },
        },
      },
    },
  });
};

const MuiThemeProviderWrapper = ({ children }) => {
  const { mode, isLoading } = useTheme();
  const theme = React.useMemo(() => createResponsiveTheme(mode), [mode]);

  if (isLoading) {
    return null; // Prevent flash of unstyled content
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

const ThemeProvider = ({ children }) => {
  return (
    <ThemeContextProvider>
      <MuiThemeProviderWrapper>
        {children}
      </MuiThemeProviderWrapper>
    </ThemeContextProvider>
  );
};

export default ThemeProvider;