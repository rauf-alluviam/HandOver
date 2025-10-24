// src/services/form13API.js
import api from "./api";

const FORM13_BASE_URL = "/form13";

export const form13API = {
  // Vessel Master API - Calls actual ODeX API
  getVesselMaster: (requestData) =>
    api.post(`${FORM13_BASE_URL}/vessel-master`, requestData),

  // POD Master API - Calls actual ODeX API
  getPODMaster: (requestData) =>
    api.post(`${FORM13_BASE_URL}/pod-master`, requestData),

  // Form 13 Submission API - Calls actual ODeX API
  submitForm13: (formData) => api.post(`${FORM13_BASE_URL}/submit`, formData),

  // Get Form 13 Status API - Calls actual ODeX API
  getForm13Status: (statusData) =>
    api.post(`${FORM13_BASE_URL}/status`, statusData),

  // Form 13 Cancellation API - Calls actual ODeX API
  cancelForm13: (cancelData) =>
    api.post(`${FORM13_BASE_URL}/cancel`, cancelData),

  // Get hashkey from backend
  getHashKey: (hashData) => api.post(`${FORM13_BASE_URL}/hashkey`, hashData),
};
