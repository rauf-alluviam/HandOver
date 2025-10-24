// src/components/VGMTabs.jsx
import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import VGMForm from './VGMForm';
import VGMStatus from './VGMStatus';
import Form13 from './Form13/Form13';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vgm-tabpanel-${index}`}
      aria-labelledby={`vgm-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const VGMTabs = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="VGM tabs">
          <Tab label="VGM Submission" />
          <Tab label="VGM Status" />
          <Tab label="Form 13" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <VGMForm />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <VGMStatus />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Form13 />
      </TabPanel>
    </Box>
  );
};

export default VGMTabs;