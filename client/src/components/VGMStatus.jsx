// src/components/VGM/VGMStatus.jsx
import React, { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { vgmAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import TopNavDropdown from "./TopNavDropdown";
import { useNavigate } from "react-router-dom";

const VGMStatus = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const navigate = useNavigate();

  // Filters state
  const [filters, setFilters] = useState({
    status: "",
    containerNo: "",
    bookingNo: "",
    dateFrom: "",
    dateTo: "",
  });

  const statusColors = {
    Verified: "success",
    Requested: "info",
    Pending: "warning",
    Failed: "error",
    success: "success",
    failed: "error",
    pending: "warning",
  };

  // Fetch VGM requests
  const fetchVGMRequests = async (page = 1) => {
    setLoading(true);
    try {
      const filterParams = {
        page: page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.containerNo && { containerNo: filters.containerNo }),
        ...(filters.bookingNo && { bookingNo: filters.bookingNo }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      };

      const response = await vgmAPI.getRequests(filterParams);
      const { requests, pagination: serverPagination } = response.data;

      setRequests(requests);
      setPagination((prev) => ({
        ...prev,
        page: serverPagination.page,
        total: serverPagination.total,
        pages: serverPagination.pages,
      }));
    } catch (error) {
      console.error("Error fetching VGM requests:", error);
      enqueueSnackbar("Failed to load VGM requests", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Refresh all requests
  const refreshAllRequests = async () => {
    setRefreshing(true);
    try {
      await fetchVGMRequests(pagination.page);
      enqueueSnackbar("Requests refreshed successfully", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Failed to refresh requests", { variant: "error" });
    } finally {
      setRefreshing(false);
    }
  };

  // Handle edit request - switch to form tab with existing data
  const handleEditRequest = async (request) => {
    try {
      // Navigate to submission form with edit state - VGMForm will fetch details using vgmId
      navigate("/vgm", { state: { editMode: true, vgmId: request.vgmId } });
      enqueueSnackbar("Opening VGM form in edit mode", { variant: "info" });
    } catch (error) {
      console.error("Error navigating to edit form:", error);
      enqueueSnackbar("Failed to open edit form", { variant: "error" });
    }
  };

  // Handle new VGM submission - switch to form tab in create mode
  const handleNewVGM = () => {
    navigate("/vgm");
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchVGMRequests(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      containerNo: "",
      bookingNo: "",
      dateFrom: "",
      dateTo: "",
    });
    fetchVGMRequests(1);
  };

  // View request details
  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  // Initial load
  useEffect(() => {
    fetchVGMRequests(1);
  }, []);
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 2000, margin: "auto" }}>
      <TopNavDropdown />
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", mb: 3 }}
      >
        VGM Management
      </Typography>

      {/* Filters Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <FilterIcon sx={{ mr: 1 }} />
          Filters
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Verified">Verified</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Requested">Requested</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Container No"
              value={filters.containerNo}
              onChange={(e) =>
                handleFilterChange("containerNo", e.target.value)
              }
              placeholder="ABCD1234567"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Booking No"
              value={filters.bookingNo}
              onChange={(e) => handleFilterChange("bookingNo", e.target.value)}
              placeholder="BK001"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="From Date"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="To Date"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                onClick={applyFilters}
                disabled={loading}
              >
                Apply
              </Button>
              <Button variant="outlined" onClick={clearFilters}>
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Section */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            VGM Requests ({pagination.total})
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleNewVGM}
              disabled={loading}
            >
              New VGM
            </Button>
            <Button
              startIcon={<RefreshIcon />}
              onClick={refreshAllRequests}
              disabled={loading || refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Alert severity="info">
            No VGM requests found matching your filters.
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>
                      <strong>VGM ID</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Container No</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Booking No</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total Weight</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Method</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Submitted</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{request.vgmId}</TableCell>
                      <TableCell>{request.cntnrNo}</TableCell>
                      <TableCell>{request.bookNo}</TableCell>
                      <TableCell>
                        <Chip
                          label={request.cntnrStatus || request.status}
                          color={
                            statusColors[
                              request.cntnrStatus || request.status
                            ] || "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {request.totWt
                          ? `${request.totWt} ${request.totWtUom || "KG"}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{request.vgmEvalMethod}</TableCell>
                      <TableCell>
                        {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => viewRequestDetails(request)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditRequest(request)}
                            color="secondary"
                            disabled={request.status === "Verified"} // Disable edit for verified requests
                            title={
                              request.status === "Verified"
                                ? "Cannot edit verified requests"
                                : "Edit Request"
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {pagination.pages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={(event, page) => fetchVGMRequests(page)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>About VGM Status:</strong>
          <br />• <strong>Verified</strong>: VGM has been successfully verified
          and accepted
          <br />• <strong>Pending</strong>: VGM is awaiting verification or
          weighment details
          <br />• <strong>Requested</strong>: VGM submission has been received
          and is being processed
          <br />• <strong>Failed</strong>: VGM submission failed due to errors
          or invalid data
        </Typography>
      </Alert>

      {/* Request Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          VGM Request Details - {selectedRequest?.vgmId}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  VGM ID
                </Typography>
                <Typography variant="body1">{selectedRequest.vgmId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={selectedRequest.cntnrStatus || selectedRequest.status}
                  color={
                    statusColors[
                      selectedRequest.cntnrStatus || selectedRequest.status
                    ] || "default"
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Container No
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.cntnrNo}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Booking No
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.bookNo}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  VGM Method
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.vgmEvalMethod}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Total Weight
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.totWt
                    ? `${selectedRequest.totWt} ${
                        selectedRequest.totWtUom || "KG"
                      }`
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Weighbridge Slip
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.weighBridgeSlipNo || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Weighing Time
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.weighBridgeWtTs || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Response
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    p: 1,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                    fontFamily: "monospace",
                  }}
                >
                  {selectedRequest.response}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default VGMStatus;
