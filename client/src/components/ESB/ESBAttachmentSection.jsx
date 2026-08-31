// client/src/components/ESB/ESBAttachmentSection.jsx
import React, { useState } from "react";
import { ATTACHMENT_TITLE_LOV } from "../../utils/esbValidations";

const ESBAttachmentSection = ({
  attachments = [],
  onAddAttachment,
  onRemoveAttachment,
  readOnly = false,
}) => {
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadError("");

    files.forEach((file) => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setUploadError(`Only PDF files are allowed. (${file.name})`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File ${file.name} exceeds maximum 5MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result.split(",")[1];
        const nextTitle =
          ATTACHMENT_TITLE_LOV[attachments.length % ATTACHMENT_TITLE_LOV.length].value;

        onAddAttachment({
          attNm: file.name,
          attTitle: nextTitle,
          attDesc: `${file.name} document`,
          attData: base64String,
          sizeBytes: file.size,
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = null;
  };

  const calculateTotalSizeMB = () => {
    const totalBytes = attachments.reduce((acc, curr) => {
      if (curr.sizeBytes) return acc + curr.sizeBytes;
      if (curr.attData) return acc + (curr.attData.length * 3) / 4;
      return acc;
    }, 0);
    return (totalBytes / (1024 * 1024)).toFixed(2);
  };

  const totalSize = calculateTotalSizeMB();

  return (
    <div className="esb-panel">
      <div className="panel-header-bar">
        <h2 className="section-title">3. Mandatory & Optional Attachments</h2>
        {!readOnly && (
          <label className="btn btn-outline btn-sm" style={{ cursor: "pointer" }}>
            + Upload PDF Document
            <input
              type="file"
              hidden
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      {uploadError && (
        <div className="alert alert-error">
          <span>{uploadError}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => setUploadError("")}
          >
            &times;
          </button>
        </div>
      )}

      {Number(totalSize) > 4.0 && (
        <div className="alert alert-warning">
          <span>
            Total attachment size is <b>{totalSize} MB</b>. (ODeX recommends keeping total attachment size under 4.0 MB).
          </span>
        </div>
      )}

      {attachments.length === 0 ? (
        <div
          style={{
            padding: "1.5rem",
            textAlign: "center",
            border: "2px dashed #cbd5e1",
            borderRadius: "6px",
            background: "#f8fafc",
            color: "#64748b",
            fontSize: "12.5px",
          }}
        >
          <p style={{ margin: 0, fontWeight: 500 }}>
            No attachments uploaded yet. Click <b>+ Upload PDF Document</b> to attach Shipping Bill / LEO (LOC), EIR, TSR documents.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="esb-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>File Name</th>
                <th>Document Title *</th>
                <th>Description</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((att, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{att.attNm}</strong>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      value={att.attTitle || "LOC"}
                      disabled={readOnly}
                      onChange={(e) => {
                        const updated = [...attachments];
                        updated[idx].attTitle = e.target.value;
                        onAddAttachment(updated, true);
                      }}
                    >
                      {ATTACHMENT_TITLE_LOV.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={att.attDesc || ""}
                      disabled={readOnly}
                      placeholder="Optional description"
                      onChange={(e) => {
                        const updated = [...attachments];
                        updated[idx].attDesc = e.target.value;
                        onAddAttachment(updated, true);
                      }}
                    />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {!readOnly && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onRemoveAttachment(idx)}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ESBAttachmentSection;
