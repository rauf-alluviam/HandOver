// server/routes/form13.js
import express from "express";
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

// Helper function to get current timestamp in required format
const getCurrentTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace("T", " ").split(".")[0];
};

// Helper function to get hashkey from environment variable
const getHashKey = () => {
  const hashKey = process.env.HASHKEY;
  if (!hashKey) {
    throw new Error("HASHKEY environment variable is not set");
  }
  return hashKey;
};

// Helper function to call ODeX API with better error handling
const callOdexAPI = async (endpoint, requestData) => {
  try {
    // Log/fix payload and headers for deep diff with postman if debugging
    console.log('Outgoing payload:', JSON.stringify(requestData, null, 2));

    const response = await axios.post(
      `${ODEX_CONFIG.baseURL}${endpoint}`,
      JSON.stringify(requestData), // Ensure provided as JSON string, exactly what Postman does
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "Thunder Client (https://www.thunderclient.com)", 
        },
        timeout: 30000,
      }
    );
    if (typeof response.data === "string" && response.data.startsWith("<!DOCTYPE html")) {
      throw new Error("HTML error page received from ODeX API; check request payload and endpoint.");
    }
    return response.data;
  } catch (error) {
    if (
      error.response &&
      typeof error.response.data === "string" &&
      error.response.data.startsWith("<!DOCTYPE html")
    ) {
      // Return the HTML error for quick visual debug
      return {
        success: false,
        error: "Received HTML error page from ODeX. Validate your hashkey, endpoint and payload!",
        html: error.response.data
      };
    }
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: `ODeX API call failed: ${error.message}`,
    };
  }
};


// Mock data for testing when API is down
const getMockVesselData = () => {
  return {
    success: true,
    data: [
      {
        vesselCode: "VSL001",
        vesselName: "MAERSK COLUMBUS",
        voyageNo: "234W",
        rotationNo: "ROT12345",
      },
      {
        vesselCode: "VSL002",
        vesselName: "CMA CGM AMERICA",
        voyageNo: "567E",
        rotationNo: "ROT12346",
      },
    ],
  };
};

// Get hashkey for Form 13
router.post("/hashkey", async (req, res) => {
  try {
    const hashKey = getHashKey();

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
    const { pyrCode } = req.body;

    // Validate required fields
    if (!pyrCode) {
      return res.status(400).json({
        success: false,
        error: "pyrCode is required",
      });
    }

    // Get current timestamp and hashkey
    // const fromTs = getCurrentTimestamp();
    const fromTs = "2025-10-13 00:00:00";
    const hashKey = getHashKey();

    // Prepare request for ODeX API
    const vesselRequest = {
      pyrCode,
      fromTs,
      hashKey,
    };

    console.log("Vessel Master Request:", vesselRequest);

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

    // Return mock data for testing when API is down
    if (process.env.USE_MOCK_DATA === "true") {
      console.log("Returning mock vessel data");
      const mockData = getMockVesselData();
      return res.json(mockData);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: getCurrentTimestamp(),
      suggestion:
        "API timeout - check ODeX service availability or use mock data for testing",
    });
  }
});

// POD Master API - Calls actual ODeX API
router.post("/pod-master", async (req, res) => {
  try {
    const { pyrCode } = req.body;

    // Validate required fields
    if (!pyrCode) {
      return res.status(400).json({
        success: false,
        error: "pyrCode is required",
      });
    }

    // Get current timestamp and hashkey
    // const fromTs = getCurrentTimestamp();
    const fromTs = "2022-07-19 00:00:00";

    const hashKey = getHashKey();

    // Prepare request for ODeX API
    const podRequest = {
      pyrCode,
      fromTs,
      hashKey,
    };

    console.log("POD Master Request:", podRequest);

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

    // Return mock data for testing when API is down
    if (process.env.USE_MOCK_DATA === "true") {
      console.log("Returning mock POD data");
      return res.json({
        success: true,
        data: [
          { portCode: "INBOM", portName: "MUMBAI" },
          { portCode: "INSHA", portName: "SHARJAH" },
        ],
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Submit Form 13 - Calls actual ODeX API
// Submit Form 13 - Calls actual ODeX API
router.post("/submit", async (req, res) => {
  try {
    const formData = req.body;
    if (!formData.pyrCode || !formData.vesselNm || !formData.pod) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: pyrCode, vesselNm, pod",
      });
    }

    // Save to database (optional)
    const form13 = new Form13(formData);
    await form13.save();

    const hashKey = getHashKey();
    const submissionData = {
      ...formData,
      hashKey,
      timestamp: getCurrentTimestamp(),
    };

    // Proxy submission to ODeX
    const odexResponse = await callOdexAPI(
      ODEX_CONFIG.endpoints.submitForm13,
      submissionData
    );

    // Respond with *only one* payload!
    // Choose one of the below (typically the first):
    res.status(200).json(odexResponse);
    // OR, if you want internalRef:
    // res.status(200).json({ ...odexResponse, internalRef: form13._id });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Form 13 Status - Calls actual ODeX API
router.post("/status", async (req, res) => {
  try {
    const { pyrCode, odexRefNo } = req.body;

    if (!pyrCode || !odexRefNo) {
      return res.status(400).json({
        success: false,
        error: "pyrCode and odexRefNo are required",
      });
    }

    // Get hashkey from environment
    const hashKey = getHashKey();

    const statusRequest = {
      pyrCode,
      odexRefNo,
      hashKey,
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
    const { pyrCode, odexRefNo, reason } = req.body;

    if (!pyrCode || !odexRefNo || !reason) {
      return res.status(400).json({
        success: false,
        error: "pyrCode, odexRefNo and reason are required",
      });
    }

    // Get hashkey from environment
    const hashKey = getHashKey();

    const cancelRequest = {
      pyrCode,
      odexRefNo,
      reason,
      hashKey,
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
