// src/components/VGMForm/VGMForm.jsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import { vgmAPI } from '../services/api';
import { vgmValidationSchema } from '../utils/validation';
import { generateVGMHash } from '../utils/hashUtils';
import { validateFile, fileToBase64 } from '../utils/fileUtils';
import {
  CONTAINER_SIZES, CARGO_TYPES, VGM_METHODS, SHIPPER_TYPES, WEIGHT_UOMS, REGISTRATION_TYPES,
  ATTACHMENT_TITLES, PORTS, LINERS, IMO_NUMBERS,
} from '../utils/constants/masterData.js';

const VGMForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { userData, shippers } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const formik = useFormik({
    initialValues: {
      linerId: '',
      vesselNm: '',
      voyageNo: '',
      bookNo: '',
      locId: '',
      handoverLoc: '',
      shipperTp: 'S',
      authPrsnNm: '',
      authDesignation: '',
      authMobNo: '',
      vgmEvalMethod: 'M1',
      cntnrNo: '',
      cntnrSize: '',
      cntnrTp: '',
      cargoTp: 'GEN',
      cscPlateMaxWtLimit: '',
      cscPlateMaxWtUom: 'KG',
      isQuickResponse: 'N',
      cargoWt: '',
      cargoWtUom: 'KG',
      tareWt: '',
      tareWtUom: 'KG',
      totWt: '',
      totWtUom: 'KG',
      imoNo1: '',
      unNo1: '',
      shipId: '',
      shipperNm: '',
      shipRegTp: '',
      shipRegNo: '',
      weighBridgeRegNo: '',
      weighBridgeAddrLn1: '',
      weighBridgeAddrLn2: '',
      weighBridgeAddrLn3: '',
      weighBridgeSlipNo: '',
      weighBridgeWtTs: new Date().toISOString().slice(0, 19).replace('T', ' '),
      odexRefNo: userData?.odexRefNo || 'TEST_REF_001',
      hashKey: '',
      useEncryption: false,
      terminalCode: '',
    },
    validationSchema: vgmValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = { ...values };
        if (values.cargoTp !== 'HAZ') {
          delete payload.imoNo1;
          delete payload.unNo1;
        }
        if (values.shipperTp === 'S' || values.hasShipperAuth) {
          delete payload.shipperNm;
          delete payload.shipRegTp;
          delete payload.shipRegNo;
        }
        if (attachments.length > 0) payload.vgmWbAttList = attachments;
        if (values.useEncryption) {
          const secretKey = process.env.VITE_ODEX_SECRET_KEY || 'test-secret-key';
          payload.hashKey = generateVGMHash(
            values.cntnrNo,
            values.totWt,
            values.odexRefNo,
            values.weighBridgeSlipNo,
            secretKey
          );
        }
        const response = await vgmAPI.submit(payload);
        if (response.data) {
          enqueueSnackbar(`VGM submitted successfully! VGM ID: ${response.data.vgmId}`, {
            variant: 'success',
            autoHideDuration: 10000,
          });
        }
      } catch (error) {
        console.error('VGM submission error:', error);
        const errorMessage = error.response?.data?.message || 'VGM submission failed. Please try again.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      enqueueSnackbar(validationErrors.join(', '), { variant: 'error' });
      return;
    }
    try {
      const base64Data = await fileToBase64(file);
      setAttachments([...attachments, {
        attNm: file.name,
        attData: base64Data,
        attTitle: 'WT_DECLARATION',
      }]);
      enqueueSnackbar('File uploaded successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error processing file', { variant: 'error' });
    }
  };

  const hasShipperAuth = shippers.some(shipper =>
    shipper.shipperId === formik.values.shipId &&
    shipper.serviceNm === 'VGM'
  );

  const removeAttachment = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    enqueueSnackbar('File removed successfully', { variant: 'info' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
      {/* Header Alert */}
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dear Customer,</strong> we would like to inform you that post tips Pay is no credit facility would be provided for VGM subscriptions and hence request you to renew the VGM subscriptions on a timely basis along with the payment details. Kindly pay the VGM Subscription charges, to avoid discontinuation or VGM submission. 
          <Button color="inherit" size="small" sx={{ ml: 1, fontWeight: 'bold' }}>
            Click Here for VGM Subscription
          </Button>
        </Typography>
      </Alert>

      <Paper elevation={2} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
          VGM Declaration Form
        </Typography>
        
        <Box component="form" onSubmit={formik.handleSubmit}>
          {/* Shipper & Booking Details Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
                Shipper / Booking Details
              </Typography>
              
              <Grid container spacing={2}>
                {/* First Row */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Shipping Line</InputLabel>
                    <Select name="linerId" value={formik.values.linerId}
                      onChange={formik.handleChange}
                      error={formik.touched.linerId && Boolean(formik.errors.linerId)}>
                      {LINERS.map(liner => (
                        <MenuItem key={liner.value} value={liner.value}>{liner.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" name="vesselNm" label="Vessel Name"
                    value={formik.values.vesselNm}
                    onChange={formik.handleChange}
                    error={formik.touched.vesselNm && Boolean(formik.errors.vesselNm)}
                    helperText={formik.touched.vesselNm && formik.errors.vesselNm} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" name="voyageNo" label="Voyage Number"
                    value={formik.values.voyageNo}
                    onChange={formik.handleChange}
                    error={formik.touched.voyageNo && Boolean(formik.errors.voyageNo)}
                    helperText={formik.touched.voyageNo && formik.errors.voyageNo} />
                </Grid>

                {/* Second Row */}
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" name="bookNo" label="Booking Number *"
                    value={formik.values.bookNo}
                    onChange={formik.handleChange}
                    error={formik.touched.bookNo && Boolean(formik.errors.bookNo)}
                    helperText={formik.touched.bookNo && formik.errors.bookNo} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Port *</InputLabel>
                    <Select name="locId" value={formik.values.locId}
                      onChange={formik.handleChange}
                      error={formik.touched.locId && Boolean(formik.errors.locId)}>
                      {PORTS.map(port => (
                        <MenuItem key={port.value} value={port.value}>{port.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Terminal</InputLabel>
                    <Select name="terminalCode" value={formik.values.terminalCode}
                      onChange={formik.handleChange}>
                      <MenuItem value="T1">Terminal 1</MenuItem>
                      <MenuItem value="T2">Terminal 2</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Shipper Information */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Shipper Type *</InputLabel>
                    <Select name="shipperTp" value={formik.values.shipperTp}
                      onChange={formik.handleChange}>
                      {SHIPPER_TYPES.map(type => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {formik.values.shipperTp === 'O' && (
                  <>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Shipper</InputLabel>
                        <Select name="shipId" value={formik.values.shipId}
                          onChange={formik.handleChange}>
                          {shippers.map(shipper => (
                            <MenuItem key={shipper.shipperId} value={shipper.shipperId}>
                              {shipper.shipperNm}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {!hasShipperAuth && (
                      <>
                        <Grid item xs={12} md={4}>
                          <TextField fullWidth size="small" name="shipperNm" label="Shipper Name *"
                            value={formik.values.shipperNm}
                            onChange={formik.handleChange}
                            error={formik.touched.shipperNm && Boolean(formik.errors.shipperNm)}
                            helperText={formik.touched.shipperNm && formik.errors.shipperNm} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Registration Type *</InputLabel>
                            <Select name="shipRegTp" value={formik.values.shipRegTp}
                              onChange={formik.handleChange}>
                              {REGISTRATION_TYPES.map(type => (
                                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField fullWidth size="small" name="shipRegNo" label="Registration Number *"
                            value={formik.values.shipRegNo}
                            onChange={formik.handleChange}
                            error={formik.touched.shipRegNo && Boolean(formik.errors.shipRegNo)}
                            helperText={formik.touched.shipRegNo && formik.errors.shipRegNo} />
                        </Grid>
                      </>
                    )}
                  </>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Authorized Person */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Authorized Person
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" name="authPrsnNm" label="Name *"
                    value={formik.values.authPrsnNm}
                    onChange={formik.handleChange}
                    error={formik.touched.authPrsnNm && Boolean(formik.errors.authPrsnNm)}
                    helperText={formik.touched.authPrsnNm && formik.errors.authPrsnNm} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" name="authDesignation" label="Designation *"
                    value={formik.values.authDesignation}
                    onChange={formik.handleChange}
                    error={formik.touched.authDesignation && Boolean(formik.errors.authDesignation)}
                    helperText={formik.touched.authDesignation && formik.errors.authDesignation} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" name="authMobNo" label="Mobile Number *"
                    value={formik.values.authMobNo}
                    onChange={formik.handleChange}
                    error={formik.touched.authMobNo && Boolean(formik.errors.authMobNo)}
                    helperText={formik.touched.authMobNo && formik.errors.authMobNo} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Container Details Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
                Container Details
              </Typography>

              {/* VGM Evaluation Method */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  VGM Evaluation Method
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Select Method *</InputLabel>
                  <Select name="vgmEvalMethod" value={formik.values.vgmEvalMethod}
                    onChange={formik.handleChange}>
                    {VGM_METHODS.map(method => (
                      <MenuItem key={method.value} value={method.value}>{method.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
                  {formik.values.vgmEvalMethod === 'M1' 
                    ? 'Method 1: The container is weighed after the completion of packing using calibrated and certified equipment.'
                    : 'Method 2: The container is weighed by adding the known weight of all packages/pallets etc. and securing materials to the tare mass of the container.'
                  }
                </Typography>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Note: Method 2 can only be selected by Shipper authorized by DC Shipping. Kindly contact CDGA Support for further help.
                  </Typography>
                </Alert>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" name="cntnrNo" label="Container Number *"
                    value={formik.values.cntnrNo}
                    onChange={formik.handleChange}
                    error={formik.touched.cntnrNo && Boolean(formik.errors.cntnrNo)}
                    helperText={formik.touched.cntnrNo && formik.errors.cntnrNo} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Container Size *</InputLabel>
                    <Select name="cntnrSize" value={formik.values.cntnrSize}
                      onChange={formik.handleChange}
                      error={formik.touched.cntnrSize && Boolean(formik.errors.cntnrSize)}>
                      {CONTAINER_SIZES.map(size => (
                        <MenuItem key={size.value} value={size.value}>{size.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Cargo Type *</InputLabel>
                    <Select name="cargoTp" value={formik.values.cargoTp}
                      onChange={formik.handleChange}>
                      {CARGO_TYPES.map(type => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" name="cscPlateMaxWtLimit" type="number"
                    label="CSC Plate Max Weight Limit *"
                    value={formik.values.cscPlateMaxWtLimit}
                    onChange={formik.handleChange}
                    error={formik.touched.cscPlateMaxWtLimit && Boolean(formik.errors.cscPlateMaxWtLimit)}
                    helperText={formik.touched.cscPlateMaxWtLimit && formik.errors.cscPlateMaxWtLimit} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Weight UOM</InputLabel>
                    <Select name="cscPlateMaxWtUom" value={formik.values.cscPlateMaxWtUom}
                      onChange={formik.handleChange}>
                      {WEIGHT_UOMS.map(uom => (
                        <MenuItem key={uom.value} value={uom.value}>{uom.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Hazardous Cargo Fields */}
                {formik.values.cargoTp === 'HAZ' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>IMO Number *</InputLabel>
                        <Select name="imoNo1" value={formik.values.imoNo1}
                          onChange={formik.handleChange}>
                          {IMO_NUMBERS.map(imo => (
                            <MenuItem key={imo.value} value={imo.value}>{imo.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth size="small" name="unNo1" label="UN Number *"
                        value={formik.values.unNo1}
                        onChange={formik.handleChange}
                        error={formik.touched.unNo1 && Boolean(formik.errors.unNo1)}
                        helperText={formik.touched.unNo1 && formik.errors.unNo1} />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Weighment Details Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
                Weighment Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" name="totWt" type="number"
                    label="Total Weight *"
                    value={formik.values.totWt}
                    onChange={formik.handleChange}
                    error={formik.touched.totWt && Boolean(formik.errors.totWt)}
                    helperText={formik.touched.totWt && formik.errors.totWt} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Weight UOM *</InputLabel>
                    <Select name="totWtUom" value={formik.values.totWtUom}
                      onChange={formik.handleChange}>
                      {WEIGHT_UOMS.map(uom => (
                        <MenuItem key={uom.value} value={uom.value}>{uom.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" name="weighBridgeRegNo"
                    label="Weigh Bridge Registration No. *"
                    value={formik.values.weighBridgeRegNo}
                    onChange={formik.handleChange}
                    error={formik.touched.weighBridgeRegNo && Boolean(formik.errors.weighBridgeRegNo)}
                    helperText={formik.touched.weighBridgeRegNo && formik.errors.weighBridgeRegNo} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" name="weighBridgeSlipNo"
                    label="Weigh Bridge Slip No. *"
                    value={formik.values.weighBridgeSlipNo}
                    onChange={formik.handleChange}
                    error={formik.touched.weighBridgeSlipNo && Boolean(formik.errors.weighBridgeSlipNo)}
                    helperText={formik.touched.weighBridgeSlipNo && formik.errors.weighBridgeSlipNo} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" name="weighBridgeAddrLn1"
                    label="Address Line 1 *"
                    value={formik.values.weighBridgeAddrLn1}
                    onChange={formik.handleChange}
                    error={formik.touched.weighBridgeAddrLn1 && Boolean(formik.errors.weighBridgeAddrLn1)}
                    helperText={formik.touched.weighBridgeAddrLn1 && formik.errors.weighBridgeAddrLn1} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" name="weighBridgeAddrLn2"
                    label="Address Line 2"
                    value={formik.values.weighBridgeAddrLn2}
                    onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" name="weighBridgeAddrLn3"
                    label="Address Line 3"
                    value={formik.values.weighBridgeAddrLn3}
                    onChange={formik.handleChange} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" name="weighBridgeWtTs"
                    type="datetime-local"
                    label="Date & Time of Weighing *"
                    value={formik.values.weighBridgeWtTs.replace(' ', 'T')}
                    onChange={e => formik.setFieldValue('weighBridgeWtTs', e.target.value.replace('T', ' '))}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
                Attachments
              </Typography>

              <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                <input
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button variant="outlined" component="span" startIcon={<span>📎</span>}>
                    Upload Document (Max 5MB)
                  </Button>
                </label>
                
                {attachments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Uploaded Files:</Typography>
                    {attachments.map((att, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{att.attNm}</Typography>
                        <Button 
                          size="small" 
                          color="error" 
                          onClick={() => removeAttachment(index)}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card variant="outlined">
            <CardContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please review all information before submission. Once submitted, changes cannot be made.
              </Alert>
              
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

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit VGM'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Container>
  );
};

export default VGMForm;