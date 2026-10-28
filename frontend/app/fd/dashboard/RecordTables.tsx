"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n || 0);
const fmtCurrency = (n: number) => `₹${fmt(n)}`;
const fmtDate = (d: any) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export function isPendingRecord(status?: string) {
  const s = String(status || "").toUpperCase();
  return (
    s === "PENDING" ||
    s === "SUBMITTED" ||
    s === "UNDER_REVIEW" ||
    s === "PENDING_VERIFICATION" ||
    s === "PENDING VERIFICATION"
  );
}

export function isRejectedRecord(status?: string) {
  const s = String(status || "").toUpperCase();
  return s === "REJECTED" || s === "DECLINED" || s === "NOT VERIFIED" || s === "NOT_VERIFIED";
}

export function pendingRows(applications: any[], deposits: any[], releases: any[]) {
  const rows: Array<{
    id: string;
    formNumber: string;
    institution: string;
    formType: "Approval Seeking" | "Payment Details" | "Release Application";
    submittedAt: any;
    status: string;
    targetPage: string;
  }> = [];

  for (const a of applications) {
    if (!isPendingRecord(a.status)) continue;
    rows.push({
      id: `app-${a.id}`,
      formNumber: a.applicationId || a.id || a.refNumber,
      institution: a.collegeName || a.collegeId,
      formType: "Approval Seeking",
      submittedAt: a.applicationDate || a.createdAt,
      status: a.status || "SUBMITTED",
      targetPage: "approval-applications",
    });
  }
  for (const d of deposits) {
    if (!isPendingRecord(d.status)) continue;
    rows.push({
      id: `dep-${d.id}`,
      formNumber: d.id || d.paymentId,
      institution: d.collegeName || d.collegeId,
      formType: "Payment Details",
      submittedAt: d.depositDate || d.createdAt,
      status: d.status || "SUBMITTED",
      targetPage: "deposit-records",
    });
  }
  for (const r of releases) {
    if (!isPendingRecord(r.status)) continue;
    rows.push({
      id: `rel-${r.id}`,
      formNumber: r.id || r.releaseRequestId,
      institution: r.collegeName || r.collegeId,
      formType: "Release Application",
      submittedAt: r.requestDate || r.createdAt,
      status: r.status || "SUBMITTED",
      targetPage: "release-applications",
    });
  }
  return rows;
}

export function rejectedRows(applications: any[], deposits: any[], releases: any[]) {
  const rows: Array<{
    id: string;
    formNumber: string;
    formName: string;
    formType: "Approval Seeking" | "Payment Details" | "Release Application";
    reason: string;
    rejectedDate: any;
  }> = [];

  for (const a of applications) {
    if (!isRejectedRecord(a.status)) continue;
    const remarks = Array.isArray(a.deficiencyRemarks)
      ? a.deficiencyRemarks.map((x: any) => x?.remarks || x?.message || x).filter(Boolean).join("; ")
      : a.remarks || a.letterText || "";
    rows.push({
      id: `app-${a.id}`,
      formNumber: a.applicationId || a.id || a.refNumber,
      formName: a.programme || a.title || "Approval seeking application",
      formType: "Approval Seeking",
      reason: remarks || "Application rejected after document review.",
      rejectedDate: a.reviewedAt || a.letterSentDate || a.updatedAt || a.applicationDate,
    });
  }
  for (const d of deposits) {
    if (!isRejectedRecord(d.status)) continue;
    rows.push({
      id: `dep-${d.id}`,
      formNumber: d.id || d.paymentId,
      formName: "Payment / FDR submission",
      formType: "Payment Details",
      reason: d.remarks || "Deposit documents were not verified.",
      rejectedDate: d.reviewedAt || d.updatedAt || d.depositDate,
    });
  }
  for (const r of releases) {
    if (!isRejectedRecord(r.status)) continue;
    rows.push({
      id: `rel-${r.id}`,
      formNumber: r.id || r.releaseRequestId,
      formName: "FDR release application",
      formType: "Release Application",
      reason: r.declineRemarks || r.reason || "Release application declined.",
      rejectedDate: r.reviewedAt || r.requestDate,
    });
  }
  return rows;
}

export function releasedFdRows(deposits: any[], releases: any[]) {
  const approvedRefs = new Set(
    releases
      .filter((r) => String(r.status).toLowerCase() === "approved")
      .map((r) => String(r.fdrId || r.fdrReference || "").trim())
      .filter(Boolean)
  );

  return deposits
    .filter((d) => d.isActive === false || d.releasedAt || approvedRefs.has(String(d.fdrNumber || d.fdrReference || "").trim()))
    .map((d) => ({
      id: d.id,
      fdNumber: d.fdrNumber || d.fdrReference || d.id,
      collegeName: d.collegeName || d.collegeId,
      bankName: d.bankName || "—",
      branchName: d.branchName || "—",
      amount: d.amount,
      releaseDate: d.releasedAt || d.updatedAt || d.depositDate,
    }));
}

function EmptyOrError({ error, empty }: { error?: string; empty: string }) {
  return (
    <tr>
      <td colSpan={8} style={{ textAlign: "center", padding: 32, color: error ? "var(--danger)" : "var(--text-muted)" }}>
        {error || empty}
      </td>
    </tr>
  );
}

export function PendingVerificationView({
  applications,
  deposits,
  releaseRequests,
  loadError,
  navigate,
}: {
  applications: any[];
  deposits: any[];
  releaseRequests: any[];
  loadError?: string;
  navigate: (page: string) => void;
}) {
  const rows = pendingRows(applications, deposits, releaseRequests);
  return (
    <div className="animate-fade-in">
      <div className="breadcrumb" style={{ marginBottom: 12 }}>
        <span>Employee Portal</span>
        <ChevronRight size={14} style={{ margin: "0 4px", verticalAlign: "middle" }} />
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Pending Verification</span>
      </div>
      <h1 className="page-title">Pending Verification</h1>
      <p className="page-subtitle">Submissions awaiting Finance Bureau verification. Bank and FD amount fields are shown on the deposit and alive-FD pages.</p>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table" style={{ minWidth: 860 }}>
            <thead>
              <tr>
                <th>Submission ID</th>
                <th>Institution</th>
                <th>Form Type</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <EmptyOrError error={loadError} empty="No submissions are pending verification." />
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td><code>{row.formNumber}</code></td>
                    <td style={{ fontWeight: 600 }}>{row.institution}</td>
                    <td>{row.formType}</td>
                    <td>{fmtDate(row.submittedAt)}</td>
                    <td>{row.status}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(row.targetPage)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ReleasedFdsView({
  deposits,
  releaseRequests,
  loadError,
}: {
  deposits: any[];
  releaseRequests: any[];
  loadError?: string;
}) {
  const rows = releasedFdRows(deposits, releaseRequests);
  return (
    <div className="animate-fade-in">
      <div className="breadcrumb" style={{ marginBottom: 12 }}>
        <span>Employee Portal</span>
        <ChevronRight size={14} style={{ margin: "0 4px", verticalAlign: "middle" }} />
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Released FDs</span>
      </div>
      <h1 className="page-title">Released FDs</h1>
      <p className="page-subtitle">Fixed deposits that have been released after an approved release application.</p>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table" style={{ minWidth: 920 }}>
            <thead>
              <tr>
                <th>FD Number</th>
                <th>Bank Name</th>
                <th>Bank Branch</th>
                <th>Amount</th>
                <th>Release Date</th>
                <th>Institution</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <EmptyOrError error={loadError} empty="No released FD records are available." />
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td><code>{row.fdNumber}</code></td>
                    <td>{row.bankName}</td>
                    <td>{row.branchName}</td>
                    <td style={{ fontWeight: 600 }}>{fmtCurrency(row.amount)}</td>
                    <td>{fmtDate(row.releaseDate)}</td>
                    <td style={{ fontWeight: 600 }}>{row.collegeName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function RejectedFormsView({
  applications,
  deposits,
  releaseRequests,
  loadError,
}: {
  applications: any[];
  deposits: any[];
  releaseRequests: any[];
  loadError?: string;
}) {
  const rows = rejectedRows(applications, deposits, releaseRequests);
  return (
    <div className="animate-fade-in">
      <div className="breadcrumb" style={{ marginBottom: 12 }}>
        <span>Employee Portal</span>
        <ChevronRight size={14} style={{ margin: "0 4px", verticalAlign: "middle" }} />
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Rejected Forms</span>
      </div>
      <h1 className="page-title">Rejected Forms</h1>
      <p className="page-subtitle">Approval seeking, payment details, and release applications that were rejected with a recorded reason.</p>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th>Form Number / Submission ID</th>
                <th>Form Name</th>
                <th>Form Type</th>
                <th>Rejection Reason</th>
                <th>Rejected Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <EmptyOrError error={loadError} empty="No rejected forms are recorded." />
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td><code>{row.formNumber}</code></td>
                    <td>{row.formName}</td>
                    <td>{row.formType}</td>
                    <td>{row.reason}</td>
                    <td>{fmtDate(row.rejectedDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
