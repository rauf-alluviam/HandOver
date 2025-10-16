// src/constants/masterData.js
export const CONTAINER_SIZES = [
  { value: '1X20', label: '20Ft' },
  { value: '1X40', label: '40Ft' },
  { value: '1X45', label: '45Ft' },
];

export const CARGO_TYPES = [
  { value: 'GEN', label: 'General (GEN)' },
  { value: 'HAZ', label: 'Hazardous (HAZ)' },
  { value: 'REF', label: 'Reefer (REF)' },
  { value: 'ONION', label: 'Onion (ONION)' },
  { value: 'ODC', label: 'ODC' },
];

export const VGM_METHODS = [
  { value: 'M1', label: 'Method 1' },
  { value: 'M2', label: 'Method 2' },
];

export const SHIPPER_TYPES = [
  { value: 'S', label: 'Self' },
  { value: 'O', label: 'Other' },
];

export const WEIGHT_UOMS = [
  { value: 'KG', label: 'KG' },
  { value: 'MT', label: 'MT' },
];

export const REGISTRATION_TYPES = [
  { value: 'IEC No', label: 'IEC No' },
  { value: 'CIN No', label: 'CIN No' },
  { value: 'PAN No', label: 'PAN No' },
  { value: 'Aadhaar No', label: 'Aadhaar No' },
  { value: 'Passport No', label: 'Passport No' },
];

export const ATTACHMENT_TITLES = [
  { value: 'WT_DECLARATION', label: 'Weight Declaration - Annexure 1' },
  { value: 'DG_DECLARATION', label: 'DG Declaration / Weighbridge Slip' },
  { value: 'AUTH_LETTER', label: 'Authorization Letter by Shipper' },
];

export const PORTS = [
  { value: 'INNSA1', label: 'Nhava Sheva' },
  { value: 'INMUN1', label: 'Mundra' },
  { value: 'INNML1', label: 'Mangalore' },
  { value: 'INTUT1', label: 'Tuticorin' },
  { value: 'INCCU1', label: 'Kolkata' },
  // Add more ports as per document
];

export const LINERS = [
  { value: '030029', label: 'Test Liner' },
  // Add more liners from the document
];

export const IMO_NUMBERS = [
  { value: '0', label: 'Hazardous' },
  { value: '1.1', label: 'Explosives' },
  { value: '1.2', label: 'Explosives' },
  // Add all IMO numbers from document
];