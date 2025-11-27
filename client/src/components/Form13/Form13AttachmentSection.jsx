import React, { useState } from "react";

const Form13AttachmentSection = ({
  formData,
  onFormDataChange,
  validationErrors,
}) => {
  const [selectedType, setSelectedType] = useState("BOOKING_COPY");

  const documentTypes = [
    { code: "BOOKING_COPY", name: "Booking Copy" },
    { code: "DG_DCLRTION", name: "DG Declaration" },
    { code: "SHIP_BILL", name: "Shipping Bill" },
    { code: "OTHER_DOCUMENT", name: "Other Document" },
  ];

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Add logic to validate PDF < 5MB here
    const newFiles = files.map((f) => {
      f.title = selectedType;
      return f;
    });

    onFormDataChange("attachments", "", [...formData.attachments, ...newFiles]);
  };

  const removeFile = (idx) => {
    onFormDataChange(
      "attachments",
      "",
      formData.attachments.filter((_, i) => i !== idx)
    );
  };

  return (
    <>
      <div className="section-header">Attachments</div>
      <div className="form-grid" style={{ alignItems: "end" }}>
        <div className="form-group">
          <label>Document Type</label>
          <select
            className="form-control"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {documentTypes.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label
            className="btn btn-outline w-full"
            style={{ justifyContent: "center" }}
          >
            Upload PDF
            <input type="file" hidden accept=".pdf" onChange={handleUpload} />
          </label>
        </div>
      </div>

      <div className="file-list mt-2">
        {formData.attachments.map((f, i) => (
          <div
            key={`${f.name}-${f.size}-${f.lastModified ?? i}`}
            className="file-item"
          >
            <span style={{ color: "#64748b" }}>📄</span>
            <div className="file-name">{f.name}</div>
            <span
              style={{
                fontSize: "0.7rem",
                background: "#e2e8f0",
                padding: "1px 4px",
                borderRadius: "2px",
              }}
            >
              {f.title}
            </span>
            <button
              type="button"
              onClick={() => removeFile(i)}
              style={{
                border: "none",
                background: "none",
                color: "#ef4444",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Form13AttachmentSection;
