// server/routes/form13.js
import express from "express";
import crc32 from "crc-32";
import Form13 from "../models/Form13.js";
import axios from "axios";

const router = express.Router();

// ODeX API Configuration
const ODEX_CONFIG = {
  baseURL: process.env.ODEX_BASE_URL || "https://staging.odexglobal.com",
  endpoints: {
    vesselMaster: "/RS/iForm13Service/json/getForm13VesselInfo",
    podMaster: "/RS/iForm13Service/json/getForm13PODInfo",
    submitForm13: "/DEMO/RS/iForm13Service/json/saveF13",
    getStatus: "/RS/iForm13Service/json/getForm13ReqInfo",
    cancelForm13: "/DEMO/RS/iForm13Service/json/requestF13CancelPyr",
  },
};

// Helper function to generate hashkey
const generateHashKey = (pyrCode, timestamp) => {
  const secretKey = process.env.FORM13_SECRET_KEY;
  return crc32.str(pyrCode + timestamp + secretKey).toString();
};

// Helper function to call ODeX API
const callOdexAPI = async (endpoint, requestData) => {
  try {
    const response = await axios.post(
      `${ODEX_CONFIG.baseURL}${endpoint}`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("ODeX API Error:", error.response?.data || error.message);
    throw new Error(
      `ODeX API call failed: ${error.response?.data?.message || error.message}`
    );
  }
};

// Get hashkey for Form 13
router.post("/hashkey", async (req, res) => {
  try {
    const { pyrCode, timestamp } = req.body;

    if (!pyrCode || !timestamp) {
      return res.status(400).json({
        success: false,
        error: "pyrCode and timestamp are required",
      });
    }

    const hashKey = generateHashKey(pyrCode, timestamp);

    res.json({
      success: true,
      data: { hashKey },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Vessel Master API - Calls actual ODeX API
router.post("/vessel-master", async (req, res) => {
  try {
    const { pyrCode, fromTs, hashKey } = req.body;

    // Validate required fields
    if (!pyrCode || !fromTs) {
      return res.status(400).json({
        success: false,
        error: "pyrCode and fromTs are required",
      });
    }

    // Verify hashkey
    const expectedHash = generateHashKey(pyrCode, fromTs);
    if (hashKey && hashKey !== expectedHash) {
      return res.status(401).json({
        success: false,
        error: "Invalid hashkey",
      });
    }

    // Prepare request for ODeX API
    const vesselRequest = {
      pyrCode,
      fromTs,
      hashKey: hashKey || expectedHash,
    };

    // Call actual ODeX Vessel Master API
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.vesselMaster,
      vesselRequest
    );

    res.json({
      success: true,
      data: odexResponse || [],
    });
  } catch (error) {
    console.error("Vessel Master API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POD Master API - Calls actual ODeX API
router.post("/pod-master", async (req, res) => {
  try {
    const { pyrCode, fromTs, hashKey } = req.body;

    // Validate required fields
    if (!pyrCode || !fromTs) {
      return res.status(400).json({
        success: false,
        error: "pyrCode and fromTs are required",
      });
    }

    // Verify hashkey
    const expectedHash = generateHashKey(pyrCode, fromTs);
    if (hashKey && hashKey !== expectedHash) {
      return res.status(401).json({
        success: false,
        error: "Invalid hashkey",
      });
    }

    // Prepare request for ODeX API
    const podRequest = {
      pyrCode,
      fromTs,
      hashKey: hashKey || expectedHash,
    };

    // Call actual ODeX POD Master API
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.podMaster,
      podRequest
    );

    res.json({
      success: true,
      data: odexResponse || [],
    });
  } catch (error) {
    console.error("POD Master API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Submit Form 13 - Calls actual ODeX API
router.post("/submit", async (req, res) => {
  try {
    const formData = req.body;

    // Validate required fields
    if (!formData.pyrCode || !formData.vesselNm || !formData.pod) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: pyrCode, vesselNm, pod",
      });
    }

    // Save to database first
    const form13 = new Form13(formData);
    await form13.save();

    // Prepare data for ODeX API
    const submissionData = {
      ...formData,
      timestamp: new Date().toISOString().replace("T", " ").split(".")[0],
    };

    // Call actual ODeX Form 13 Submission API
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.submitForm13,
      submissionData
    );

    // Update database with ODeX response
    form13.form13ApiResponse = odexResponse;
    form13.referenceNo = odexResponse.odexRefNo;
    form13.status = "SUBMITTED";
    await form13.save();

    res.json({
      success: true,
      data: {
        ...odexResponse,
        internalRef: form13._id,
      },
    });
  } catch (error) {
    console.error("Form 13 Submission Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Form 13 Status - Calls actual ODeX API
router.post("/status", async (req, res) => {
  try {
    const { pyrCode, odexRefNo, hashKey } = req.body;

    if (!pyrCode || !odexRefNo) {
      return res.status(400).json({
        success: false,
        error: "pyrCode and odexRefNo are required",
      });
    }

    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    const statusRequest = {
      pyrCode,
      odexRefNo,
      hashKey: hashKey || generateHashKey(pyrCode, timestamp),
    };

    // Call actual ODeX Status API
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.getStatus,
      statusRequest
    );

    res.json({
      success: true,
      data: odexResponse,
    });
  } catch (error) {
    console.error("Form 13 Status Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Cancel Form 13 - Calls actual ODeX API
router.post("/cancel", async (req, res) => {
  try {
    const { pyrCode, odexRefNo, hashKey, reason } = req.body;

    if (!pyrCode || !odexRefNo || !reason) {
      return res.status(400).json({
        success: false,
        error: "pyrCode, odexRefNo and reason are required",
      });
    }

    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    const cancelRequest = {
      pyrCode,
      odexRefNo,
      reason,
      hashKey: hashKey || generateHashKey(pyrCode, timestamp),
    };

    // Call actual ODeX Cancellation API
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.cancelForm13,
      cancelRequest
    );

    res.json({
      success: true,
      data: odexResponse,
    });
  } catch (error) {
    console.error("Form 13 Cancellation Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
