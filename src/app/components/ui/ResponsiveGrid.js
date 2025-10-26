import React from "react";
import { Grid } from "@mui/material";

const ResponsiveGrid = ({ 
  children, 
  spacing = { xs: 2, sm: 3, md: 4 },
  container = false,
  item = false,
  xs,
  sm,
  md,
  lg,
  xl,
  sx = {},
  ...props 
}) => {
  return (
    <Grid
      container={container}
      item={item}
      spacing={container ? spacing : undefined}
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      sx={sx}
      {...props}
    >
      {children}
    </Grid>
  );
};

export default ResponsiveGrid;