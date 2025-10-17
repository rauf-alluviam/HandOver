// server/src/services/apiLogger.js
import ApiLog from "../models/ApiLog.js";
import axios from "axios";

export class ApiLogger {
  static async logAndForward(moduleName, requestData) {
    const startTime = Date.now();

    try {
      // Create log entry
      const apiLog = new ApiLog({
        moduleName,
        request: {
          url: requestData.url,
          method: requestData.method || "POST",
          headers: requestData.headers || {},
          body: requestData.body || {},
          timestamp: new Date(),
        },
        status: "pending",
      });

      await apiLog.save();
      var logId = apiLog._id;

      // Forward to third-party API
      const response = await axios({
        method: requestData.method || "POST",
        url: requestData.url,
        headers: requestData.headers,
        data: requestData.body,
        timeout: 30000,
      });

      const timeTaken = Date.now() - startTime;

      // Update log with response
      await ApiLog.findByIdAndUpdate(logId, {
        response: {
          statusCode: response.status,
          data: response.data,
          headers: response.headers,
          timeTaken,
          timestamp: new Date(),
        },
        status: "success",
      });

      return {
        success: true,
        data: response.data,
        logId: logId,
      };
    } catch (error) {
      const timeTaken = Date.now() - startTime;

      // Update log with error
      if (ApiLog) {
        await ApiLog.findByIdAndUpdate(logId, {
          response: {
            statusCode: error.response?.status || 500,
            data: error.response?.data || { message: error.message },
            timeTaken,
            timestamp: new Date(),
          },
          status: "failed",
          remarks: error.message,
        });
      }

      return {
        success: false,
        error: error.response?.data || error.message,
        logId: logId,
      };
    }
  }

  static async getLogById(logId) {
    return await ApiLog.findById(logId);
  }

  static async getLogsByModule(moduleName, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    return await ApiLog.find({ moduleName })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
}
