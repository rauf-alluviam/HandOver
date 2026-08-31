// client/src/components/ESB/ESBHeaderSection.jsx
import React from "react";
import {
  CONTAINER_STATUS_LOV,
  NATURE_OF_CARGO_LOV,
  CARGO_TYPE_LOV,
  SHIPPING_LINE_LOV,
} from "../../utils/esbValidations";
import { masterData } from "../../data/masterData";

const ESBHeaderSection = ({
  formData,
  onChange,
  errors = {},
  vessels = [],
  shippingLines = [],
  readOnly = false,
  totalGrossWt = 0,
  totalPkgs = 0,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const lineOptions =
    Array.isArray(shippingLines) && shippingLines.length > 0
      ? shippingLines.map((sl) => ({
          value: sl.code || sl.bnfCode || sl.value,
          label: `${sl.code || sl.bnfCode || sl.value} - ${sl.name || sl.bnfName || sl.label || sl.code}`,
        }))
      : SHIPPING_LINE_LOV;

  const ports = masterData.portIds || [];

  // 1. Dynamically Filter Shipping Line Options according to Selected Vessel
  const filteredLineOptions = React.useMemo(() => {
    const rawLines =
      Array.isArray(shippingLines) && shippingLines.length > 0
        ? shippingLines.map((sl) => ({
            value: sl.code || sl.bnfCode || sl.value,
            label: `${sl.code || sl.bnfCode || sl.value} - ${sl.name || sl.bnfName || sl.label || sl.code}`,
          }))
        : SHIPPING_LINE_LOV;

    if (formData.vesselNm && Array.isArray(vessels) && vessels.length > 0) {
      const selectedV = (formData.vesselNm || "").toUpperCase().trim();
      const matchingVesselObjs = vessels.filter(
        (v) => (v.vesselNm || v.vesselName || "").toUpperCase().trim() === selectedV
      );

      const validBnfCodes = new Set(
        matchingVesselObjs
          .map((v) => (v.bnfCode || "").toUpperCase().trim())
          .filter(Boolean)
      );

      if (validBnfCodes.size > 0) {
        const matchedLines = rawLines.filter((l) =>
          validBnfCodes.has((l.value || "").toUpperCase().trim())
        );
        if (matchedLines.length > 0) {
          return matchedLines;
        }
      }
    }

    return rawLines;
  }, [shippingLines, vessels, formData.vesselNm]);

  // 2. Dynamically Filter Vessel Options according to Selected Shipping Line & Port Location
  const filteredVessels = React.useMemo(() => {
    if (!Array.isArray(vessels) || vessels.length === 0) return [];
    let list = vessels;

    if (formData.locCode) {
      const loc = formData.locCode.toUpperCase().trim();
      const locMatched = list.filter(
        (v) => !v.locId || v.locId.toUpperCase().trim() === loc
      );
      if (locMatched.length > 0) {
        list = locMatched;
      }
    }

    if (formData.bnfCode) {
      const bnf = formData.bnfCode.toUpperCase().trim();
      const bnfMatched = list.filter(
        (v) => !v.bnfCode || v.bnfCode.toUpperCase().trim() === bnf
      );
      if (bnfMatched.length > 0) {
        list = bnfMatched;
      }
    }

    const unique = [];
    const seen = new Set();
    for (const v of list) {
      const name = (v.vesselNm || v.vesselName || "").trim();
      const via = (v.viaNo || "").trim();
      const key = `${name.toUpperCase()}_${via.toUpperCase()}`;
      if (name && !seen.has(key)) {
        seen.add(key);
        unique.push(v);
      }
    }

    return unique.sort((a, b) =>
      (a.vesselNm || a.vesselName || "").localeCompare(b.vesselNm || b.vesselName || "")
    );
  }, [vessels, formData.locCode, formData.bnfCode]);

  return (
    <div className="esb-panel">
      {/* Header Bar with Title and Summary Counters */}
      <div className="panel-header-bar">
        <h2 className="section-title">1. Header Information (General Details)</h2>
        <div className="summary-counters">
          <div className="counter-item">
            <span className="counter-label">Total Gross Wt(Kgs)</span>
            <span className="counter-value">{Number(totalGrossWt).toFixed(2)}</span>
          </div>
          <div className="counter-item">
            <span className="counter-label">Total Packages</span>
            <span className="counter-value">{totalPkgs}</span>
          </div>
        </div>
      </div>

      {/* Upload Helper Banner */}
      <div className="odex-upload-helper">
        <button type="button" className="btn-upload-sb">
          📁 Upload SB/LEO file
        </button>
        <span className="upload-note-link">
          Click Here to Upload .SB/LEO Copy to reduce Manual Data Entry
        </span>
      </div>

      {/* 3-Column Compact Form Grid */}
      <div className="header-form-grid">
        {/* COLUMN 1 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Sea / Port */}
          <div className="form-group">
            <label>
              Sea / Port Code <span className="required">*</span>
            </label>
            <select
              className={`form-control ${errors.locCode ? "error" : ""}`}
              name="locCode"
              value={formData.locCode || ""}
              disabled={readOnly}
              onChange={(e) => {
                const val = e.target.value;
                onChange("locCode", val);
                if (!formData.icdLocCode) onChange("icdLocCode", val);
                if (!formData.portOfSBFiled) onChange("portOfSBFiled", val);
              }}
            >
              <option value="">-- Select Port --</option>
              {ports.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.value} - {p.label}
                </option>
              ))}
            </select>
            {errors.locCode && <span className="error-text">{errors.locCode}</span>}
          </div>

          {/* BL No. */}
          <div className="form-group">
            <label>
              BL No. <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.blNo ? "error" : ""}`}
              name="blNo"
              value={formData.blNo || ""}
              maxLength={20}
              disabled={readOnly}
              onChange={handleChange}
              placeholder="e.g. AMD/EXP/SEA/01058/26"
            />
            {errors.blNo && <span className="error-text">{errors.blNo}</span>}
          </div>

          {/* SB Processed Location */}
          <div className="form-group">
            <label>
              SB Processed Location <span className="required">*</span>
            </label>
            <select
              className={`form-control ${errors.portOfSBFiled ? "error" : ""}`}
              name="portOfSBFiled"
              value={formData.portOfSBFiled || ""}
              disabled={readOnly}
              onChange={handleChange}
            >
              <option value="">-- Select Location --</option>
              {ports.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.value} - {p.label}
                </option>
              ))}
            </select>
            {errors.portOfSBFiled && <span className="error-text">{errors.portOfSBFiled}</span>}
          </div>

          {/* Via No. */}
          <div className="form-group">
            <label>
              Via No. / Voyage <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.viaNo ? "error" : ""}`}
              name="viaNo"
              value={formData.viaNo || ""}
              disabled={readOnly}
              onChange={handleChange}
              placeholder="e.g. 001"
            />
            {errors.viaNo && <span className="error-text">{errors.viaNo}</span>}
          </div>
        </div>

        {/* COLUMN 2 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Shipping Line */}
          <div className="form-group">
            <label>
              Shipping Line (Beneficiary) <span className="required">*</span>
            </label>
            <select
              className={`form-control ${errors.bnfCode ? "error" : ""}`}
              name="bnfCode"
              value={formData.bnfCode || ""}
              disabled={readOnly}
              onChange={(e) => {
                const selectedBnf = e.target.value;
                onChange("bnfCode", selectedBnf);
                onChange("bookLine", selectedBnf);

                if (selectedBnf && formData.vesselNm && Array.isArray(vessels)) {
                  const isVesselValidForLine = vessels.some(
                    (v) =>
                      (v.vesselNm || v.vesselName) === formData.vesselNm &&
                      (!v.bnfCode || v.bnfCode.toUpperCase() === selectedBnf.toUpperCase())
                  );
                  if (!isVesselValidForLine) {
                    onChange("vesselNm", "");
                    onChange("viaNo", "");
                  }
                }
              }}
            >
              <option value="">-- Select Shipping Line --</option>
              {filteredLineOptions.map((sl) => (
                <option key={sl.value} value={sl.value}>
                  {sl.label}
                </option>
              ))}
            </select>
            {errors.bnfCode && <span className="error-text">{errors.bnfCode}</span>}
          </div>

          {/* Is HBL Involved? */}
          <div className="form-group">
            <label>
              Is HBL Involved? <span className="required">*</span>
            </label>
            <select
              className="form-control"
              name="isHBLInvolved"
              value={formData.isHBLInvolved || "N"}
              disabled={readOnly}
              onChange={handleChange}
            >
              <option value="N">No (Straight/Direct MBL)</option>
              <option value="Y">Yes (House BL Involved)</option>
            </select>
          </div>

          {/* Booking Office Location */}
          <div className="form-group">
            <label>
              Booking Office Location {formData.bnfCode === "MSCU" && <span className="required">*</span>}
            </label>
            <input
              type="text"
              className={`form-control ${errors.gatewayLocCode ? "error" : ""}`}
              name="gatewayLocCode"
              value={formData.gatewayLocCode || ""}
              disabled={readOnly}
              onChange={handleChange}
              placeholder="Mandatory for MSC (e.g. INNSA1)"
            />
            {errors.gatewayLocCode && <span className="error-text">{errors.gatewayLocCode}</span>}
          </div>

          {/* Container Status */}
          <div className="form-group">
            <label>
              Container Status <span className="required">*</span>
            </label>
            <select
              className={`form-control ${errors.cntStatus ? "error" : ""}`}
              name="cntStatus"
              value={formData.cntStatus || "FCL"}
              disabled={readOnly}
              onChange={handleChange}
            >
              {CONTAINER_STATUS_LOV.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {errors.cntStatus && <span className="error-text">{errors.cntStatus}</span>}
          </div>
        </div>

        {/* COLUMN 3 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Booking No. */}
          <div className="form-group">
            <label>
              Booking No. <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.bookNo ? "error" : ""}`}
              name="bookNo"
              value={formData.bookNo || ""}
              maxLength={20}
              disabled={readOnly}
              onChange={handleChange}
              placeholder="e.g. BOOK015"
            />
            {errors.bookNo && <span className="error-text">{errors.bookNo}</span>}
          </div>

          {/* Booking Origin (ICD/Port) */}
          <div className="form-group">
            <label>
              Booking Origin (ICD/Port) <span className="required">*</span>
            </label>
            <select
              className={`form-control ${errors.icdLocCode ? "error" : ""}`}
              name="icdLocCode"
              value={formData.icdLocCode || ""}
              disabled={readOnly}
              onChange={handleChange}
            >
              <option value="">-- Select Origin --</option>
              {ports.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.value} - {p.label}
                </option>
              ))}
            </select>
            {errors.icdLocCode && <span className="error-text">{errors.icdLocCode}</span>}
          </div>

          {/* Vessel Name */}
          <div className="form-group">
            <label>
              Vessel Name <span className="required">*</span>
              <span className="sub-link">Click here if Vessel Not Found</span>
            </label>
            {vessels.length > 0 ? (
              <select
                className={`form-control ${errors.vesselNm ? "error" : ""}`}
                name="vesselNm"
                value={formData.vesselNm || ""}
                disabled={readOnly}
                onChange={(e) => {
                  const selectedVal = e.target.value;
                  onChange("vesselNm", selectedVal);

                  if (selectedVal && Array.isArray(vessels)) {
                    const matchedVessels = vessels.filter(
                      (v) => (v.vesselNm || v.vesselName) === selectedVal
                    );
                    if (matchedVessels.length > 0) {
                      const matchedV =
                        matchedVessels.find(
                          (v) =>
                            formData.bnfCode &&
                            v.bnfCode &&
                            v.bnfCode.toUpperCase() === formData.bnfCode.toUpperCase()
                        ) || matchedVessels[0];

                      if (matchedV.viaNo) {
                        onChange("viaNo", matchedV.viaNo);
                      }
                      if (matchedV.bnfCode) {
                        onChange("bnfCode", matchedV.bnfCode.toUpperCase());
                        onChange("bookLine", matchedV.bnfCode.toUpperCase());
                      }
                    }
                  }
                }}
              >
                <option value="">-- Select Vessel --</option>
                {filteredVessels.map((v, i) => (
                  <option key={i} value={v.vesselNm || v.vesselName}>
                    {v.vesselNm || v.vesselName} {v.viaNo ? `(Via: ${v.viaNo})` : ""} {v.bnfCode ? `[${v.bnfCode}]` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className={`form-control ${errors.vesselNm ? "error" : ""}`}
                name="vesselNm"
                value={formData.vesselNm || ""}
                disabled={readOnly}
                onChange={handleChange}
                placeholder="e.g. DUMMY VSL NHAVA SHEVA"
              />
            )}
            {errors.vesselNm && <span className="error-text">{errors.vesselNm}</span>}
          </div>

          {/* FPOD */}
          <div className="form-group">
            <label>
              FPOD (Final Port of Discharge) <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.pod ? "error" : ""}`}
              name="pod"
              value={formData.pod || ""}
              disabled={readOnly}
              onChange={handleChange}
              placeholder="e.g. AOBDD"
            />
            {errors.pod && <span className="error-text">{errors.pod}</span>}
          </div>

          {/* Nature of Cargo */}
          <div className="form-group">
            <label>
              Nature of Cargo <span className="required">*</span>
            </label>
            <select
              className={`form-control ${errors.natureOfCargo ? "error" : ""}`}
              name="natureOfCargo"
              value={formData.natureOfCargo || "C"}
              disabled={readOnly}
              onChange={handleChange}
            >
              {NATURE_OF_CARGO_LOV.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {errors.natureOfCargo && <span className="error-text">{errors.natureOfCargo}</span>}
          </div>
        </div>
      </div>

      {/* Red Guidance Notice Box */}
      <div className="odex-notice-box">
        Requesting customers to update the MBL Number in the BL Number Field if shipment has straight/Direct BL . In case of HBL Involved requesting to add the HBL Number in the BL Number Field.
      </div>
    </div>
  );
};

export default ESBHeaderSection;
