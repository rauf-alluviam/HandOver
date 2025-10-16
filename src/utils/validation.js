// src/utils/validation.js
import * as Yup from 'yup';

export const containerNoRegex = /^[A-Z]{4}\d{7}$/;
export const panNoRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;

export const loginValidationSchema = Yup.object({
  pyrCode: Yup.string().required('CHA Name is required').max(200, 'Max 200 characters allowed'),
  fromTs: Yup.string().required('Time Stamp is required'),
  hashKey: Yup.string().when('$useEncryption', {
    is: true,
    then: Yup.string().required('Hash Key is required when encryption is enabled'),
  }),
});

export const vgmValidationSchema = Yup.object({
  linerId: Yup.string().required('Liner ID is required').max(10, 'Max 10 characters allowed'),
  bookNo: Yup.string().required('Booking Number is required').max(20, 'Max 20 characters allowed'),
  locId: Yup.string().required('Port ID is required').max(10, 'Max 10 characters allowed'),
  shipperTp: Yup.string().required('Shipper Type is required').max(10, 'Max 10 characters allowed'),
  authPrsnNm: Yup.string().required('Authorized Person Name is required').max(200, 'Max 200 characters allowed'),
  authDesignation: Yup.string().required('Designation is required').max(200, 'Max 200 characters allowed'),
  authMobNo: Yup.string()
    .required('Mobile Number is required')
    .matches(/^\d+$/, 'Mobile number must contain only digits')
    .max(50, 'Max 50 characters allowed'),
  vgmEvalMethod: Yup.string().required('VGM Evaluation Method is required').max(20, 'Max 20 characters allowed'),
  cntnrNo: Yup.string()
    .required('Container Number is required')
    .matches(containerNoRegex, 'Container No. format should be 4 chars and 7 digits')
    .max(11, 'Max 11 characters allowed'),
  cntnrSize: Yup.string().required('Container Size is required').max(20, 'Max 20 characters allowed'),
  cargoTp: Yup.string().required('Cargo Type is required').max(50, 'Max 50 characters allowed'),
  cscPlateMaxWtLimit: Yup.number()
    .required('CSC Plate Max Weight Limit is required')
    .positive('Must be positive')
    .max(99999999.99, 'Max 8 digits before decimal and 2 after'),
  totWt: Yup.number()
    .required('Total Weight is required')
    .positive('Must be positive')
    .max(99999999.99, 'Max 8 digits before decimal and 2 after')
    .test('max-weight', 'Total Weight should be less than or equal to CSC Plate Max Weight Limit', 
      function(value) {
        const { cscPlateMaxWtLimit } = this.parent;
        return !value || !cscPlateMaxWtLimit || value <= cscPlateMaxWtLimit;
      }
    ),
  totWtUom: Yup.string().required('Total Weight UOM is required').max(50, 'Max 50 characters allowed'),
  weighBridgeRegNo: Yup.string().required('Weigh Bridge Registration No. is required').max(100, 'Max 100 characters allowed'),
  weighBridgeAddrLn1: Yup.string().required('Weigh Bridge Address Line 1 is required').max(35, 'Max 35 characters allowed'),
  weighBridgeSlipNo: Yup.string().required('Weigh Bridge Slip No. is required').max(100, 'Max 100 characters allowed'),
  weighBridgeWtTs: Yup.string().required('Weigh Bridge Time Stamp is required'),
  odexRefNo: Yup.string().required('ODeX Reference Number is required').max(100, 'Max 100 characters allowed'),
  
  // Conditional validations
  imoNo1: Yup.string().when('cargoTp', {
    is: 'HAZ',
    then: Yup.string().required('IMO No. 1 is required for HAZ cargo').max(50, 'Max 50 characters allowed'),
  }),
  unNo1: Yup.string().when('cargoTp', {
    is: 'HAZ',
    then: Yup.string().required('UN No. 1 is required for HAZ cargo').max(50, 'Max 50 characters allowed'),
  }),
  shipId: Yup.string().when(['shipperTp', 'hasShipperAuth'], {
    is: (shipperTp, hasShipperAuth) => shipperTp === 'O' && !hasShipperAuth,
    then: Yup.string().required('Shipper ID is required for third party without authorization'),
  }),
  shipperNm: Yup.string().when(['shipperTp', 'hasShipperAuth'], {
    is: (shipperTp, hasShipperAuth) => shipperTp === 'O' && !hasShipperAuth,
    then: Yup.string().required('Shipper Name is required').max(100, 'Max 100 characters allowed'),
  }),
  shipRegTp: Yup.string().when(['shipperTp', 'hasShipperAuth'], {
    is: (shipperTp, hasShipperAuth) => shipperTp === 'O' && !hasShipperAuth,
    then: Yup.string().required('Shipper Registration Type is required').max(100, 'Max 100 characters allowed'),
  }),
  shipRegNo: Yup.string().when(['shipperTp', 'hasShipperAuth', 'shipRegTp'], {
    is: (shipperTp, hasShipperAuth, shipRegTp) => 
      shipperTp === 'O' && !hasShipperAuth && shipRegTp === 'PAN No',
    then: Yup.string()
      .required('Shipper Registration No. is required')
      .matches(panNoRegex, 'PAN card number format should be 5 alphabets 4 numeric and 1 alphabet')
      .max(100, 'Max 100 characters allowed'),
  }).when(['shipperTp', 'hasShipperAuth'], {
    is: (shipperTp, hasShipperAuth) => shipperTp === 'O' && !hasShipperAuth,
    then: Yup.string().required('Shipper Registration No. is required').max(100, 'Max 100 characters allowed'),
  }),
});