"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/app/components/auth/AuthProvider";
import Layout from "@/app/components/ui/Layout";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import { Container, Typography, CircularProgress, Box } from "@mui/material";

export default function Home() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // If user is authenticated, redirect to dashboard
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <ProtectedRoute>
      <Layout>
        <Container sx={{ py: 4 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="50vh"
          >
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Redirecting to dashboard...</Typography>
          </Box>
        </Container>
      </Layout>
    </ProtectedRoute>
  );
}
