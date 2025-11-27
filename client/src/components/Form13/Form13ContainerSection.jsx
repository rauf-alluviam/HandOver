import React from "react";
import { masterData, getIsoCodesBySize } from "../../data/masterData";
import Form13ShippingBillSection from "./Form13ShippingBillSection";

const Form13ContainerSection = ({
  formData,
  onFormDataChange,
  onAddContainer,
  onRemoveContainer,
  validationErrors = {},
}) => {
  const { containerSizes, specialStowOptions, odcUnits, imoNumbers } =
    masterData;

  const handleContainerChange = (idx, field, val) =>
    onFormDataChange("containers", field, val, idx);

  // SVG Icons
  const Icons = {
    Delete: () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    Add: () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  };

  return (
    <>
      <div className="section-header">
        <span>Container Details ({formData.containers.length})</span>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={onAddContainer}
        >
          <Icons.Add /> Add Container
        </button>
      </div>

      {formData.containers.map((container, index) => {
        const errorKey = (field) =>
          validationErrors[`container_${index}_${field}`];
        const availableIsoCodes = getIsoCodesBySize(container.cntnrSize);

        return (
          <div
            key={
              container.cntnrNo || container.agentSealNo || container.customSealNo || `container-${index}`
            }
            className="panel border-left-primary"
            style={{ marginBottom: "1rem" }}
          >
            <div className="d-flex justify-between mb-2">
              <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                #{index + 1}
              </span>
              {formData.containers.length > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger-outline"
                  onClick={() => onRemoveContainer(index)}
                >
                  <Icons.Delete />
                </button>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  Container No <span className="required">*</span>
                </label>
                <input
                  className={`form-control ${
                    errorKey("cntnrNo") ? "error" : ""
                  }`}
                  value={container.cntnrNo}
                  onChange={(e) =>
                    handleContainerChange(index, "cntnrNo", e.target.value)
                  }
                  maxLength={11}
                />
              </div>

              <div className="form-group">
                <label>
                  Size <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  value={container.cntnrSize}
                  onChange={(e) =>
                    handleContainerChange(index, "cntnrSize", e.target.value)
                  }
                >
                  <option value="">Sel</option>
                  {containerSizes.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  ISO <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  value={container.iso}
                  onChange={(e) =>
                    handleContainerChange(index, "iso", e.target.value)
                  }
                >
                  <option value="">Sel</option>
                  {availableIsoCodes.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  Agent Seal <span className="required">*</span>
                </label>
                <input
                  className="form-control"
                  value={container.agentSealNo}
                  onChange={(e) =>
                    handleContainerChange(index, "agentSealNo", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Custom Seal <span className="required">*</span>
                </label>
                <input
                  className="form-control"
                  value={container.customSealNo}
                  onChange={(e) =>
                    handleContainerChange(index, "customSealNo", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>VGM by ODeX</label>
                <select
                  className="form-control"
                  value={container.vgmViaODeX}
                  onChange={(e) =>
                    handleContainerChange(index, "vgmViaODeX", e.target.value)
                  }
                >
                  <option value="N">No</option>
                  <option value="Y">Yes</option>
                </select>
              </div>

              {container.vgmViaODeX === "N" && (
                <div className="form-group">
                  <label>
                    VGM (MT) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={container.vgmWt}
                    onChange={(e) =>
                      handleContainerChange(index, "vgmWt", e.target.value)
                    }
                  />
                </div>
              )}

              <div className="form-group">
                <label>
                  Driver Name <span className="required">*</span>
                </label>
                <input
                  className="form-control"
                  value={container.driverNm}
                  onChange={(e) =>
                    handleContainerChange(index, "driverNm", e.target.value)
                  }
                />
              </div>
            </div>

            {/* HAZ / REF / ODC Conditionals can be added here following same pattern */}

            <div className="mt-2 border-top">
              <Form13ShippingBillSection
                formData={formData}
                containerIndex={index}
                onFormDataChange={onFormDataChange}
                validationErrors={validationErrors}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Form13ContainerSection;
