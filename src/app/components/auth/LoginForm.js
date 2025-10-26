import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useAuthContext } from "./AuthProvider";
import {
  isValidEmail,
  isValidPassword,
  isValidDisplayName,
  VALIDATION_MESSAGES,
} from "@/app/utils/validation";
import { getFriendlyErrorMessage } from "@/app/utils/helpers";

const LoginForm = () => {
  const { signIn, signUp, signInWithGoogle, loading, error } = useAuthContext();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setFormErrors({});
  };

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = VALIDATION_MESSAGES.REQUIRED_FIELD;
    } else if (!isValidEmail(formData.email)) {
      errors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
    }

    if (!formData.password) {
      errors.password = VALIDATION_MESSAGES.REQUIRED_FIELD;
    } else if (!isValidPassword(formData.password)) {
      errors.password = VALIDATION_MESSAGES.INVALID_PASSWORD;
    }

    // Additional validation for sign up
    if (tabValue === 1) {
      if (!formData.displayName) {
        errors.displayName = VALIDATION_MESSAGES.REQUIRED_FIELD;
      } else if (!isValidDisplayName(formData.displayName)) {
        errors.displayName = VALIDATION_MESSAGES.INVALID_DISPLAY_NAME;
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = VALIDATION_MESSAGES.REQUIRED_FIELD;
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (tabValue === 0) {
        // Sign In
        await signIn(formData.email, formData.password);
      } else {
        // Sign Up
        await signUp(formData.email, formData.password, formData.displayName);
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error("Authentication error:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <Card sx={{ width: "100%", maxWidth: 400 }}>
      <CardContent sx={{ p: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getFriendlyErrorMessage(error)}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            {tabValue === 1 && (
              <TextField
                label="Display Name"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange("displayName")}
                error={!!formErrors.displayName}
                helperText={formErrors.displayName}
                disabled={loading}
                fullWidth
              />
            )}

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange("password")}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={loading}
              fullWidth
            />

            {tabValue === 1 && (
              <TextField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                disabled={loading}
                fullWidth
              />
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ mt: 1 }}
            >
              {loading
                ? <CircularProgress size={24} />
                : tabValue === 0
                  ? "Sign In"
                  : "Sign Up"}
            </Button>
          </Box>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Button
          variant="outlined"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          fullWidth
        >
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
