// src/components/Form13/Form13ShippingBillSection.jsx
import React from 'react';
import {
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';

const Form13ShippingBillSection = ({ formData, onFormDataChange }) => {
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Shipping Bill Information
        </Typography>

        <Grid container spacing={3}>
          {/* Shipping Bill/Invoice No */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shipping Bill/Invoice No"
              value={formData.shippingBills[0]?.shipBillInvNo || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'shipBillInvNo', e.target.value, 0)}
              required
            />
          </Grid>

          {/* Shipping Bill Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shipping Bill Date"
              type="date"
              value={formData.shippingBills[0]?.shipBillDt || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'shipBillDt', e.target.value, 0)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          {/* LEO No */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="LEO No"
              value={formData.shippingBills[0]?.leoNo || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'leoNo', e.target.value, 0)}
              required
            />
          </Grid>

          {/* LEO Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="LEO Date"
              type="date"
              value={formData.shippingBills[0]?.leoDt || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'leoDt', e.target.value, 0)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          {/* CHA Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CHA Name"
              value={formData.shippingBills[0]?.chaNm || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'chaNm', e.target.value, 0)}
              required
            />
          </Grid>

          {/* CHA PAN */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CHA PAN"
              value={formData.shippingBills[0]?.chaPan || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'chaPan', e.target.value, 0)}
              required
              inputProps={{ pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}' }}
              helperText="Format: ABCDE1234F"
            />
          </Grid>

          {/* Exporter Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Exporter Name"
              value={formData.shippingBills[0]?.exporterNm || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'exporterNm', e.target.value, 0)}
              required
            />
          </Grid>

          {/* Exporter IEC */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Exporter IEC"
              value={formData.shippingBills[0]?.exporterIec || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'exporterIec', e.target.value, 0)}
              required
            />
          </Grid>

          {/* Number of Packages */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="No. of Packages"
              type="number"
              value={formData.shippingBills[0]?.noOfPkg || ''}
              onChange={(e) => onFormDataChange('shippingBills', 'noOfPkg', e.target.value, 0)}
              required
              inputProps={{ min: "1" }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Shipping Bill Requirements:</strong>
            <br />• All fields are mandatory for customs documentation
            <br />• LEO (Let Export Order) number and date are required
            <br />• CHA PAN must be in valid format (10 characters)
            <br />• Exporter IEC code is mandatory for export documentation
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Form13ShippingBillSection;