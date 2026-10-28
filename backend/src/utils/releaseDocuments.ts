export const RELEASE_DOCUMENT_ORDER = [
  { key: "releaseLetter", name: "Release Letter" },
  { key: "fdReceipt", name: "FD Receipt" },
  { key: "affidavit", name: "Affidavit" },
  { key: "eoa", name: "EoA" },
] as const;

const NAME_ALIASES: Record<string, string> = {
  "release letter": "Release Letter",
  "release approval letter": "Release Letter",
  releaseletter: "Release Letter",
  "fd receipt": "FD Receipt",
  "fdr copy": "FD Receipt",
  "fdr receipt": "FD Receipt",
  "fixed deposit receipt": "FD Receipt",
  fdreceipt: "FD Receipt",
  fdrcopy: "FD Receipt",
  affidavit: "Affidavit",
  eoa: "EoA",
  "extension of approval": "EoA",
  "extension of approval (eoa)": "EoA",
};

export function canonicalReleaseDocName(raw?: string): string | null {
  if (!raw) return null;
  const key = String(raw).trim().toLowerCase();
  return NAME_ALIASES[key] || NAME_ALIASES[key.replace(/[\s_-]+/g, "")] || null;
}

export function storedVerificationStatus(status?: string): "Verified" | "Not Verified" | "Pending" {
  const s = String(status || "").trim().toLowerCase();
  if (s === "verified") return "Verified";
  if (s.includes("not") || s === "rejected" || s === "not verified" || s === "not_verified") return "Not Verified";
  return "Pending";
}

export function displayVerificationStatus(status?: string): "Pending Verification" | "Verified" | "Rejected" {
  const stored = storedVerificationStatus(status);
  if (stored === "Verified") return "Verified";
  if (stored === "Not Verified") return "Rejected";
  return "Pending Verification";
}

export function normalizeVerificationDecision(status?: string): "Verified" | "Not Verified" | null {
  const s = String(status || "").trim().toLowerCase();
  if (s === "verified") return "Verified";
  if (s === "not verified" || s === "rejected" || s === "not_verified") return "Not Verified";
  return null;
}

function emptyDoc(name: string, idx: number, uploadDate?: Date) {
  return {
    id: `doc-${idx + 1}`,
    key: RELEASE_DOCUMENT_ORDER[idx]?.key,
    name,
    type: "PDF",
    size: "—",
    uploadDate: uploadDate || new Date(),
    status: "Pending",
    displayStatus: "Pending Verification",
    storedStatus: "Pending",
    file: "",
    remarks: "",
  };
}

/**
 * Always return the four release documents in this order:
 * Release Letter, FD Receipt, Affidavit, EoA
 */
export function getReleaseDocuments(r: any) {
  const uploadDate = r?.submissionDate || r?.createdAt;
  const byCanonical = new Map<string, any>();

  const ingest = (d: any, fallbackName?: string) => {
    const name = canonicalReleaseDocName(d?.name || d?.key || fallbackName) || fallbackName;
    if (!name) return;
    const existing = byCanonical.get(name);
    const file = d?.file || d?.fileName || existing?.file || existing?.fileName || "";
    if (!file && !d?.status && !existing) return;
    byCanonical.set(name, {
      ...(existing || {}),
      ...d,
      file,
      fileName: d?.fileName || d?.file || existing?.fileName || existing?.file || "",
      name,
      key: RELEASE_DOCUMENT_ORDER.find((x) => x.name === name)?.key,
      storedStatus: storedVerificationStatus(d?.status || existing?.storedStatus || existing?.status),
      status: storedVerificationStatus(d?.status || existing?.storedStatus || existing?.status),
    });
  };

  if (Array.isArray(r?.documentItems) && r.documentItems.length > 0) {
    r.documentItems.forEach((d: any) => ingest(d, d?.name));
  }

  const details = r?.documentDetails || r?.documents;
  if (details && !Array.isArray(details) && typeof details === "object") {
    ingest({ file: details.releaseLetter, fileName: details.releaseLetter, key: "releaseLetter" }, "Release Letter");
    ingest({ file: details.fdrCopy || details.fdReceipt, fileName: details.fdrCopy || details.fdReceipt, key: "fdReceipt" }, "FD Receipt");
    ingest({ file: details.affidavit, fileName: details.affidavit, key: "affidavit" }, "Affidavit");
    ingest({ file: details.eoa, fileName: details.eoa, key: "eoa" }, "EoA");
  }

  if (Array.isArray(r?.documents) && r.documents.length > 0 && typeof r.documents[0] === "string") {
    // Institution POST stores [releaseLetter, eoa, affidavit, fdrCopy]
    const mapped = [
      { file: r.documents[0], name: "Release Letter" },
      { file: r.documents[1], name: "EoA" },
      { file: r.documents[2], name: "Affidavit" },
      { file: r.documents[3], name: "FD Receipt" },
    ];
    mapped.forEach((item) => {
      if (!byCanonical.has(item.name) && item.file) {
        ingest(item, item.name);
      }
    });
  }

  return RELEASE_DOCUMENT_ORDER.map((def, idx) => {
    const found = byCanonical.get(def.name);
    if (!found) return emptyDoc(def.name, idx, uploadDate);
    return {
      id: found.id || `doc-${idx + 1}`,
      key: def.key,
      name: def.name,
      type: found.type || "PDF",
      size: found.size || "—",
      uploadDate: found.uploadDate || uploadDate,
      status: storedVerificationStatus(found.storedStatus || found.status),
      displayStatus: displayVerificationStatus(found.storedStatus || found.status),
      storedStatus: storedVerificationStatus(found.storedStatus || found.status),
      file: found.file || found.fileName || "",
      fileName: found.fileName || found.file || "",
      fileUrl: found.fileUrl || (found.fileName ? `/api/fd/files/${found.fileName}` : ""),
      remarks: found.remarks || "",
      verifiedBy: found.verifiedBy,
      verifiedAt: found.verifiedAt,
    };
  });
}
