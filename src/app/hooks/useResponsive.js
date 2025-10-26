import { useTheme, useMediaQuery } from "@mui/material";

export const useResponsive = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  const isXl = useMediaQuery(theme.breakpoints.only("xl"));

  return {
    isMobile,
    isTablet,
    isDesktop,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    breakpoints: {
      xs: isXs,
      sm: isSm,
      md: isMd,
      lg: isLg,
      xl: isXl,
    },
  };
};

export default useResponsive;