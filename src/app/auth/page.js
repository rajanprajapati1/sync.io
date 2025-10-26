"use client";
import React from "react";
import { Container, Box, Typography } from "@mui/material";
import LoginForm from "@/app/components/auth/LoginForm";
import Layout from "@/app/components/ui/Layout";
import GradientBackground from "@/app/components/ui/GradientBackground";
import { useAuthContext } from "@/app/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  // Redirect to home if already authenticated
  React.useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Don't render anything while checking auth or if already authenticated
  if (loading || user) {
    return null;
  }

  return (
    <Layout showNavigation={false}>
      <GradientBackground variant="primary">
        <Container maxWidth="sm">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            py={4}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              align="center" 
              gutterBottom
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
              }}
            >
              Sync Music Player
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 400 }}
            >
              Sign in to create or join music rooms and listen together with friends
            </Typography>

            <LoginForm />
          </Box>
        </Container>
      </GradientBackground>
    </Layout>
  );
}
