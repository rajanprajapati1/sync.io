import React from "react";
import { IconButton, Tooltip, useTheme as useMuiTheme } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useTheme } from "@/app/hooks/useTheme";

const ThemeToggle = ({ size = "medium", showTooltip = true }) => {
  const { mode, toggleTheme, isDark } = useTheme();
  const muiTheme = useMuiTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  const icon = isDark ? <Brightness7 /> : <Brightness4 />;
  const tooltipText = isDark ? "Switch to light mode" : "Switch to dark mode";

  const button = (
    <IconButton
      onClick={handleToggle}
      size={size}
      sx={{
        color: muiTheme.palette.text.primary,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
          transform: "rotate(180deg)",
        },
      }}
      aria-label={tooltipText}
    >
      {icon}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip title={tooltipText} arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default ThemeToggle;