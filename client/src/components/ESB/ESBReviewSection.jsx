// client/src/components/ESB/ESBReviewSection.jsx
import React from "react";

const ESBReviewSection = ({ formData }) => {
  const containers = formData.containers || formData.egmRequestcntnrVoList || [];
  const attachments = formData.attachments || formData.egmReqAttVoList || [];

  return (
    <div>
      {/* Header Summary */}
      <div className="esb-panel">
        <div className="panel-header">
          <span>Header Declaration Review</span>
        </div>

        <div className="form-grid">
          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Payor Code</span>
            <div><strong>{formData.pyrCode || "-"}</strong></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Sea / Port Code</span>
            <div><strong>{formData.locCode || "-"}</strong></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Shipping Line</span>
            <div><strong style={{ color: "#1e3a8a" }}>{formData.bnfCode || "-"}</strong></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Booking No.</span>
            <div><strong>{formData.bookNo || "-"}</strong></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>BL No.</span>
            <div><strong>{formData.blNo || "-"}</strong></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Is HBL Involved?</span>
            <div><strong>{formData.isHBLInvolved === "Y" ? "Yes" : "No"}</strong></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Vessel Name</span>
            <div><strong>{formData.vesselNm || "-"}</strong></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Via No. / Voyage</span>
            <div><strong>{formData.viaNo || "-"}</strong></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Container Status</span>
            <div><span className="badge badge-blue">{formData.cntStatus || "FCL"}</span></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Booking Origin</span>
            <div><strong>{formData.icdLocCode || "-"}</strong></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>SB Processed Location</span>
            <div><strong>{formData.portOfSBFiled || "-"}</strong></div>
          </div>

          <div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Destination Port (FPOD)</span>
            <div><strong>{formData.pod || "-"}</strong></div>
          </div>
        </div>
      </div>

      {/* Container Summary */}
      <div className="esb-panel">
        <div className="panel-header">
          <span>Container & Shipping Bill Summary ({containers.length})</span>
        </div>

        <div className="table-responsive">
          <table className="esb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Container No</th>
                <th>SB No & Date</th>
                <th>Exporter Name</th>
                <th>Gross Wt</th>
                <th>Packages</th>
                <th>Agent Code</th>
                <th>SB Type</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((cnt, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td><strong style={{ color: "#1e3a8a" }}>{cnt.cntNo}</strong></td>
                  <td>{cnt.shipBillNo} ({cnt.shipBillDt})</td>
                  <td>{cnt.exporterNm}</td>
                  <td>{cnt.grossWt} KG</td>
                  <td>{cnt.noOfPkg} {cnt.typOfPackages}</td>
                  <td>{cnt.cntnrAgentCode}</td>
                  <td><span className="badge badge-green">{cnt.shipBillTp || "DFS"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attachments Summary */}
      <div className="esb-panel">
        <div className="panel-header">
          <span>Uploaded Attachments ({attachments.length})</span>
        </div>

        {attachments.length === 0 ? (
          <p style={{ color: "#64748b", margin: 0 }}>No attachments added.</p>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {attachments.map((att, idx) => (
              <span key={idx} className="badge badge-blue">
                {att.attTitle}: {att.attNm}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ESBReviewSection;
