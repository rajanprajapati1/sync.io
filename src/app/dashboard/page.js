"use client";
import React, { useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Login as JoinIcon,
  MusicNote,
  People,
  History,
} from "@mui/icons-material";
import Layout from "@/app/components/ui/Layout";
import ResponsiveContainer from "@/app/components/ui/ResponsiveContainer";
import ResponsiveGrid from "@/app/components/ui/ResponsiveGrid";
import GradientBackground from "@/app/components/ui/GradientBackground";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import UserProfile from "@/app/components/auth/UserProfile";
import RoomCreator from "@/app/components/room/RoomCreator";
import RoomJoiner from "@/app/components/room/RoomJoiner";
import { useAuthContext } from "@/app/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  const handleCreateRoom = () => {
    setShowCreateRoom(true);
  };

  const handleJoinRoom = () => {
    setShowJoinRoom(true);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <GradientBackground variant="subtle">
          <ResponsiveContainer maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* Welcome Section */}
          <Box mb={{ xs: 3, md: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" },
                textAlign: { xs: "center", sm: "left" }
              }}
            >
              Welcome to Sync Music Player
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              gutterBottom
              sx={{
                fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                textAlign: { xs: "center", sm: "left" }
              }}
            >
              Create or join music rooms to listen together with friends
            </Typography>
          </Box>

          <ResponsiveGrid container>
            {/* User Profile Card */}
            <ResponsiveGrid item xs={12} md={4}>
              <UserProfile
                variant="card"
                showEmail={true}
                showJoinDate={true}
                showCurrentRoom={true}
              />
            </ResponsiveGrid>

            {/* Quick Actions */}
            <ResponsiveGrid item xs={12} md={8}>
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>

                  <ResponsiveGrid container spacing={{ xs: 2, sm: 2 }}>
                    <ResponsiveGrid item xs={12} sm={6}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: { xs: 2, sm: 3 },
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            elevation: 4,
                            transform: "translateY(-2px)",
                          },
                          minHeight: { xs: 200, sm: 220 },
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                        onClick={handleCreateRoom}
                      >
                        <AddIcon
                          sx={{ 
                            fontSize: { xs: 40, sm: 48 }, 
                            color: "primary.main", 
                            mb: { xs: 1, sm: 2 } 
                          }}
                        />
                        <Typography 
                          variant="h6" 
                          gutterBottom
                          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                        >
                          Create Room
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: { xs: 1, sm: 2 },
                            fontSize: { xs: "0.875rem", sm: "0.875rem" }
                          }}
                        >
                          Start a new music room and invite friends
                        </Typography>
                        <Button
                          variant="contained"
                          sx={{ 
                            mt: "auto",
                            minHeight: { xs: 40, sm: 36 }
                          }}
                          onClick={handleCreateRoom}
                        >
                          Create New Room
                        </Button>
                      </Paper>
                    </ResponsiveGrid>

                    <ResponsiveGrid item xs={12} sm={6}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: { xs: 2, sm: 3 },
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            elevation: 4,
                            transform: "translateY(-2px)",
                          },
                          minHeight: { xs: 200, sm: 220 },
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                        onClick={handleJoinRoom}
                      >
                        <JoinIcon
                          sx={{ 
                            fontSize: { xs: 40, sm: 48 }, 
                            color: "secondary.main", 
                            mb: { xs: 1, sm: 2 } 
                          }}
                        />
                        <Typography 
                          variant="h6" 
                          gutterBottom
                          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                        >
                          Join Room
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: { xs: 1, sm: 2 },
                            fontSize: { xs: "0.875rem", sm: "0.875rem" }
                          }}
                        >
                          Enter a room code to join an existing room
                        </Typography>
                        <Button
                          variant="outlined"
                          sx={{ 
                            mt: "auto",
                            minHeight: { xs: 40, sm: 36 }
                          }}
                          onClick={handleJoinRoom}
                        >
                          Join Room
                        </Button>
                      </Paper>
                    </ResponsiveGrid>
                  </ResponsiveGrid>
                </CardContent>
              </Card>
            </ResponsiveGrid>

            {/* Current Room Status */}
            {user?.currentRoom && (
              <ResponsiveGrid item xs={12}>
                <Card sx={{ bgcolor: "primary.dark" }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={2}
                      sx={{
                        flexDirection: { xs: "column", sm: "row" },
                        textAlign: { xs: "center", sm: "left" }
                      }}
                    >
                      <MusicNote sx={{ color: "primary.contrastText" }} />
                      <Box flexGrow={1}>
                        <Typography
                          variant="h6"
                          sx={{ 
                            color: "primary.contrastText",
                            fontSize: { xs: "1.1rem", sm: "1.25rem" }
                          }}
                        >
                          You're currently in a room
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ 
                            color: "primary.contrastText", 
                            opacity: 0.8,
                            fontSize: { xs: "0.875rem", sm: "0.875rem" }
                          }}
                        >
                          Room ID: {user.currentRoom}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => router.push(`/room/${user.currentRoom}`)}
                        sx={{ minHeight: { xs: 44, sm: 36 } }}
                      >
                        Go to Room
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </ResponsiveGrid>
            )}

            {/* Features Overview */}
            <ResponsiveGrid item xs={12}>
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                  >
                    Features
                  </Typography>

                  <ResponsiveGrid container spacing={{ xs: 2, sm: 3 }}>
                    <ResponsiveGrid item xs={12} sm={4}>
                      <Box textAlign="center" sx={{ py: { xs: 2, sm: 1 } }}>
                        <MusicNote
                          sx={{ 
                            fontSize: { xs: 36, sm: 40 }, 
                            color: "primary.main", 
                            mb: 1 
                          }}
                        />
                        <Typography 
                          variant="subtitle1" 
                          gutterBottom
                          sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
                        >
                          Synchronized Playback
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                        >
                          Listen to music together in perfect sync across all
                          devices
                        </Typography>
                      </Box>
                    </ResponsiveGrid>

                    <ResponsiveGrid item xs={12} sm={4}>
                      <Box textAlign="center" sx={{ py: { xs: 2, sm: 1 } }}>
                        <People
                          sx={{ 
                            fontSize: { xs: 36, sm: 40 }, 
                            color: "secondary.main", 
                            mb: 1 
                          }}
                        />
                        <Typography 
                          variant="subtitle1" 
                          gutterBottom
                          sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
                        >
                          Room Management
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                        >
                          Create private rooms and control who can join your
                          sessions
                        </Typography>
                      </Box>
                    </ResponsiveGrid>

                    <ResponsiveGrid item xs={12} sm={4}>
                      <Box textAlign="center" sx={{ py: { xs: 2, sm: 1 } }}>
                        <History
                          sx={{ 
                            fontSize: { xs: 36, sm: 40 }, 
                            color: "success.main", 
                            mb: 1 
                          }}
                        />
                        <Typography 
                          variant="subtitle1" 
                          gutterBottom
                          sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
                        >
                          Real-time Updates
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                        >
                          See live updates of who's in your room and what's
                          playing
                        </Typography>
                      </Box>
                    </ResponsiveGrid>
                  </ResponsiveGrid>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </ResponsiveGrid>
          </ResponsiveContainer>

          {/* Room Creator Dialog */}
          <RoomCreator
            open={showCreateRoom}
            onClose={() => setShowCreateRoom(false)}
          />

          {/* Room Joiner Dialog */}
          <RoomJoiner
          open={showJoinRoom}
          onClose={() => setShowJoinRoom(false)}
        />
      </GradientBackground> 
      </Layout>
    </ProtectedRoute>
  );
}
