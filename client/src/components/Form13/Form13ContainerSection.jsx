// src/components/Form13/Form13ContainerSection.jsx
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
  Button,
  IconButton,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { masterData, getIsoCodesBySize } from "../../data/masterData";

const Form13ContainerSection = ({
  formData,
  onFormDataChange,
  onAddContainer,
  onRemoveContainer,
}) => {
  const {
    containerSizes,
    specialStowOptions,
    odcUnits,
    imoNumbers
  } = masterData;

  const renderContainerFields = (container, index) => {
    const availableIsoCodes = getIsoCodesBySize(container.cntnrSize);

    return (
      <Card
        key={index}
        sx={{ mb: 3, border: "1px solid", borderColor: "divider" }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Container {index + 1}</Typography>
            {formData.containers.length > 1 && (
              <IconButton
                color="error"
                onClick={() => onRemoveContainer(index)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <Grid container spacing={2}>
            {/* Container Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Container No"
                value={container.cntnrNo}
                onChange={(e) =>
                  onFormDataChange("containers", "cntnrNo", e.target.value, index)
                }
                required
                inputProps={{ 
                  pattern: "[A-Za-z]{4}[0-9]{7}",
                  maxLength: 11
                }}
                helperText="Format: 4 letters + 7 numbers"
              />
            </Grid>

            {/* Container Size */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Container Size</InputLabel>
                <Select
                  value={container.cntnrSize}
                  label="Container Size"
                  onChange={(e) =>
                    onFormDataChange(
                      "containers",
                      "cntnrSize",
                      e.target.value,
                      index
                    )
                  }
                >
                  {containerSizes.map((size) => (
                    <MenuItem key={size.value} value={size.value}>
                      {size.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* ISO Code */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>ISO Code</InputLabel>
                <Select
                  value={container.iso}
                  label="ISO Code"
                  onChange={(e) =>
                    onFormDataChange("containers", "iso", e.target.value, index)
                  }
                >
                  {availableIsoCodes.map((iso) => (
                    <MenuItem key={iso.value} value={iso.value}>
                      {iso.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Agent Seal No */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Agent Seal No"
                value={container.agentSealNo}
                onChange={(e) =>
                  onFormDataChange(
                    "containers",
                    "agentSealNo",
                    e.target.value,
                    index
                  )
                }
                required
              />
            </Grid>

            {/* Custom Seal No */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Custom Seal No"
                value={container.customSealNo}
                onChange={(e) =>
                  onFormDataChange(
                    "containers",
                    "customSealNo",
                    e.target.value,
                    index
                  )
                }
                required
              />
            </Grid>

            {/* VGM via ODeX */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>VGM via ODeX</InputLabel>
                <Select
                  value={container.vgmViaODeX}
                  label="VGM via ODeX"
                  onChange={(e) =>
                    onFormDataChange(
                      "containers",
                      "vgmViaODeX",
                      e.target.value,
                      index
                    )
                  }
                >
                  <MenuItem value="Y">Yes</MenuItem>
                  <MenuItem value="N">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* VGM Weight (conditional) */}
            {container.vgmViaODeX === "N" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="VGM (MT)"
                  type="number"
                  value={container.vgmWt}
                  onChange={(e) =>
                    onFormDataChange("containers", "vgmWt", e.target.value, index)
                  }
                  required
                  inputProps={{ step: "0.01", min: "0" }}
                  helperText="Weight in Metric Tons"
                />
              </Grid>
            )}

            {/* Driver Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Driver Name"
                value={container.driverNm}
                onChange={(e) =>
                  onFormDataChange(
                    "containers",
                    "driverNm",
                    e.target.value,
                    index
                  )
                }
                required
              />
            </Grid>

            {/* Vehicle No (conditional for Mundra) */}
            {formData.locId === "INMUN1" &&
              (formData.origin === "F" || formData.origin === "R") && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vehicle No"
                    value={container.vehicleNo}
                    onChange={(e) =>
                      onFormDataChange(
                        "containers",
                        "vehicleNo",
                        e.target.value,
                        index
                      )
                    }
                    required
                  />
                </Grid>
              )}

            {/* Special Stow (conditional for NSICT/NSIGT/BMCT) */}
            {formData.locId === "INNSA1" &&
              ["NSICT", "NSIGT", "BMCT"].includes(formData.terminalCode) && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Special Stow</InputLabel>
                      <Select
                        value={container.spclStow}
                        label="Special Stow"
                        onChange={(e) =>
                          onFormDataChange(
                            "containers",
                            "spclStow",
                            e.target.value,
                            index
                          )
                        }
                      >
                        {specialStowOptions.map((stow) => (
                          <MenuItem key={stow.value} value={stow.value}>
                            {stow.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Special Stow Remark"
                      value={container.spclStowRemark}
                      onChange={(e) =>
                        onFormDataChange(
                          "containers",
                          "spclStowRemark",
                          e.target.value,
                          index
                        )
                      }
                      required
                    />
                  </Grid>
                </>
              )}

            {/* Hazardous Fields (conditional) */}
            {formData.cargoTp.includes("HAZ") && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="warning.main">
                    Hazardous Cargo Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>IMO No 1</InputLabel>
                    <Select
                      value={container.imoNo1}
                      label="IMO No 1"
                      onChange={(e) =>
                        onFormDataChange(
                          "containers",
                          "imoNo1",
                          e.target.value,
                          index
                        )
                      }
                    >
                      {imoNumbers.map((imo) => (
                        <MenuItem key={imo.value} value={imo.value}>
                          {imo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="UN No 1"
                    value={container.unNo1}
                    onChange={(e) =>
                      onFormDataChange(
                        "containers",
                        "unNo1",
                        e.target.value,
                        index
                      )
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>IMO No 2</InputLabel>
                    <Select
                      value={container.imoNo2}
                      label="IMO No 2"
                      onChange={(e) =>
                        onFormDataChange(
                          "containers",
                          "imoNo2",
                          e.target.value,
                          index
                        )
                      }
                    >
                      {imoNumbers.map((imo) => (
                        <MenuItem key={imo.value} value={imo.value}>
                          {imo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="UN No 2"
                    value={container.unNo2}
                    onChange={(e) =>
                      onFormDataChange(
                        "containers",
                        "unNo2",
                        e.target.value,
                        index
                      )
                    }
                  />
                </Grid>
              </>
            )}

            {/* Reefer Fields (conditional) */}
            {formData.cargoTp.includes("REF") && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="info.main">
                    Reefer Cargo Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Temperature"
                    value={container.temp}
                    onChange={(e) =>
                      onFormDataChange(
                        "containers",
                        "temp",
                        e.target.value,
                        index
                      )
                    }
                    required
                    helperText="Temperature setting"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Voltage"
                    value={container.volt}
                    onChange={(e) =>
                      onFormDataChange(
                        "containers",
                        "volt",
                        e.target.value,
                        index
                      )
                    }
                    required
                    helperText="Voltage setting"
                  />
                </Grid>
              </>
            )}

            {/* ODC Fields (conditional) */}
            {formData.cargoTp.includes("ODC") && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="secondary.main">
                    ODC Cargo Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Right Dimensions"
                    value={container.rightDimensions}
                    onChange={(e) =>
                      onFormDataChange(
                        "containers",
                        "rightDimensions",
                        e.target.value,
                        index
                      )
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Top Dimensions"
                    value={container.topDimensions}
                    onChange={(e) =>
                      onFormDataChange(
                        "containers",
                        "topDimensions",
                        e.target.value,
                        index
                      )
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Back Dimensions"
                    value={container.backDimensions}
                    onChange={(e) =>
                      onFormDataChange(
                        "containers",
                        "backDimensions",
                        e.target.value,
                        index
                      )
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Left Dimensions"
                    value={container.leftDimensions}
                    onChange={(e) =>
                      onFormDataChange(
                        "containers",
                        "leftDimensions",
                        e.target.value,
                        index
                      )
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Front Dimensions"
                    value={container.frontDimensions}
                    onChange={(e) =>
                      onFormDataChange(
                        "containers",
                        "frontDimensions",
                        e.target.value,
                        index
                      )
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>ODC Units</InputLabel>
                    <Select
                      value={container.odcUnits}
                      label="ODC Units"
                      onChange={(e) =>
                        onFormDataChange(
                          "containers",
                          "odcUnits",
                          e.target.value,
                          index
                        )
                      }
                    >
                      {odcUnits.map((unit) => (
                        <MenuItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Optional Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DO Number"
                value={container.doNo}
                onChange={(e) =>
                  onFormDataChange("containers", "doNo", e.target.value, index)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CHA Remarks"
                value={container.chaRemarks}
                onChange={(e) =>
                  onFormDataChange(
                    "containers",
                    "chaRemarks",
                    e.target.value,
                    index
                  )
                }
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Haulier"
                value={container.haulier}
                onChange={(e) =>
                  onFormDataChange("containers", "haulier", e.target.value, index)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Driver License No"
                value={container.driverLicNo}
                onChange={(e) =>
                  onFormDataChange(
                    "containers",
                    "driverLicNo",
                    e.target.value,
                    index
                  )
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6">Container Information</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddContainer}
          >
            Add Container
          </Button>
        </Box>

        {formData.containers.map((container, index) =>
          renderContainerFields(container, index)
        )}

        <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong>
            <br />• Container number must follow standard format: 4 letters + 7 numbers
            <br />• VGM weight is required if not submitted via ODeX
            <br />• Hazardous, Reefer, and ODC fields are conditionally required based on cargo type
            <br />• Special stow requirements are mandatory for NSICT/NSIGT/BMCT terminals
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Form13ContainerSection;