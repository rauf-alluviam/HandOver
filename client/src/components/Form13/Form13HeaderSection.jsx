import React from "react";
import { masterData, getTerminalCodes } from "../../data/masterData";

const Form13HeaderSection = ({
  formData,
  vessels,
  pods,
  masterDataLoaded,
  loading,
  onFormDataChange,
  validationErrors = {},
}) => {
  const { cargoTypes, originTypes, containerStatuses, portIds } = masterData;

  // Helper to render select options. Accepts an array of primitives or objects.
  const renderOptions = (items, valKey, lblKey) =>
    items.map((item) => {
      // item can be a primitive (string/number) or an object
      const value = valKey ? item[valKey] : item;
      const label = lblKey ? item[lblKey] : item;
      return (
        <option key={String(value ?? "")} value={value}>
          {label}
        </option>
      );
    });

  const getVesselOptions = () =>
    vessels.filter((v) => v.chaValidFrm && v.chaValidTo); // simplified filter

  const getPODOptions = () => {
    // Logic to filter PODs based on terminal - simplified for render
    if (!pods || !formData.terminalCode) return [];
    // ... use existing logic ...
    return [];
  };

  const Input = ({ label, name, required, ...props }) => (
    <div className="form-group">
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        className={`form-control ${validationErrors[name] ? "error" : ""}`}
        value={formData[name]}
        onChange={(e) => onFormDataChange("header", name, e.target.value)}
        disabled={!masterDataLoaded || loading}
        {...props}
      />
      {validationErrors[name] && (
        <span className="error-text">{validationErrors[name]}</span>
      )}
    </div>
  );

  const Select = ({ label, name, options, required, disabled }) => (
    <div className="form-group">
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      <select
        className={`form-control ${validationErrors[name] ? "error" : ""}`}
        value={formData[name]}
        onChange={(e) => onFormDataChange("header", name, e.target.value)}
        disabled={disabled || !masterDataLoaded || loading}
      >
        <option value="">Select...</option>
        {options}
      </select>
    </div>
  );

  return (
    <>
      <div className="section-header">Header Information</div>
      <div className="form-grid">
        <Select
          label="Shipping Line"
          name="bnfCode"
          required
          options={renderOptions(
            // create unique primitive list of shipping line codes
            [...new Set(vessels.map((v) => v.bnfCode).filter(Boolean))]
          )}
        />
        <Select
          label="Location"
          name="locId"
          required
          options={renderOptions(portIds, "value", "label")}
        />
        <Select
          label="Vessel Name"
          name="vesselNm"
          required
          disabled={!formData.bnfCode}
          options={renderOptions(getVesselOptions(), "vesselNm", "vesselNm")}
        />
        <Select
          label="VIA No"
          name="viaNo"
          required
          options={renderOptions(
            [...new Set(vessels.map((v) => v.viaNo).filter(Boolean))]
          )}
        />
        <Select
          label="Terminal"
          name="terminalCode"
          required
          options={renderOptions(
            [...new Set(vessels.map((v) => v.terminalCode).filter(Boolean))]
          )}
        />
        <Select
          label="Service"
          name="service"
          required
          options={renderOptions(
            // dedupe service values for the selected vessel
            [...new Set(
              vessels
                .filter((v) => v.vesselNm === formData.vesselNm)
                .map((v) => v.service)
                .filter(Boolean)
            )]
          )}
        />
        <Select
          label="Cargo Type"
          name="cargoTp"
          required
          options={renderOptions(cargoTypes, "value", "label")}
        />
        <Select
          label="Origin"
          name="origin"
          required
          options={renderOptions(originTypes, "value", "label")}
        />
        <Input label="Shipper Name" name="shipperNm" required />
        <Input label="Mobile No" name="mobileNo" required />

        {formData.origin === "C" && (
          <Select
            label="CFS Code"
            name="cfsCode"
            required
            options={
              <>
                <option value="CFS1">CFS 1</option>
              </>
            }
          />
        )}
      </div>
    </>
  );
};

export default Form13HeaderSection;
