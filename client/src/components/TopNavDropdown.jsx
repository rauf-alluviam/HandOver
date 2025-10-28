import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const TopNavDropdown = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathToValue = (pathname) => {
    if (pathname.startsWith('/form13')) return 'form13';
    if (pathname.startsWith('/vgm-status')) return 'status';
    // default submission
    return 'submission';
  };

  const value = pathToValue(location.pathname);

  const handleChange = (event) => {
    const v = event.target.value;
    if (v === 'submission') navigate('/vgm');
    if (v === 'status') navigate('/vgm-status');
    if (v === 'form13') navigate('/form13');
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="top-nav-select-label">Navigate</InputLabel>
        <Select
          labelId="top-nav-select-label"
          id="top-nav-select"
          value={value}
          label="Navigate"
          onChange={handleChange}
        >
          <MenuItem value="submission">VGM Submission</MenuItem>
          <MenuItem value="status">VGM Status</MenuItem>
          <MenuItem value="form13">Form 13</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default TopNavDropdown;
