// src/components/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { loginValidationSchema } from '../utils/validation';
import { generateLoginHash } from '../utils/hashUtils';

const Login = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      pyrCode: '',
      fromTs: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      hashKey: '',
      useEncryption: false,
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          pyrCode: values.pyrCode,
          fromTs: values.fromTs,
        };

        if (values.useEncryption) {
          // In real implementation, secretKey would come from environment or configuration
          const secretKey = process.env.VITE_ODEX_SECRET_KEY || 'test-secret-key';
          payload.hashKey = generateLoginHash(values.pyrCode, values.fromTs, secretKey);
        }

        const response = await authAPI.login(payload);
        
        if (response.data && Array.isArray(response.data)) {
          login(
            { pyrCode: values.pyrCode },
            response.data
          );
          
          enqueueSnackbar('Login successful!', { variant: 'success' });
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            ODeX VGM System
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
            Sign In
          </Typography>

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="pyrCode"
              label="CHA Name / Payor Code"
              name="pyrCode"
              autoComplete="pyrCode"
              autoFocus
              value={formik.values.pyrCode}
              onChange={formik.handleChange}
              error={formik.touched.pyrCode && Boolean(formik.errors.pyrCode)}
              helperText={formik.touched.pyrCode && formik.errors.pyrCode}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="fromTs"
              label="Time Stamp"
              name="fromTs"
              value={formik.values.fromTs}
              onChange={formik.handleChange}
              error={formik.touched.fromTs && Boolean(formik.errors.fromTs)}
              helperText={formik.touched.fromTs && formik.errors.fromTs}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="useEncryption"
                  checked={formik.values.useEncryption}
                  onChange={formik.handleChange}
                  color="primary"
                />
              }
              label="Use Encryption (Hash Key)"
            />

            {formik.values.useEncryption && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="hashKey"
                label="Hash Key"
                type="text"
                id="hashKey"
                value={formik.values.hashKey}
                onChange={formik.handleChange}
                error={formik.touched.hashKey && Boolean(formik.errors.hashKey)}
                helperText={formik.touched.hashKey && formik.errors.hashKey}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;