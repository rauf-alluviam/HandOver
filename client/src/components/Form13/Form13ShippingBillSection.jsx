// src/components/Form13/Form13ShippingBillSection.jsx

import React from "react";
import {
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
} from "@mui/material";

const Form13ShippingBillSection = ({
  formData,
  containerIndex = 0,
  onFormDataChange,
  validationErrors = {},
}) => {
  const container = formData.containers?.[containerIndex];
  const shippingBill = container?.sbDtlsVo?.[0] || {};

  const inputProps = {
    size: "small",
    fullWidth: true,
    variant: "outlined",
  };

  if (!container) {
    return (
      <Alert severity="error">
        Container data not found for index {containerIndex}
      </Alert>
    );
  }

  return (
    <Grid container spacing={1.5}>
      {/* SB Number */}
      <Grid item xs={12} sm={6} md={3} lg={2}>
        <TextField
          {...inputProps}
          label="SB/Inv No *"
          value={shippingBill.shipBillInvNo || ""}
          onChange={(e) =>
            onFormDataChange(
              "shippingBills",
              "shipBillInvNo",
              e.target.value,
              containerIndex
            )
          }
          required
          error={
            !!validationErrors[`container_${containerIndex}_shipBillInvNo`]
          }
        />
      </Grid>

      {/* SB Date */}
      <Grid item xs={12} sm={6} md={3} lg={2}>
        <TextField
          {...inputProps}
          type="date"
          label="SB Date *"
          value={shippingBill.shipBillDt || ""}
          onChange={(e) =>
            onFormDataChange(
              "shippingBills",
              "shipBillDt",
              e.target.value,
              containerIndex
            )
          }
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>

      {/* Exporter Name */}
      <Grid item xs={12} sm={6} md={3} lg={2.5}>
        <TextField
          {...inputProps}
          label="Exporter Name *"
          value={shippingBill.exporterNm || ""}
          onChange={(e) =>
            onFormDataChange(
              "shippingBills",
              "exporterNm",
              e.target.value,
              containerIndex
            )
          }
          required
        />
      </Grid>

      {/* Exporter IEC */}
      <Grid item xs={12} sm={6} md={3} lg={1.5}>
        <TextField
          {...inputProps}
          label="Exporter IEC *"
          value={shippingBill.exporterIec || ""}
          onChange={(e) =>
            onFormDataChange(
              "shippingBills",
              "exporterIec",
              e.target.value,
              containerIndex
            )
          }
          required
        />
      </Grid>

      {/* CHA Name */}
      <Grid item xs={12} sm={6} md={3} lg={2}>
        <TextField
          {...inputProps}
          label="CHA Name *"
          value={shippingBill.chaNm || ""}
          onChange={(e) =>
            onFormDataChange(
              "shippingBills",
              "chaNm",
              e.target.value,
              containerIndex
            )
          }
          required
        />
      </Grid>

      {/* CHA PAN */}
      <Grid item xs={12} sm={6} md={3} lg={1.5}>
        <TextField
          {...inputProps}
          label="CHA PAN *"
          value={shippingBill.chaPan || ""}
          onChange={(e) =>
            onFormDataChange(
              "shippingBills",
              "chaPan",
              e.target.value.toUpperCase(),
              containerIndex
            )
          }
          required
        />
      </Grid>

      {/* No of Packages */}
      <Grid item xs={12} sm={6} md={2} lg={1}>
        <TextField
          {...inputProps}
          type="number"
          label="Pkgs *"
          value={shippingBill.noOfPkg || ""}
          onChange={(e) =>
            onFormDataChange(
              "shippingBills",
              "noOfPkg",
              parseInt(e.target.value) || 0,
              containerIndex
            )
          }
          required
        />
      </Grid>

      {/* LEO Details (Optional/Conditional) */}
      <Grid item xs={12} sm={6} md={2} lg={1.5}>
        <TextField
          {...inputProps}
          label="LEO No"
          value={shippingBill.leoNo || ""}
          onChange={(e) =>
            onFormDataChange(
              "shippingBills",
              "leoNo",
              e.target.value,
              containerIndex
            )
          }
        />
      </Grid>
    </Grid>
  );
};
export default Form13ShippingBillSection;
