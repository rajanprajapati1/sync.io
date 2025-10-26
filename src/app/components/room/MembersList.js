import React from "react";
import {
	Box,
	Typography,
	Paper,
	Avatar,
	Chip,
	IconButton,
	Tooltip,
	Menu,
	MenuItem,
	Badge,

} from "@mui/material";
import {
	MoreVert as MoreIcon,
	PersonRemove as KickIcon,
	Star as CrownIcon,
	FiberManualRecord as OnlineIcon,
} from "@mui/icons-material";
import { getUserDisplayName, getUserAvatarUrl } from "@/app/utils/helpers";
import { useAuthContext } from "@/app/components/auth/AuthProvider";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const MembersList = ({ 
	members = [], 
	roomState, 
	onKickUser, 
	maxMembers,
	showActions = true 
}) => {
	const { user } = useAuthContext();
	const { showRoomEvent } = useNotification();
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [selectedMember, setSelectedMember] = React.useState(null);

	const isCreator = user && roomState && user.uid === roomState.creatorId;

	const handleMenuOpen = (event, member) => {
		setAnchorEl(event.currentTarget);
		setSelectedMember(member);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedMember(null);
	};

	const handleKickUser = () => {
		if (selectedMember && onKickUser) {
			onKickUser(selectedMember.uid);
			showRoomEvent('user_kicked', { 
				userName: getUserDisplayName(selectedMember),
				isCurrentUser: false 
			});
		}
		handleMenuClose();
	};

	const canKickMember = (member) => {
		return (
			isCreator && 
			member.uid !== user.uid && 
			member.uid !== roomState.creatorId &&
			showActions
		);
	};

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				<Typography variant="h6">
					Members ({members.length}/{maxMembers})
				</Typography>
				{members.length === maxMembers && (
					<Chip 
						label="Full" 
						color="warning" 
						size="small" 
					/>
				)}
			</Box>

			<Box display="flex" flexDirection="column" gap={2}>
				{members.map((member) => (
					<Paper
						key={member.uid}
						elevation={1}
						sx={{ 
							p: 2, 
							display: "flex", 
							alignItems: "center", 
							gap: 2,
							position: "relative",
							border: member.uid === user?.uid ? 2 : 0,
							borderColor: member.uid === user?.uid ? "primary.main" : "transparent",
							transition: "all 0.2s ease-in-out",
						}}
					>
						<Badge
							overlap="circular"
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							badgeContent={
								<OnlineIcon 
									sx={{ 
										fontSize: 12, 
										color: "success.main",
										backgroundColor: "background.paper",
										borderRadius: "50%",
									}} 
								/>
							}
						>
							<Avatar
								src={getUserAvatarUrl(member)}
								alt={getUserDisplayName(member)}
								sx={{ width: 40, height: 40 }}
							/>
						</Badge>
						
						<Box flexGrow={1}>
							<Box display="flex" alignItems="center" gap={1} mb={0.5}>
								<Typography variant="subtitle2">
									{getUserDisplayName(member)}
								</Typography>
								
								{member.uid === roomState?.creatorId && (
									<Tooltip title="Room Creator">
										<CrownIcon 
											sx={{ 
												fontSize: 16, 
												color: "warning.main" 
											}} 
										/>
									</Tooltip>
								)}
								
								{member.uid === user?.uid && (
									<Chip 
										label={"You"  || 'no label'}
										size="small" 
										color="primary" 
										variant="outlined"
									/>
								)}
							</Box>
							
							<Box display="flex" alignItems="center" gap={1}>
								{member.email && (
									<Typography variant="body2" color="text.secondary">
										{member.email}
									</Typography>
								)}
								{member.joinedAt && (
									<Typography variant="caption" color="text.secondary">
										• Joined {new Date(member.joinedAt).toLocaleTimeString()}
									</Typography>
								)}
							</Box>
						</Box>

						{canKickMember(member) && (
							<>
								<IconButton
									size="small"
									onClick={(e) => handleMenuOpen(e, member)}
								>
									<MoreIcon />
								</IconButton>

								<Menu
									anchorEl={anchorEl}
									open={Boolean(anchorEl) && selectedMember?.uid === member.uid}
									onClose={handleMenuClose}
								>
									<MenuItem onClick={handleKickUser}>
										<KickIcon sx={{ mr: 1 }} />
										Remove from room
									</MenuItem>
								</Menu>
							</>
						)}
					</Paper>
				))}

				{members.length === 0 && (
					<Paper
						elevation={1}
						sx={{ 
							p: 3, 
							textAlign: "center",
							color: "text.secondary"
						}}
					>
						<Typography variant="body2">
							No members in this room yet
						</Typography>
					</Paper>
				)}
			</Box>

			{members.length < maxMembers && (
				<Box mt={2}>
					<Typography variant="body2" color="text.secondary" textAlign="center">
						{maxMembers - members.length} more {maxMembers - members.length === 1 ? 'person' : 'people'} can join this room
					</Typography>
				</Box>
			)}
		</Box>
	);
};

export default MembersList;