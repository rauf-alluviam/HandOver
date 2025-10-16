// src/components/VGMStatus/VGMStatus.jsx
import React from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { vgmAPI } from '../services/api';

const VGMStatus = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState(false);
  const [statusData, setStatusData] = React.useState(null);

  const formik = useFormik({
    initialValues: {
      vgmId: '',
      odexRefNo: '',
      hashKey: '',
    },
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await vgmAPI.getStatus(values);
        setStatusData(response.data);
        enqueueSnackbar('Status retrieved successfully', { variant: 'success' });
      } catch (error) {
        console.error('Status check error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to retrieve status';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          VGM Status Check
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="VGM ID"
                name="vgmId"
                value={formik.values.vgmId}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ODeX Reference No"
                name="odexRefNo"
                value={formik.values.odexRefNo}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Check Status'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {statusData && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                VGM Status Details
              </Typography>
              
              {statusData.response === 'SUCCESS' ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}><strong>VGM ID:</strong> {statusData.vgmId}</Grid>
                  <Grid item xs={6}><strong>Status:</strong> {statusData.cntnrStatus}</Grid>
                  <Grid item xs={6}><strong>Booking No:</strong> {statusData.bookNo}</Grid>
                  <Grid item xs={6}><strong>Container No:</strong> {statusData.cntnrNo}</Grid>
                  {statusData.totWt && (
                    <Grid item xs={6}><strong>Total Weight:</strong> {statusData.totWt} {statusData.totWtUom}</Grid>
                  )}
                </Grid>
              ) : (
                <Alert severity="error">
                  {statusData.response}
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
};

export default VGMStatus;