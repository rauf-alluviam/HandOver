import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { vgmAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import TopNavDropdown from "./TopNavDropdown";
import { useNavigate } from "react-router-dom";
import "../styles/VGM.scss";

// Inline Icons
const Icons = {
  Filter: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  ),
  Refresh: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Eye: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

const VGMStatus = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    status: "",
    containerNo: "",
    bookingNo: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchVGMRequests = async (page = 1) => {
    setLoading(true);
    try {
      const filterParams = { page, limit: pagination.limit, ...filters };
      Object.keys(filterParams).forEach(
        (k) => !filterParams[k] && delete filterParams[k]
      );

      const response = await vgmAPI.getRequests(filterParams);
      const { requests: data, pagination: meta } = response.data;
      setRequests(data);
      setPagination((prev) => ({
        ...prev,
        page: meta.page,
        total: meta.total,
        pages: meta.pages,
      }));
    } catch (error) {
      enqueueSnackbar("Failed to load requests", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = (request) => {
    navigate("/vgm", { state: { editMode: true, vgmId: request.vgmId } });
  };

  // --- Logic 1: Determine Display Status ---
  const getDisplayStatus = (req) => {
    // Check internal response for errors first
    // If response is a string and starts with "ERROR", force Pending
    if (
      typeof req.response === "string" &&
      req.response.trim().toUpperCase().startsWith("ERROR")
    ) {
      return "Pending";
    }

    // Otherwise check standard status fields

    const s = (req.response || req.status || "").toLowerCase();
    console.log(req.response);
    console.log(s);
    if (s.includes("verified") || s.includes("success")) return "Verified";

    return "Pending";
  };

  const getStatusBadgeClass = (displayStatus) => {
    return displayStatus === "Verified" ? "badge-success" : "badge-warning";
  };

  // --- Logic 2: Get Remarks ---
  const getRemarks = (req) => {
    // 1. Direct String Check (Matches your JSON example: "response": "ERROR: ...")
    if (typeof req.response === "string") {
      return req.response;
    }

    // 2. Object Check
    const resp = req.response;
    const message = resp.message || resp.error || resp.statusDescription;
    if (message) return message;

    // 3. Fallback based on computed status
    const status = getDisplayStatus(req);
    if (status === "Verified") return "Submitted Successfully";

    return "Processing / Awaiting Confirmation";
  };

  useEffect(() => {
    fetchVGMRequests(1);
  }, []);

  return (
    <div className="vgm-container">
      <TopNavDropdown />
      <div className="page-header">
        <h2>VGM Management</h2>
      </div>

      {/* Filters */}
      <div className="panel">
        <div className="d-flex mb-4 gap-2" style={{ fontWeight: 600 }}>
          <Icons.Filter /> Filters
        </div>
        <div
          className="form-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <div className="form-group">
            <label>Status</label>
            <select
              className="form-control"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="form-group">
            <label>Container No</label>
            <input
              className="form-control"
              placeholder="ABCD1234567"
              value={filters.containerNo}
              onChange={(e) =>
                setFilters({ ...filters, containerNo: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Booking No</label>
            <input
              className="form-control"
              placeholder="BK001"
              value={filters.bookingNo}
              onChange={(e) =>
                setFilters({ ...filters, bookingNo: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>From Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
            />
          </div>
          <div
            className="form-group"
            style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}
          >
            <button
              className="btn btn-primary w-full"
              onClick={() => fetchVGMRequests(1)}
            >
              Apply
            </button>
            <button
              className="btn btn-outline w-full"
              onClick={() => {
                setFilters({
                  status: "",
                  containerNo: "",
                  bookingNo: "",
                  dateFrom: "",
                  dateTo: "",
                });
                setTimeout(() => fetchVGMRequests(1), 0);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="panel">
        <div className="d-flex justify-between mb-4">
          <h3>Requests ({pagination.total})</h3>
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/vgm")}
            >
              + New VGM
            </button>
            <button
              className="btn btn-outline"
              onClick={() => fetchVGMRequests(pagination.page)}
            >
              <Icons.Refresh /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="alert alert-info">No records found.</div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Container</th>
                    <th>Booking</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Weight</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, i) => {
                    const displayStatus = getDisplayStatus(req); // Pass entire object
                    const remarks = getRemarks(req);

                    return (
                      <tr key={i}>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline"
                              title="View"
                              onClick={() => setSelectedRequest(req)}
                            >
                              <Icons.Eye />
                            </button>
                            <button
                              className="btn btn-sm btn-outline"
                              title="Edit"
                              onClick={() => handleEditRequest(req)}
                            >
                              <Icons.Edit />
                            </button>
                          </div>
                        </td>
                        <td>{req.cntnrNo}</td>
                        <td>{req.bookNo}</td>
                        <td>
                          <span
                            className={`badge ${getStatusBadgeClass(
                              displayStatus
                            )}`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        {/* Remarks Column with Red Color for Errors */}
                        <td
                          style={{
                            maxWidth: "250px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: remarks.toString().startsWith("ERROR")
                              ? "#dc2626"
                              : "inherit",
                            fontWeight: remarks.toString().startsWith("ERROR")
                              ? "600"
                              : "normal",
                          }}
                          title={remarks}
                        >
                          {remarks}
                        </td>
                        <td>
                          {req.totWt ? `${req.totWt} ${req.totWtUom}` : "N/A"}
                        </td>
                        <td>
                          {dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-between mt-4">
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline"
                    disabled={pagination.page === 1}
                    onClick={() => fetchVGMRequests(pagination.page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => fetchVGMRequests(pagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Details: {selectedRequest.vgmId}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div>
                  <label className="text-muted">Status</label>
                  <div>{getDisplayStatus(selectedRequest)}</div>
                </div>
                <div>
                  <label className="text-muted">Container</label>
                  <div>{selectedRequest.cntnrNo}</div>
                </div>
                <div>
                  <label className="text-muted">Booking</label>
                  <div>{selectedRequest.bookNo}</div>
                </div>
                <div>
                  <label className="text-muted">Total Weight</label>
                  <div>
                    {selectedRequest.totWt} {selectedRequest.totWtUom}
                  </div>
                </div>
                <div>
                  <label className="text-muted">Remarks</label>
                  <div style={{ color: "#dc2626", fontWeight: 600 }}>
                    {getRemarks(selectedRequest)}
                  </div>
                </div>
                <div>
                  <label className="text-muted">Time</label>
                  <div>{selectedRequest.weighBridgeWtTs || "N/A"}</div>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-muted">Full API Response</label>
                <pre
                  style={{
                    background: "#f1f5f9",
                    padding: "1rem",
                    borderRadius: "4px",
                    overflowX: "auto",
                    maxHeight: "200px",
                    whiteSpace: "pre-wrap", // Allows text wrapping for long error messages
                  }}
                >
                  {typeof selectedRequest.response === "string"
                    ? selectedRequest.response
                    : JSON.stringify(selectedRequest.response || {}, null, 2)}
                </pre>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VGMStatus;
