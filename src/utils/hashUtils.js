// src/utils/hashUtils.js
import crc32 from 'crc-32';

export const generateLoginHash = (pyrCode, timestamp, secretKey) => {
  const str = pyrCode + timestamp + secretKey;
  return crc32.str(str).toString();
};

export const generateVGMHash = (cntnrNo, totWt, odexRefNo, weighBridgeSlipNo, secretKey) => {
  const totWtFormatted = totWt ? totWt.toFixed(2) : '';
  const str = cntnrNo + totWtFormatted + odexRefNo + (weighBridgeSlipNo || '') + secretKey;
  return crc32.str(str).toString();
};