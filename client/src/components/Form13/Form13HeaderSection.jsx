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
}) => {
  const {
    cargoTypes,
    originTypes,
    containerStatuses,
    formTypes,
    portIds
  } = masterData;

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
    if (!formData.locId || !formData.terminalCode) return pods;
    return pods.filter(
      (pod) =>
        pod.locId === formData.locId && pod.terminalId === formData.terminalCode
    );
  };

  const availableTerminalCodes = getTerminalCodes(formData.locId);

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <InfoIcon sx={{ mr: 1 }} />
          Header Section - Vessel & Basic Information
        </Typography>

        <Grid container spacing={3}>
          {/* Shipping Line */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
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

          {/* Location */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
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

          {/* Vessel Name */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Vessel Name</InputLabel>
              <Select
                value={formData.vesselNm}
                label="Vessel Name"
                onChange={(e) =>
                  onFormDataChange("header", "vesselNm", e.target.value)
                }
                disabled={
                  !masterDataLoaded ||
                  loading ||
                  !formData.bnfCode ||
                  !formData.locId
                }
              >
                {getVesselOptions().map((vessel) => (
                  <MenuItem key={vessel.vesselNm} value={vessel.vesselNm}>
                    {vessel.vesselNm}
                    {vessel.viaNo && ` (VIA: ${vessel.viaNo})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* VIA No */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="VIA No"
              value={formData.viaNo}
              onChange={(e) =>
                onFormDataChange("header", "viaNo", e.target.value)
              }
              helperText="Voyage Identification Number"
            />
          </Grid>

          {/* Terminal Code */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Terminal Code</InputLabel>
              <Select
                value={formData.terminalCode}
                label="Terminal Code"
                onChange={(e) =>
                  onFormDataChange("header", "terminalCode", e.target.value)
                }
                disabled={!masterDataLoaded || loading || !formData.vesselNm}
              >
                {availableTerminalCodes.map((terminal) => (
                  <MenuItem key={terminal} value={terminal}>
                    {terminal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Service */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Service</InputLabel>
              <Select
                value={formData.service}
                label="Service"
                onChange={(e) =>
                  onFormDataChange("header", "service", e.target.value)
                }
                disabled={!masterDataLoaded || loading || !formData.vesselNm}
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

          {/* POD */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>POD</InputLabel>
              <Select
                value={formData.pod}
                label="POD"
                onChange={(e) =>
                  onFormDataChange("header", "pod", e.target.value)
                }
                disabled={
                  !masterDataLoaded ||
                  loading ||
                  !formData.locId ||
                  !formData.terminalCode
                }
              >
                {getPODOptions().map((pod) => (
                  <MenuItem key={pod.podCd} value={pod.podCd}>
                    {pod.podNm} ({pod.podCd})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* FPOD */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>FPOD</InputLabel>
              <Select
                value={formData.fpod}
                label="FPOD"
                onChange={(e) =>
                  onFormDataChange("header", "fpod", e.target.value)
                }
                disabled={!masterDataLoaded || loading}
              >
                {pods.map((pod) => (
                  <MenuItem key={pod.podCd} value={pod.podCd}>
                    {pod.podNm} ({pod.podCd})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Cargo Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
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

          {/* Origin */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
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

          {/* Form Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Form Type</InputLabel>
              <Select
                value={formData.formType}
                label="Form Type"
                onChange={(e) =>
                  onFormDataChange("header", "formType", e.target.value)
                }
              >
                {formTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Container Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Container Status</InputLabel>
              <Select
                value={formData.cntnrStatus}
                label="Container Status"
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

          {/* Additional Fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Booking No"
              value={formData.bookNo}
              onChange={(e) =>
                onFormDataChange("header", "bookNo", e.target.value)
              }
              required={formData.bnfCode === "MSC"}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="BL Number"
              value={formData.bookCopyBlNo}
              onChange={(e) =>
                onFormDataChange("header", "bookCopyBlNo", e.target.value)
              }
              required={
                formData.bnfCode === "Hapag Llyod" &&
                formData.cargoTp !== "Reefer"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mobile No"
              value={formData.mobileNo}
              onChange={(e) =>
                onFormDataChange("header", "mobileNo", e.target.value)
              }
              type="tel"
              inputProps={{ maxLength: 12 }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shipper Name"
              value={formData.shipperNm}
              onChange={(e) =>
                onFormDataChange("header", "shipperNm", e.target.value)
              }
              required
            />
          </Grid>

          {/* Conditional Fields based on location */}
          {(formData.locId === "INMAA1" ||
            formData.locId === "INPRT1" ||
            formData.locId === "INKAT1" ||
            formData.locId === "INCCU1" ||
            formData.locId === "INMUN1") && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Consignee Name"
                  value={formData.consigneeNm}
                  onChange={(e) =>
                    onFormDataChange("header", "consigneeNm", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Consignee Address"
                  value={formData.consigneeAddr}
                  onChange={(e) =>
                    onFormDataChange("header", "consigneeAddr", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cargo Description"
                  value={formData.cargoDesc}
                  onChange={(e) =>
                    onFormDataChange("header", "cargoDesc", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Terminal Login ID"
                  value={formData.terminalLoginId}
                  onChange={(e) =>
                    onFormDataChange(
                      "header",
                      "terminalLoginId",
                      e.target.value
                    )
                  }
                  required
                />
              </Grid>
            </>
          )}

          {/* Nhavasheva terminals conditional fields */}
          {formData.locId === "INNSA1" && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Nhavasheva Requirements (One of the following is required):
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="FF Code"
                    value={formData.FFCode}
                    onChange={(e) =>
                      onFormDataChange("header", "FFCode", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="IE Code"
                    value={formData.IECode}
                    onChange={(e) =>
                      onFormDataChange("header", "IECode", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="CHA Code"
                    value={formData.CHACode}
                    onChange={(e) =>
                      onFormDataChange("header", "CHACode", e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* Tuticorin specific field */}
          {formData.locId === "INTUT1" && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Shipper City"
                value={formData.ShipperCity}
                onChange={(e) =>
                  onFormDataChange("header", "ShipperCity", e.target.value)
                }
                required
              />
            </Grid>
          )}

          {/* Early Gate In Check for CMA */}
          {formData.bnfCode === "CMA" && formData.locId === "INMUN1" && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Early Gate In</InputLabel>
                <Select
                  value={formData.IsEarlyGateIn}
                  label="Early Gate In"
                  onChange={(e) =>
                    onFormDataChange("header", "IsEarlyGateIn", e.target.value)
                  }
                >
                  <MenuItem value="Y">Yes</MenuItem>
                  <MenuItem value="N">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Optional Fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shipping Instruction No"
              value={formData.shpInstructNo}
              onChange={(e) =>
                onFormDataChange("header", "shpInstructNo", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email IDs (comma separated)"
              value={formData.email_Id}
              onChange={(e) =>
                onFormDataChange("header", "email_Id", e.target.value)
              }
              helperText="For notifications, comma separated with no spaces"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Notify To"
              value={formData.Notify_TO}
              onChange={(e) =>
                onFormDataChange("header", "Notify_TO", e.target.value)
              }
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Form13HeaderSection;