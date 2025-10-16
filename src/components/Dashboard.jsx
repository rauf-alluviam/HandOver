// src/components/Dashboard/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Assignment as VGMIcon,
  Description as FormIcon,
  QueryBuilder as StatusIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, shippers, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          ODeX VGM Dashboard
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Welcome, {userData?.pyrCode}
          </Typography>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      {shippers.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Authorized Shippers
          </Typography>
          <Grid container spacing={1}>
            {shippers.map((shipper, index) => (
              <Grid item key={index}>
                <Chip
                  label={`${shipper.shipperNm} (${shipper.shipperRegNo})`}
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* VGM Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VGMIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  VGM Submission
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Submit Verified Gross Mass declarations for containers as per SOLAS requirements.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                variant="contained"
                onClick={() => navigate('/vgm')}
              >
                Proceed to VGM
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* VGM Status Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StatusIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  VGM Status Check
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Check the status of submitted VGM requests and track container verification status.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => navigate('/vgm-status')}
              >
                Check Status
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Form 13 Card - Placeholder */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: 0.6 }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormIcon color="disabled" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Form 13
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Form 13 submission module (Coming Soon)
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" variant="outlined" disabled>
                Coming Soon
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;