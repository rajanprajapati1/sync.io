import React from "react";
import { Container, Box } from "@mui/material";

const ResponsiveContainer = ({ 
  children, 
  maxWidth = "lg", 
  disableGutters = false,
  sx = {},
  ...props 
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2 },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

export default ResponsiveContainer;