import React from "react";
import { Card, useTheme } from "@mui/material";
import { useTheme as useCustomTheme } from "@/app/hooks/useTheme";

const AnimatedCard = ({ 
  children, 
  hover = true, 
  elevation = 2,
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const { isDark } = useCustomTheme();

  const hoverStyles = hover ? {
    "&:hover": {
      transform: "translateY(-4px) scale(1.02)",
      boxShadow: isDark
        ? "0 16px 48px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)"
        : "0 16px 48px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)",
    },
  } : {};

  return (
    <Card
      elevation={elevation}
      sx={{
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: hover ? "pointer" : "default",
        ...hoverStyles,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default AnimatedCard;