import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AccountCircle,
  Email,
  CalendarToday,
  MusicNote,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useAuthContext } from "./AuthProvider";
import { getUserDisplayName, getUserAvatarUrl } from "@/app/utils/helpers";

const UserProfile = ({
  variant = "default", // 'default', 'compact', 'card'
  showEmail = true,
  showJoinDate = false,
  showCurrentRoom = false,
  editable = false,
  onEdit = null,
}) => {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : null;

  // Compact variant for navigation bars
  if (variant === "compact") {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar
          src={avatarUrl}
          alt={displayName}
          sx={{ width: 32, height: 32 }}
        >
          <AccountCircle />
        </Avatar>
        <Typography variant="body2" noWrap>
          {displayName}
        </Typography>
      </Box>
    );
  }

  // Card variant for profile pages
  if (variant === "card") {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Avatar
              src={avatarUrl}
              alt={displayName}
              sx={{ width: 64, height: 64 }}
            >
              <AccountCircle sx={{ fontSize: 40 }} />
            </Avatar>

            <Box flexGrow={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h6">{displayName}</Typography>
                {editable && onEdit && (
                  <Tooltip title="Edit Profile">
                    <IconButton size="small" onClick={onEdit}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {showEmail && user.email && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              )}

              {showJoinDate && joinDate && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Joined {joinDate}
                  </Typography>
                </Box>
              )}

              {showCurrentRoom && user.currentRoom && (
                <Box display="flex" alignItems="center" gap={1}>
                  <MusicNote fontSize="small" color="action" />
                  <Chip
                    label={`In Room: ${user?.currentRoom}` || 'no label'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Avatar src={avatarUrl} alt={displayName} sx={{ width: 40, height: 40 }}>
        <AccountCircle />
      </Avatar>

      <Box>
        <Typography variant="subtitle1">{displayName}</Typography>
        {showEmail && user.email && (
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default UserProfile;
