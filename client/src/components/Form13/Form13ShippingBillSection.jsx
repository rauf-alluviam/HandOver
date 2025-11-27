import React from "react";

const Form13ShippingBillSection = ({
  formData,
  containerIndex,
  onFormDataChange,
  validationErrors,
}) => {
  const container = formData.containers?.[containerIndex];
  const sb = container?.sbDtlsVo?.[0] || {};

  const handleChange = (field, val) =>
    onFormDataChange("shippingBills", field, val, containerIndex);
  const err = (field) =>
    validationErrors[`container_${containerIndex}_${field}`];

  if (!container) return null;

  return (
    <>
      <div
        className="section-header"
        style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}
      >
        Shipping Bill Details
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>
            SB/Inv No <span className="required">*</span>
          </label>
          <input
            className={`form-control ${err("shipBillInvNo") ? "error" : ""}`}
            value={sb.shipBillInvNo}
            onChange={(e) => handleChange("shipBillInvNo", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            SB Date <span className="required">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={sb.shipBillDt}
            onChange={(e) => handleChange("shipBillDt", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            Exporter <span className="required">*</span>
          </label>
          <input
            className="form-control"
            value={sb.exporterNm}
            onChange={(e) => handleChange("exporterNm", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            IEC Code <span className="required">*</span>
          </label>
          <input
            className="form-control"
            value={sb.exporterIec}
            onChange={(e) => handleChange("exporterIec", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            CHA Name <span className="required">*</span>
          </label>
          <input
            className="form-control"
            value={sb.chaNm}
            onChange={(e) => handleChange("chaNm", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            No. Pkgs <span className="required">*</span>
          </label>
          <input
            type="number"
            className="form-control"
            value={sb.noOfPkg}
            onChange={(e) => handleChange("noOfPkg", e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default Form13ShippingBillSection;
