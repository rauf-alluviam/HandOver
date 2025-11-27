// src/components/Form13/Form13HeaderSection.jsx

import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { masterData, getTerminalCodes } from "../../data/masterData";

const Form13HeaderSection = ({
  formData,
  vessels,
  pods,
  masterDataLoaded,
  loading,
  onFormDataChange,
  onReloadMasterData,
  validationErrors = {},
}) => {
  const { cargoTypes, originTypes, containerStatuses, formTypes, portIds } =
    masterData;
    
  const inputProps = {
    size: "small",
    fullWidth: true,
    variant: "outlined",
  };
  const getVesselOptions = () => {
    return vessels.filter(
      (vessel) =>
        vessel.chaValidFrm &&
        vessel.chaValidTo &&
        new Date() >= new Date(vessel.chaValidFrm) &&
        new Date() <= new Date(vessel.chaValidTo)
    );
  };

  const getPODOptions = () => {
    if (
      !pods ||
      !Array.isArray(pods) ||
      !formData.locId ||
      !formData.terminalCode
    )
      return [];

    const location = pods.find((location) => location.locId === formData.locId);
    if (!location || !location.terminal || !Array.isArray(location.terminal))
      return [];

    const terminal = location.terminal.find(
      (terminal) => terminal.terminalId === formData.terminalCode
    );

    if (!terminal || !terminal.service || !Array.isArray(terminal.service))
      return [];

    const allPods = [];
    terminal.service.forEach((service) => {
      if (service.pod && Array.isArray(service.pod)) {
        allPods.push(...service.pod);
      }
    });

    return allPods;
  };

  const getAllPods = () => {
    if (!pods || !Array.isArray(pods)) return [];

    const allPods = [];
    pods.forEach((location) => {
      if (location.terminal && Array.isArray(location.terminal)) {
        location.terminal.forEach((terminal) => {
          if (terminal.service && Array.isArray(terminal.service)) {
            terminal.service.forEach((service) => {
              if (service.pod && Array.isArray(service.pod)) {
                allPods.push(...service.pod);
              }
            });
          }
        });
      }
    });
    return allPods;
  };

  const availableTerminalCodes = getTerminalCodes(formData.locId);

  return (
    <Box>
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        sx={{ mb: 2, color: "text.secondary", textTransform: "uppercase" }}
      >
        Header Information
      </Typography>

      <Grid container spacing={2}>
        {/* Row 1: Key Logistics Info */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <FormControl
            {...inputProps}
            required
            error={!!validationErrors.bnfCode}
          >
            <InputLabel>Shipping Line</InputLabel>
            <Select
              value={formData.bnfCode}
              label="Shipping Line"
              onChange={(e) =>
                onFormDataChange("header", "bnfCode", e.target.value)
              }
              disabled={!masterDataLoaded || loading}
            >
              {[...new Set(vessels.map((v) => v.bnfCode))].map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <FormControl
            {...inputProps}
            required
            error={!!validationErrors.locId}
          >
            <InputLabel>Location</InputLabel>
            <Select
              value={formData.locId}
              label="Location"
              onChange={(e) =>
                onFormDataChange("header", "locId", e.target.value)
              }
              disabled={!masterDataLoaded || loading}
            >
              {portIds.map((port) => (
                <MenuItem key={port.value} value={port.value}>
                  {port.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControl
            {...inputProps}
            required
            error={!!validationErrors.vesselNm}
          >
            <InputLabel>Vessel Name</InputLabel>
            <Select
              value={formData.vesselNm}
              label="Vessel Name"
              onChange={(e) =>
                onFormDataChange("header", "vesselNm", e.target.value)
              }
              disabled={!masterDataLoaded || loading || !formData.bnfCode}
            >
              {getVesselOptions().map((vessel) => (
                <MenuItem key={vessel.vesselNm} value={vessel.vesselNm}>
                  {vessel.vesselNm} {vessel.viaNo && `(${vessel.viaNo})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <FormControl
            {...inputProps}
            required
            error={!!validationErrors.viaNo}
          >
            <InputLabel>VIA No.</InputLabel>
            <Select
              value={formData.viaNo}
              label="VIA No."
              onChange={(e) =>
                onFormDataChange("header", "viaNo", e.target.value)
              }
            >
              {[...new Set(vessels.map((v) => v.viaNo))].map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <FormControl
            {...inputProps}
            required
            error={!!validationErrors.terminalCode}
          >
            <InputLabel>Terminal</InputLabel>
            <Select
              value={formData.terminalCode}
              label="Terminal"
              onChange={(e) =>
                onFormDataChange("header", "terminalCode", e.target.value)
              }
            >
              {[...new Set(vessels.map((v) => v.terminalCode))].map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Row 2: Cargo Details */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <FormControl
            {...inputProps}
            required
            error={!!validationErrors.service}
          >
            <InputLabel>Service</InputLabel>
            <Select
              value={formData.service}
              label="Service"
              onChange={(e) =>
                onFormDataChange("header", "service", e.target.value)
              }
            >
              {vessels
                .filter((v) => v.vesselNm === formData.vesselNm)
                .map((vessel) => (
                  <MenuItem key={vessel.service} value={vessel.service}>
                    {vessel.service}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControl {...inputProps} required error={!!validationErrors.pod}>
            <InputLabel>POD</InputLabel>
            <Select
              value={formData.pod}
              label="POD"
              onChange={(e) =>
                onFormDataChange("header", "pod", e.target.value)
              }
            >
              {getAllPods().map((pod) => (
                <MenuItem key={pod.podCd} value={pod.podCd}>
                  {pod.podNm} ({pod.podCd})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <FormControl
            {...inputProps}
            required
            error={!!validationErrors.cargoTp}
          >
            <InputLabel>Cargo Type</InputLabel>
            <Select
              value={formData.cargoTp}
              label="Cargo Type"
              onChange={(e) =>
                onFormDataChange("header", "cargoTp", e.target.value)
              }
            >
              {cargoTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <FormControl
            {...inputProps}
            required
            error={!!validationErrors.origin}
          >
            <InputLabel>Origin</InputLabel>
            <Select
              value={formData.origin}
              label="Origin"
              onChange={(e) =>
                onFormDataChange("header", "origin", e.target.value)
              }
            >
              {originTypes.map((origin) => (
                <MenuItem key={origin.value} value={origin.value}>
                  {origin.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Row 3: Parties & Contact */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <TextField
            {...inputProps}
            label="Shipper Name"
            value={formData.shipperNm}
            onChange={(e) =>
              onFormDataChange("header", "shipperNm", e.target.value)
            }
            required
            error={!!validationErrors.shipperNm}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <TextField
            {...inputProps}
            label="Mobile No"
            value={formData.mobileNo}
            onChange={(e) =>
              onFormDataChange("header", "mobileNo", e.target.value)
            }
            required
            error={!!validationErrors.mobileNo}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <FormControl {...inputProps} required>
            <InputLabel>Cont. Status</InputLabel>
            <Select
              value={formData.cntnrStatus}
              label="Cont. Status"
              onChange={(e) =>
                onFormDataChange("header", "cntnrStatus", e.target.value)
              }
            >
              {containerStatuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Conditional Fields (Dynamic Widths) */}
        {formData.origin === "C" && (
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <FormControl {...inputProps} required>
              <InputLabel>CFS Code</InputLabel>
              <Select
                value={formData.cfsCode}
                label="CFS Code"
                onChange={(e) =>
                  onFormDataChange("header", "cfsCode", e.target.value)
                }
              >
                <MenuItem value="CFS1">CFS 1</MenuItem>
                <MenuItem value="CFS2">CFS 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Form13HeaderSection;
