import React from "react";
import { Box } from "@mui/material";
import Navigation from "./Navigation";
import ThemeProvider from "./ThemeProvider";
import { useAuthContext } from "@/app/components/auth/AuthProvider";

const Layout = ({ children, showNavigation = true }) => {
  const { user } = useAuthContext();

  return (
    <ThemeProvider>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {showNavigation && user && <Navigation />}
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
