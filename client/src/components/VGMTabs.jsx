// src/components/VGM/VGMTabs.jsx
import React, { useState } from "react";
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
} from "@mui/material";
import VGMForm from "./VGMForm";
import VGMStatus from "./VGMStatus";

function TabPanel({ children, value, index, ...other }) {
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
}

const VGMTabs = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="VGM tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="VGM Declaration" 
            id="vgm-tab-0"
            aria-controls="vgm-tabpanel-0"
          />
          <Tab 
            label="VGM Status Check" 
            id="vgm-tab-1"
            aria-controls="vgm-tabpanel-1"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <VGMForm />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <VGMStatus />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default VGMTabs;