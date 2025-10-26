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
	Alert,
	CircularProgress,
} from "@mui/material";
import { Close as CloseIcon, Login as JoinIcon } from "@mui/icons-material";
import { useAuthContext } from "@/app/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { joinRoom, getRoom } from "@/app/libs/database";
import { isValidRoomId, validateRoomJoining, VALIDATION_MESSAGES } from "@/app/utils/validation";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const RoomJoiner = ({ open, onClose }) => {
	const { user } = useAuthContext();
	const router = useRouter();
	const { showSuccess, showError, showRoomEvent } = useNotification();
	const [loading, setLoading] = useState(false);
	const [roomCode, setRoomCode] = useState("");

	const handleInputChange = (event) => {
		const value = event.target.value; // Keep original case
		setRoomCode(value);
	};

	const validateForm = () => {
		if (!roomCode.trim()) {
			showError("Please enter a room code");
			return false;
		}

		if (!isValidRoomId(roomCode.trim())) {
			showError(VALIDATION_MESSAGES.INVALID_ROOM_ID);
			return false;
		}

		return true;
	};

	const handleJoinRoom = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			setLoading(true);

			const trimmedRoomCode = roomCode.trim();

			// Check if room exists and get room data
			const roomData = await getRoom(trimmedRoomCode);

			// Validate room joining requirements
			const validationErrors = validateRoomJoining(roomData, user.uid, user.currentRoom);
			if (validationErrors.length > 0) {
				showError(validationErrors[0]); // Show the first error
				return;
			}

			// Join the room
			await joinRoom(trimmedRoomCode, user.uid);

			// Show success notification
			showRoomEvent('room_joined', { roomId: trimmedRoomCode });

			// Clear form and close dialog
			setRoomCode("");
			onClose();
			router.push(`/room/${trimmedRoomCode}`);
		} catch (error) {
			console.error("Error joining room:", error);
			
			// Handle specific error cases with appropriate notifications
			if (error.message === "Room not found") {
				showRoomEvent('room_not_found');
			} else if (error.message === "Room is at maximum capacity") {
				showRoomEvent('room_full');
			} else if (error.message === "You are already in this room") {
				showError("You are already a member of this room.");
			} else {
				showError(error.message || "Failed to join room. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		if (!loading) {
			setRoomCode("");
			onClose();
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter" && !loading) {
			handleJoinRoom();
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<Typography variant="h6">Join Music Room</Typography>
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
						label="Room Code"
						value={roomCode}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						disabled={loading}
						fullWidth
						placeholder="Enter 6-20 character room code"
						helperText="Room codes are case-sensitive and can contain letters, numbers, hyphens, and underscores"
						autoFocus
					/>

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
							How to join a room:
						</Typography>
						<Typography variant="body2" color="text.secondary">
							• Get a room code from the room creator
						</Typography>
						<Typography variant="body2" color="text.secondary">
							• Enter the code above and click "Join Room"
						</Typography>
						<Typography variant="body2" color="text.secondary">
							• You can only be in one room at a time
						</Typography>
						<Typography variant="body2" color="text.secondary">
							• You'll be automatically synced with the room's music
						</Typography>
					</Box>

					{user?.currentRoom && (
						<Alert severity="warning">
							You are currently in room: <strong>{user.currentRoom}</strong>
							<br />
							You must leave your current room before joining a new one.
						</Alert>
					)}
				</Box>
			</DialogContent>

			<DialogActions sx={{ p: 3 }}>
				<Button onClick={handleClose} disabled={loading}>
					Cancel
				</Button>
				<Button
					onClick={handleJoinRoom}
					variant="contained"
					disabled={loading || !!user?.currentRoom}
					startIcon={loading ? <CircularProgress size={20} /> : <JoinIcon />}
				>
					{loading ? "Joining..." : "Join Room"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default RoomJoiner;