// src/components/Dashboard/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Paper,
  Chip,
  Avatar,
  Stack,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Assignment as VGMIcon,
  Description as FormIcon,
  QueryBuilder as StatusIcon,
  Logout as LogoutIcon,
  Person as UserIcon,
  Business as BusinessIcon,
  TrendingUp as StatsIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, shippers, logout } = useAuth();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const StatCard = ({ icon, value, label, color = "primary" }) => (
    <Paper
      sx={{
        p: 2,
        textAlign: "center",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette[color].main,
          0.1
        )} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette[color].main, 0.1),
            width: 48,
            height: 48,
          }}
        >
          {React.cloneElement(icon, {
            sx: { color: theme.palette[color].main, fontSize: 24 },
          })}
        </Avatar>
      </Box>
      <Typography variant="h4" fontWeight="bold" color={color}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight="medium">
        {label}
      </Typography>
    </Paper>
  );

  const FeatureCard = ({
    icon,
    title,
    description,
    buttonText,
    onClick,
    disabled = false,
    color = "primary",
  }) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        background: disabled
          ? `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`
          : `linear-gradient(135deg, ${alpha(
              theme.palette[color].main,
              0.02
            )} 0%, ${alpha(theme.palette[color].main, 0.01)} 100%)`,
        "&:hover": disabled
          ? {}
          : {
              transform: "translateY(-4px)",
              boxShadow: `0 8px 24px ${alpha(theme.palette[color].main, 0.15)}`,
              border: `1px solid ${alpha(theme.palette[color].main, 0.3)}`,
            },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: disabled
                ? theme.palette.grey[300]
                : alpha(theme.palette[color].main, 0.1),
              width: 56,
              height: 56,
              mr: 2,
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                color: disabled
                  ? theme.palette.grey[500]
                  : theme.palette[color].main,
                fontSize: 28,
              },
            })}
          </Avatar>
          <Typography variant="h6" component="h2" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color={disabled ? "text.disabled" : "text.secondary"}
          sx={{ lineHeight: 1.6 }}
        >
          {description}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button
          size="medium"
          variant={disabled ? "outlined" : "contained"}
          onClick={onClick}
          disabled={disabled}
          fullWidth
          sx={{
            borderRadius: 2,
            py: 1,
            fontWeight: "bold",
            ...(disabled
              ? {}
              : {
                  background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette[color].main,
                    0.3
                  )}`,
                }),
          }}
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header Section */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                ODeX Portal
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                VGM & Form 13 Management System
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.1),
                  borderColor: "white",
                },
              }}
            >
              Logout
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <UserIcon sx={{ mr: 1, opacity: 0.9 }} />
                <Typography variant="body1" fontWeight="medium">
                  Welcome, {userData?.pyrName || userData?.pyrCode}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* <CompanyIcon sx={{ mr: 1, opacity: 0.9 }} /> */}
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {userData?.pyrCode} • {userData?.pyrType || "User"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ShippingIcon sx={{ mr: 1, opacity: 0.9 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Shipping Line: {userData?.bnfCode || "All"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* <Business sx={{ mr: 1, opacity: 0.9 }} /> */}
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Port Access: {userData?.locId || "Multiple Ports"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: alpha("#fff", 0.1),
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            right: 100,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: alpha("#fff", 0.05),
          }}
        />
      </Paper>

      {/* Statistics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<VGMIcon />}
            value="0"
            label="Today's VGM"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<FormIcon />}
            value="0"
            label="Form 13 Today"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<StatusIcon />}
            value="0"
            label="Pending Status"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<StatsIcon />}
            value="0"
            label="Total Submissions"
            color="success"
          />
        </Grid>
      </Grid>

      {/* Authorized Shippers Section */}
      {shippers.length > 0 && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.02
            )} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Business sx={{ mr: 1, color: "primary.main" }} />
            Authorized Shippers
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {shippers.map((shipper, index) => (
              <Chip
                key={index}
                label={`${shipper.shipperNm} (${shipper.shipperRegNo})`}
                variant="outlined"
                color="primary"
                sx={{
                  mb: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  background: alpha(theme.palette.primary.main, 0.05),
                }}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Features Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FeatureCard
            icon={<VGMIcon />}
            title="VGM Submission"
            description="Submit Verified Gross Mass declarations for containers as per SOLAS requirements. Ensure compliance with international shipping regulations."
            buttonText="Submit VGM"
            onClick={() => navigate("/vgm")}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FeatureCard
            icon={<FormIcon />}
            title="Form 13 Submission"
            description="Submit Export Gate Pass (Form 13) for container authorization. Digital submission to shipping lines via ODeX API integration."
            buttonText="Submit Form 13"
            onClick={() => navigate("/form13")}
            color="info"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FeatureCard
            icon={<StatusIcon />}
            title="Request Status"
            description="Track the status of submitted VGM and Form 13 requests in real-time. Monitor container verification and get instant updates."
            buttonText="Check Status"
            onClick={() => navigate("/vgm-status")}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Quick Actions Footer */}
      <Paper
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 3,
          background: alpha(theme.palette.grey[50], 0.5),
          border: `1px solid ${theme.palette.grey[200]}`,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/vgm")}
            sx={{ borderRadius: 2 }}
          >
            New VGM Submission
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/form13")}
            sx={{ borderRadius: 2 }}
          >
            New Form 13
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/vgm-status")}
            sx={{ borderRadius: 2 }}
          >
            View All Submissions
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled
            sx={{ borderRadius: 2 }}
          >
            Download Reports
          </Button>
        </Stack>
      </Paper>

      {/* System Status */}
      <Paper
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 2,
          background: alpha(theme.palette.info.main, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "success.main",
                mr: 1,
                animation: "pulse 2s infinite",
              }}
            />
            <Typography variant="body2" color="text.secondary">
              System Status: <strong>All Systems Operational</strong>
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            ODeX API: Connected • Form 13: Available
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;
