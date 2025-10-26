import React from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./AuthProvider";
import {
  CircularProgress,
  Box,
  Typography,
  Button,
  Container,
} from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";

const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectTo = "/auth",
  fallbackComponent = null,
  showLoadingSpinner = true,
}) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, requireAuth, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading && showLoadingSpinner) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    if (fallbackComponent) {
      return fallbackComponent;
    }

    // Default fallback UI
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          textAlign="center"
        >
          <LockIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You need to sign in to access this page.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push(redirectTo)}
          >
            Sign In
          </Button>
        </Box>
      </Container>
    );
  }

  // If no authentication required or user is authenticated
  return children;
};

export default ProtectedRoute;
