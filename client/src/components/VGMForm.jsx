import React, { useState, useEffect } from "react";
import { useFormik, FormikProvider, useFormikContext } from "formik";
import { useSnackbar } from "notistack";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import TopNavDropdown from "./TopNavDropdown";
import { vgmAPI } from "../services/api.js";
import { vgmValidationSchema } from "../utils/validation.js";
import { validateFile, fileToBase64 } from "../utils/fileUtils.js";
import {
  CONTAINER_SIZES,
  CARGO_TYPES,
  VGM_METHODS,
  SHIPPER_TYPES,
  WEIGHT_UOMS,
  REGISTRATION_TYPES,
  ATTACHMENT_TITLES,
  PORTS,
  LINERS,
  IMO_NUMBERS,
  CONTAINER_TYPES,
  HANDOVER_LOCATIONS,
  getTerminalCodesByPort,
} from "../utils/constants/masterDataVGM.js";
import "../styles/VGM.scss";

// --- Helper Components ---
const InputField = ({
  label,
  name,
  type = "text",
  required = false,
  ...props
}) => {
  const formik = useFormikContext();
  return (
    <div className="form-group">
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        name={name}
        className={`form-control ${
          formik.touched[name] && formik.errors[name] ? "error" : ""
        }`}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        {...props}
      />
      {formik.touched[name] && formik.errors[name] && (
        <span className="error-text">{formik.errors[name]}</span>
      )}
    </div>
  );
};

const SelectField = ({ label, name, options, required = false, ...props }) => {
  const formik = useFormikContext();
  return (
    <div className="form-group">
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      <select
        name={name}
        className={`form-control ${
          formik.touched[name] && formik.errors[name] ? "error" : ""
        }`}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option
            key={opt.value || opt.shipperId}
            value={opt.value || opt.shipperId}
          >
            {opt.label || opt.shipperNm}
          </option>
        ))}
      </select>
      {formik.touched[name] && formik.errors[name] && (
        <span className="error-text">{formik.errors[name]}</span>
      )}
    </div>
  );
};

// --- Main Component ---

const VGMForm = ({
  editMode = false,
  existingRequest = null,
  onSuccess,
  onCancel,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { userData, shippers } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isEditMode, setIsEditMode] = useState(editMode);
  const [requestData, setRequestData] = useState(existingRequest);

  const [formValues, setFormValues] = useState({
    linerId: "",
    vesselNm: "",
    voyageNo: "",
    bookNo: "",
    locId: "",
    handoverLoc: "",
    shipperTp: "S",
    authPrsnNm: "",
    authDesignation: "",
    authMobNo: "",
    odexRefNo: userData?.pyrCode,
    vgmEvalMethod: "M1",
    cntnrNo: "",
    cntnrSize: "",
    cntnrTp: "",
    cargoTp: "GEN",
    cscPlateMaxWtLimit: "",
    cscPlateMaxWtUom: "KG",
    isQuickResponse: "N",
    cargoWt: "",
    cargoWtUom: "KG",
    tareWt: "",
    tareWtUom: "KG",
    totWt: "",
    totWtUom: "KG",
    imoNo1: "",
    unNo1: "",
    shipId: "",
    shipperNm: "",
    shipRegTP: "",
    shipRegNo: "",
    weighBridgeRegNo: "",
    weighBridgeAddrLn1: "",
    weighBridgeAddrLn2: "",
    weighBridgeAddrLn3: "",
    weighBridgeSlipNo: "",
    weighBridgeWtTs: new Date().toISOString().slice(0, 19).replace("T", " "),
    terminalCode: "",
  });
  // --- Initialize Formik ---
  const formik = useFormik({
    initialValues: formValues,
    enableReinitialize: true,
    validationSchema: vgmValidationSchema,
    onSubmit: async (values) => {
      if (isEditMode && !formik.dirty) {
        enqueueSnackbar("No changes detected. Update cancelled.", {
          variant: "info",
        });
        return; // <--- STOP HERE. No API call, no remarks update.
      }
      if (loading) return;
      setLoading(true);
      try {
        const payload = { ...values };
        // Manual Transformations
        payload.cscPlateMaxWtLimit = values.cscPlateMaxWtLimit?.toString();
        payload.totWt = values.totWt?.toString();

        if (values.cargoTp === "HAZ") {
          payload.imoNo1 = values.imoNo1;
          payload.unNo1 = values.unNo1;
        }

        if (values.vgmEvalMethod === "M2") {
          payload.cargoWt = values.cargoWt?.toString();
          payload.tareWt = values.tareWt?.toString();
        }

        if (values.shipperTp === "O") {
          if (values.shipId) payload.shipId = values.shipId;
          else {
            payload.shipperNm = values.shipperNm;
            payload.shipRegTP = values.shipRegTP;
            payload.shipRegNo = values.shipRegNo;
          }
        }

        if (attachments.length > 0) payload.vgmWbAttList = attachments;

        let response;

        // --- FIX 1: Strict Edit Mode Logic to prevent Duplicate Requests ---
        if (isEditMode) {
          const vgmId = requestData?._id || requestData?.vgmId;
          if (!vgmId) {
            throw new Error("Unable to update: VGM ID is missing.");
          }
          response = await vgmAPI.updateRequest(vgmId, payload);
        } else {
          response = await vgmAPI.submit(payload);
        }

        const responseBody = response.data; // The whole response object

        if (responseBody) {
          // --- FIX 2: Check for logical errors inside the success response ---
          // const innerResponse = responseBody.data?.response; // "ERROR: 1 - Shipping Line..."
          const innerResponse = responseBody.data?.remarks;
          const isLogicalError =
            typeof innerResponse === "string" &&
            innerResponse.trim().toUpperCase().startsWith("ERROR");

          if (isLogicalError) {
            // Case: Server accepted (200 OK) but business logic failed (Pending/Error)
            // ACTION: Show warning, DO NOT CLEAR FORM
            enqueueSnackbar(`${innerResponse}`, {
              variant: "warning",
              autoHideDuration: 6000,
            });
          } else {
            // Case: Pure Success (Verified)
            enqueueSnackbar(
              isEditMode
                ? "VGM Updated Successfully"
                : "VGM Submitted Successfully",
              { variant: "success" }
            );

            if (!isEditMode) {
              formik.resetForm();
              setAttachments([]);
            } else {
              navigate("/vgm-status");
            }
          }
        }
      } catch (error) {
        const msg =
          error.response?.data?.message || error.message || "Submission Failed";
        enqueueSnackbar(msg, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  // --- Initialize Edit Mode ---
  useEffect(() => {
    const initializeEditMode = async () => {
      if (location.state?.editMode && location.state?.vgmId) {
        setIsEditMode(true);
        await fetchRequestDetails(location.state.vgmId);
      } else if (editMode && existingRequest) {
        setIsEditMode(true);
        setRequestData(existingRequest);
        prefillForm(existingRequest);
      }
    };
    initializeEditMode();
  }, [location.state, editMode, existingRequest]);

  const fetchRequestDetails = async (vgmId) => {
    try {
      setLoading(true);
      const response = await vgmAPI.getRequestById(vgmId);
      setRequestData(response.data);
      prefillForm(response.data);
    } catch (error) {
      enqueueSnackbar("Failed to load request details", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const prefillForm = (request) => {
    if (!request) return;
    const requestBody = request.request?.body || request;

    const newValues = {
      linerId: requestBody.linerId || "",
      vesselNm: requestBody.vesselNm || "",
      voyageNo: requestBody.voyageNo || "",
      bookNo: requestBody.bookNo || "",
      locId: requestBody.locId || "",
      handoverLoc: requestBody.handoverLoc || "",
      shipperTp: requestBody.shipperTp || "S",
      authPrsnNm: requestBody.authPrsnNm || "",
      authDesignation: requestBody.authDesignation || "",
      authMobNo: requestBody.authMobNo || "",
      odexRefNo: userData?.pyrCode,
      vgmEvalMethod: requestBody.vgmEvalMethod || "M1",
      cntnrNo: requestBody.cntnrNo || "",
      cntnrSize: requestBody.cntnrSize || "",
      cntnrTp: requestBody.cntnrTp || "",
      cargoTp: requestBody.cargoTp || "GEN",
      cscPlateMaxWtLimit: requestBody.cscPlateMaxWtLimit || "",
      cscPlateMaxWtUom: requestBody.cscPlateMaxWtUom || "KG",
      isQuickResponse: requestBody.isQuickResponse || "N",
      cargoWt: requestBody.cargoWt || "",
      cargoWtUom: requestBody.cargoWtUom || "KG",
      tareWt: requestBody.tareWt || "",
      tareWtUom: requestBody.tareWtUom || "KG",
      totWt: requestBody.totWt || "",
      totWtUom: requestBody.totWtUom || "KG",
      imoNo1: requestBody.imoNo1 || "",
      unNo1: requestBody.unNo1 || "",
      shipId: requestBody.shipId || "",
      shipperNm: requestBody.shipperNm || "",
      shipRegTP: requestBody.shipRegTP || "",
      shipRegNo: requestBody.shipRegNo || "",
      weighBridgeRegNo: requestBody.weighBridgeRegNo || "",
      weighBridgeAddrLn1: requestBody.weighBridgeAddrLn1 || "",
      weighBridgeAddrLn2: requestBody.weighBridgeAddrLn2 || "",
      weighBridgeAddrLn3: requestBody.weighBridgeAddrLn3 || "",
      weighBridgeSlipNo: requestBody.weighBridgeSlipNo || "",
      weighBridgeWtTs:
        requestBody.weighBridgeWtTs ||
        new Date().toISOString().slice(0, 19).replace("T", " "),
      terminalCode: requestBody.terminalCode || "",
    };

    Object.keys(formValues).forEach((key) => {
      if (formValues[key] !== undefined)
        formik.setFieldValue(key, formValues[key]);
    });
    setFormValues(newValues);

    // if (requestBody.vgmWbAttList) setAttachments(requestBody.vgmWbAttList);
    // enqueueSnackbar("Form pre-filled with existing data", { variant: "info" });
  };

  const hasShipperAuth = shippers.some(
    (shipper) =>
      shipper.shipperId === formik.values.shipId && shipper.serviceNm === "VGM"
  );

  const handleFileUpload = async (event, attTitle) => {
    const file = event.target.files[0];
    if (!file) return;
    const errors = validateFile(file);
    if (errors.length > 0) {
      enqueueSnackbar(errors.join(", "), { variant: "error" });
      return;
    }
    try {
      const base64Data = await fileToBase64(file);
      const newAttachment = { attNm: file.name, attData: base64Data, attTitle };
      setAttachments((prev) => [
        ...prev.filter((att) => att.attTitle !== attTitle),
        newAttachment,
      ]);
      enqueueSnackbar("File uploaded", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Error processing file", { variant: "error" });
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate("/vgm-status");
  };

  return (
    <FormikProvider value={formik}>
      <div className="vgm-container">
        <TopNavDropdown />

        <form onSubmit={formik.handleSubmit}>
          {/* Section 1: Shipper & Booking */}
          <div className="panel">
            <h3 className="panel-title">Shipper / Booking Details</h3>
            <div className="form-grid">
              <SelectField
                label="Shipping Line"
                name="linerId"
                options={LINERS}
                required
              />
              <InputField label="Vessel Name" name="vesselNm" />
              <InputField label="Voyage Number" name="voyageNo" />
              <InputField label="Booking Number" name="bookNo" required />
              <SelectField label="Port" name="locId" options={PORTS} required />
              <SelectField
                label="Handover Location"
                name="handoverLoc"
                options={HANDOVER_LOCATIONS}
              />

              {/* Terminal Code */}
              <div className="form-group">
                <label>Terminal Code</label>
                <SelectField
                  list="terminals"
                  name="terminalCode"
                  className="form-control"
                  value={formik.values.terminalCode}
                  onChange={formik.handleChange}
                  options={getTerminalCodesByPort(formik.values.locId)}
                  placeholder="Type or select"
                />
              </div>
            </div>

            <div
              className="mt-4"
              style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}
            ></div>

            <div className="form-grid">
              <SelectField
                label="Shipper Type"
                name="shipperTp"
                options={SHIPPER_TYPES}
                required
              />

              {formik.values.shipperTp === "O" && (
                <>
                  <SelectField
                    label="Authorized Shipper"
                    name="shipId"
                    options={shippers.map((s) => ({
                      value: s.shipperId,
                      label: `${s.shipperNm} (${s.shipperId})`,
                    }))}
                  />
                  {!hasShipperAuth && (
                    <>
                      <InputField
                        label="Shipper Name"
                        name="shipperNm"
                        required
                      />
                      <SelectField
                        label="Reg Type"
                        name="shipRegTP"
                        options={REGISTRATION_TYPES}
                        required
                      />
                      <InputField
                        label="Reg Number"
                        name="shipRegNo"
                        required
                      />
                    </>
                  )}
                </>
              )}
            </div>

            <div className="form-grid mt-4">
              <InputField label="Auth Person Name" name="authPrsnNm" required />
              <InputField label="Designation" name="authDesignation" required />
              <InputField label="Mobile Number" name="authMobNo" required />
            </div>
          </div>

          {/* Section 2: Container Details */}
          <div className="panel">
            <h3 className="panel-title">Container Details</h3>
            <div className="alert alert-info" style={{ fontSize: "0.85rem" }}>
              {formik.values.vgmEvalMethod === "M1"
                ? "Method 1: Weighing the packed container."
                : "Method 2: Adding weight of packages + cargo + tare."}
            </div>

            <div className="form-grid mb-4">
              <SelectField
                label="Evaluation Method"
                name="vgmEvalMethod"
                options={VGM_METHODS}
                required
              />
            </div>

            <div className="form-grid">
              <InputField
                label="Container No"
                name="cntnrNo"
                placeholder="ABCD1234567"
                required
              />
              <SelectField
                label="Size"
                name="cntnrSize"
                options={CONTAINER_SIZES}
                required
              />
              <SelectField
                label="Type"
                name="cntnrTp"
                options={CONTAINER_TYPES}
              />
              <SelectField
                label="Cargo Type"
                name="cargoTp"
                options={CARGO_TYPES}
                required
              />
              <InputField
                label="CSC Max Weight"
                name="cscPlateMaxWtLimit"
                type="number"
                step="0.01"
                required
              />
              <SelectField
                label="Max Wt UOM"
                name="cscPlateMaxWtUom"
                options={WEIGHT_UOMS}
                required
              />

              <div className="form-group" style={{ gridColumn: "span 1" }}>
                <label>
                  Quick Response <span className="required">*</span>
                </label>
                <select
                  name="isQuickResponse"
                  value={formik.values.isQuickResponse}
                  onChange={formik.handleChange}
                  className="form-control"
                >
                  <option value="N">No - Wait for weighment</option>
                  <option value="Y">Yes - Immediate</option>
                </select>
              </div>
            </div>

            {/* Method 2 Specifics */}
            {formik.values.vgmEvalMethod === "M2" && (
              <div
                className="panel mt-4"
                style={{ backgroundColor: "#f1f5f9" }}
              >
                <h4 style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Method 2 Calculation
                </h4>
                <div className="form-grid">
                  <InputField
                    label="Cargo Weight"
                    name="cargoWt"
                    type="number"
                    step="0.01"
                    required
                  />
                  <SelectField
                    label="Cargo UOM"
                    name="cargoWtUom"
                    options={WEIGHT_UOMS}
                    required
                  />
                  <InputField
                    label="Tare Weight"
                    name="tareWt"
                    type="number"
                    step="0.01"
                    required
                  />
                  <SelectField
                    label="Tare UOM"
                    name="tareWtUom"
                    options={WEIGHT_UOMS}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-grid mt-4">
              <InputField
                label="VGM (Total Weight)"
                name="totWt"
                type="number"
                step="0.01"
                required
              />
              <SelectField
                label="VGM UOM"
                name="totWtUom"
                options={WEIGHT_UOMS}
                required
              />
            </div>

            {formik.values.cargoTp === "HAZ" && (
              <div className="form-grid mt-4">
                <SelectField
                  label="IMO Number"
                  name="imoNo1"
                  options={IMO_NUMBERS}
                  required
                />
                <InputField label="UN Number" name="unNo1" required />
              </div>
            )}
          </div>

          {/* Section 3: Weighbridge */}
          <div className="panel">
            <h3 className="panel-title">Weighbridge Details</h3>
            <div className="form-grid">
              <InputField
                label="Registration No"
                name="weighBridgeRegNo"
                required
              />
              <InputField label="Slip No" name="weighBridgeSlipNo" required />
              <InputField
                label="Address Line 1"
                name="weighBridgeAddrLn1"
                required
              />
              <InputField label="Address Line 2" name="weighBridgeAddrLn2" />
              <InputField label="Address Line 3" name="weighBridgeAddrLn3" />

              {/* DateTime Input */}
              <div className="form-group">
                <label>
                  Date & Time of Weighing <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="weighBridgeWtTs"
                  className="form-control"
                  value={formik.values.weighBridgeWtTs
                    .replace(" ", "T")
                    .slice(0, 16)}
                  onChange={(e) => {
                    const val = e.target.value
                      ? e.target.value.replace("T", " ") + ":00"
                      : "";
                    formik.setFieldValue("weighBridgeWtTs", val);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Attachments */}
          <div className="panel">
            <h3 className="panel-title">Attachments</h3>
            <div className="alert alert-info">
              PDF only. Max 5MB. DG Declaration required for HAZ cargo.
            </div>

            {ATTACHMENT_TITLES.map((type) => (
              <div key={type.value} className="file-upload-wrapper">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {type.label}
                    {((type.value === "DG_DECLARATION" &&
                      formik.values.cargoTp === "HAZ") ||
                      (type.value === "AUTH_LETTER" &&
                        formik.values.shipperTp === "O" &&
                        !hasShipperAuth)) && (
                      <span className="required" style={{ color: "red" }}>
                        {" "}
                        *
                      </span>
                    )}
                  </div>
                </div>
                <div className="file-name">
                  {attachments.find((a) => a.attTitle === type.value)?.attNm ||
                    "No file chosen"}
                </div>

                <label className="btn btn-sm btn-outline">
                  Choose File
                  <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={(e) => handleFileUpload(e, type.value)}
                  />
                </label>

                {attachments.find((a) => a.attTitle === type.value) && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger-outline"
                    onClick={() =>
                      removeAttachment(
                        attachments.findIndex((a) => a.attTitle === type.value)
                      )
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="panel">
            <div className="d-flex gap-4" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : isEditMode
                  ? "Update VGM"
                  : "Submit VGM"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
};

export default VGMForm;
