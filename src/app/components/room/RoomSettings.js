import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Slider,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ROOM_LIMITS } from "@/app/utils/constants";

const RoomSettings = ({ 
  open, 
  onClose, 
  roomState, 
  onUpdateSettings,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    roomName: roomState?.roomName || "",
    maxMembers: roomState?.maxMembers || ROOM_LIMITS.DEFAULT_MEMBERS,
  });
  const [error, setError] = useState(null);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open && roomState) {
      setFormData({
        roomName: roomState.roomName || "",
        maxMembers: roomState.maxMembers || ROOM_LIMITS.DEFAULT_MEMBERS,
      });
      setError(null);
    }
  }, [open, roomState]);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const handleSliderChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      maxMembers: newValue,
    }));
    setError(null);
  };

  const validateForm = () => {
    if (formData.maxMembers < ROOM_LIMITS.MIN_MEMBERS) {
      setError(`Minimum ${ROOM_LIMITS.MIN_MEMBERS} members required`);
      return false;
    }
    if (formData.maxMembers > ROOM_LIMITS.MAX_MEMBERS) {
      setError(`Maximum ${ROOM_LIMITS.MAX_MEMBERS} members allowed`);
      return false;
    }
    if (formData.roomName.trim().length > 50) {
      setError("Room name must be 50 characters or less");
      return false;
    }
    
    // Check if new max members is less than current member count
    const currentMemberCount = Object.keys(roomState?.members || {}).length;
    if (formData.maxMembers < currentMemberCount) {
      setError(`Cannot reduce max members below current member count (${currentMemberCount})`);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const updates = {
        roomName: formData.roomName.trim() || roomState.roomName,
        maxMembers: formData.maxMembers,
      };

      await onUpdateSettings(updates);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to update room settings");
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  const hasChanges = () => {
    return (
      formData.roomName.trim() !== (roomState?.roomName || "") ||
      formData.maxMembers !== (roomState?.maxMembers || ROOM_LIMITS.DEFAULT_MEMBERS)
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>Room Settings</DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Room Name"
            value={formData.roomName}
            onChange={handleInputChange("roomName")}
            fullWidth
            margin="normal"
            disabled={loading}
            placeholder={roomState?.roomName || "Enter room name"}
            helperText="Leave empty to keep current name"
          />

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography gutterBottom>
              Maximum Members: {formData.maxMembers}
            </Typography>
            <Slider
              value={formData.maxMembers}
              onChange={handleSliderChange}
              min={ROOM_LIMITS.MIN_MEMBERS}
              max={ROOM_LIMITS.MAX_MEMBERS}
              step={1}
              marks
              disabled={loading}
              valueLabelDisplay="auto"
            />
            <Typography variant="body2" color="text.secondary">
              Current members: {Object.keys(roomState?.members || {}).length}
            </Typography>
          </Box>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={loading || !hasChanges()}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomSettings;