import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Slider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useAuthContext } from "@/app/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { createRoom } from "@/app/libs/database";
import {
  isValidMemberCount,
  VALIDATION_MESSAGES,
} from "@/app/utils/validation";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const RoomCreator = ({ open, onClose }) => {
  const { user } = useAuthContext();
  const router = useRouter();
  const { showSuccess, showError, showRoomEvent } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    maxMembers: 4,
    roomName: "",
  });

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSliderChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      maxMembers: newValue,
    }));
  };

  const validateForm = () => {
    if (!isValidMemberCount(formData.maxMembers)) {
      showError(VALIDATION_MESSAGES.INVALID_MEMBER_COUNT);
      return false;
    }
    return true;
  };

  const handleCreateRoom = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const roomData = await createRoom({
        creatorId: user.uid,
        maxMembers: formData.maxMembers,
        roomName:
          formData.roomName.trim() || `${user.displayName || "User"}'s Room`,
      });

      // Show success notification
      showRoomEvent('room_created', { roomId: roomData.roomId });

      // Close dialog and navigate to room
      onClose();
      router.push(`/room/${roomData.roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      showError(error.message || "Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ maxMembers: 4, roomName: "" });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Create Music Room</Typography>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ minWidth: "auto", p: 1 }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} sx={{ mt: 1 }}>
          <TextField
            label="Room Name (Optional)"
            value={formData.roomName}
            onChange={handleInputChange("roomName")}
            disabled={loading}
            fullWidth
            helperText="Leave empty to use your name as the room name"
          />

          <Box>
            <Typography gutterBottom>
              Maximum Members: {formData.maxMembers}
            </Typography>
            <Slider
              value={formData.maxMembers}
              onChange={handleSliderChange}
              min={2}
              max={10}
              step={1}
              marks={[
                { value: 2, label: "2" },
                { value: 5, label: "5" },
                { value: 10, label: "10" },
              ]}
              disabled={loading}
              sx={{ mt: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Choose how many people can join your room (including yourself)
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Room Features:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Synchronized music playback across all members
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Real-time member list and activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Creator controls for managing the room
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Shareable room link for easy invitations
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateRoom}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Creating..." : "Create Room"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomCreator;
