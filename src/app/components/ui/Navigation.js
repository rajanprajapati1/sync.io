import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import {
  AccountCircle,
  ExitToApp,
  Dashboard,
  MusicNote,
  Menu as MenuIcon,
  Home,
  Add as AddIcon,
  Login as JoinIcon,
} from "@mui/icons-material";
import ThemeToggle from "./ThemeToggle";
import { useAuthContext } from "@/app/components/auth/AuthProvider";
import { getUserDisplayName, getUserAvatarUrl } from "@/app/utils/helpers";
import { useRouter } from "next/navigation";
import { useResponsive } from "@/app/hooks/useResponsive";

const Navigation = () => {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    try {
      await signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleNavigation = (path) => {
    handleMenuClose();
    router.push(path);
  };

  if (!user) {
    return null;
  }

  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);

  // Mobile drawer content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={handleDrawerClose}
      onKeyDown={handleDrawerClose}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={avatarUrl} alt={displayName} sx={{ width: 40, height: 40 }}>
            <AccountCircle />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" noWrap>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <List>
        <ListItemButton onClick={() => handleNavigation("/dashboard")}>
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        
        <ListItemButton onClick={() => handleNavigation("/dashboard")}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Create Room" />
        </ListItemButton>
        
        <ListItemButton onClick={() => handleNavigation("/dashboard")}>
          <ListItemIcon>
            <JoinIcon />
          </ListItemIcon>
          <ListItemText primary="Join Room" />
        </ListItemButton>
        
        <Divider sx={{ my: 1 }} />
        
        <ListItemButton>
          <ListItemIcon>
            <ThemeToggle size="small" showTooltip={false} />
          </ListItemIcon>
          <ListItemText primary="Toggle Theme" />
        </ListItemButton>
        
        <ListItemButton onClick={handleSignOut}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* App Logo/Title */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <MusicNote sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: { xs: "1.1rem", sm: "1.25rem" }
              }}
              onClick={() => router.push("/")}
            >
              {isMobile ? "Sync" : "Sync Music Player"}
            </Typography>
          </Box>

          {/* Navigation Links - Desktop */}
          {!isMobile && (
            <Box display="flex" alignItems="center" gap={2} sx={{ mr: 2 }}>
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => handleNavigation("/dashboard")}
              >
                Dashboard
              </Button>
            </Box>
          )}

        {/* Theme Toggle */}
        <ThemeToggle size="medium" />

        {/* User Profile Section */}
        <Box display="flex" alignItems="center" gap={1}>
          {!isMobile && (
            <Typography variant="body2" sx={{ mr: 1 }}>
              {displayName}
            </Typography>
          )}

          <IconButton
            size="large"
            edge="end"
            aria-label="account menu"
            aria-controls="account-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar
              src={avatarUrl}
              alt={displayName}
              sx={{ width: 32, height: 32 }}
            >
              <AccountCircle />
            </Avatar>
          </IconButton>

          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                "& .MuiAvatar-root": {
                  width: 24,
                  height: 24,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>

            <Divider />

            {/* Mobile Navigation Links */}
            {isMobile && (
              <MenuItem onClick={() => handleNavigation("/dashboard")}>
                <Dashboard sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
            )}

            {/* Sign Out */}
            <MenuItem onClick={handleSignOut}>
              <ExitToApp sx={{ mr: 1 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>

    {/* Mobile Drawer */}
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={handleDrawerClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {drawerContent}
    </Drawer>
  </>
  );
};

export default Navigation;
