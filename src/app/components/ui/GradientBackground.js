import React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@/app/hooks/useTheme";

const GradientBackground = ({ 
  children, 
  variant = "primary", // 'primary', 'secondary', 'subtle'
  sx = {},
  ...props 
}) => {
  const { isDark } = useTheme();

  const getGradient = () => {
    switch (variant) {
      case "primary":
        return isDark
          ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)"
          : "linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 50%, #bbdefb 100%)";
      case "secondary":
        return isDark
          ? "linear-gradient(135deg, #1a0a1a 0%, #2a1a2a 50%, #3a2a3a 100%)"
          : "linear-gradient(135deg, #fce4ec 0%, #f8bbd9 50%, #f48fb1 100%)";
      case "subtle":
        return isDark
          ? "linear-gradient(135deg, #0f0f0f 0%, #1f1f1f 100%)"
          : "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)";
      default:
        return isDark
          ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)"
          : "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)";
    }
  };

  return (
    <Box
      sx={{
        background: getGradient(),
        minHeight: "100vh",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? "radial-gradient(circle at 20% 80%, rgba(25, 118, 210, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(220, 0, 78, 0.1) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 80%, rgba(25, 118, 210, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(220, 0, 78, 0.05) 0%, transparent 50%)",
          pointerEvents: "none",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default GradientBackground;