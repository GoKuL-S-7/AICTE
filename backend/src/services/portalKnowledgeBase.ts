// src/services/portalKnowledgeBase.ts
/**
 * AICTE UNIFIED PORTAL - COMPREHENSIVE PORTAL KNOWLEDGE BASE
 * 
 * Single source of truth containing verified, role-specific documentation for:
 * 1. Institution Portal (All 12 sub-routes and modules)
 * 2. FD Verification Employee Portal (All 9 navigation views, review tables, and action modals)
 * 3. PGRC Employee Portal (Tabs, complaint dossiers, investigation logs, and proven/unproven decisions)
 * 4. Vigilance Employee Portal (Tabs, dossiers, inquiry notes, and proven/unproven decisions)
 * 5. Public Grievance (PGRC) & Vigilance Complaint Portals and Tracking Pages
 * 6. Workflows, Statuses, Exact Button actions, and Terminology
 */

export interface PageControlDoc {
  name: string;
  type: "button" | "tab" | "form_field" | "dropdown" | "table_action" | "modal" | "card";
  label: string;
  purpose: string;
  whenToUse: string;
  expectedResult: string;
}

export interface PortalPageDoc {
  id: string;
  title: string;
  path: string;
  role: "INSTITUTION" | "AICTE_FD_EMPLOYEE" | "PGRC_EMPLOYEE" | "VIGILANCE_EMPLOYEE" | "PUBLIC" | "SHARED";
  purpose: string;
  overview: string;
  navigationPath: string;
  controls: PageControlDoc[];
  statuses: Record<string, string>;
  prerequisites: string[];
  nextSteps: string[];
}

export const PORTAL_PAGES_KNOWLEDGE: Record<string, PortalPageDoc> = {
  // =========================================================================
  // 1. INSTITUTION PORTAL PAGES
  // =========================================================================
  institutionDashboard: {
    id: "institutionDashboard",
    title: "Institution Dashboard",
    path: "/institution/dashboard",
    role: "INSTITUTION",
    purpose: "Primary workspace overview for technical institutions showing real-time statistics, active applications, approval states, and alert cards.",
    overview: "Displays statutory institution identity, application status badges, deposit summary, pending action alerts, and fast navigation links.",
    navigationPath: "Sidebar Menu → Dashboard (/institution/dashboard)",
    controls: [
      {
        name: "Quick Action - Submit Approval",
        type: "button",
        label: "Submit Application / Approval Seeking",
        purpose: "Quick shortcut to launch or edit a statutory document submission.",
        whenToUse: "When initiating a new LoA/EoA submission or rectifying deficient documents.",
        expectedResult: "Navigates to /institution/submit/approval."
      },
      {
        name: "Quick Action - Payment / FDR",
        type: "button",
        label: "Payment / FDR Submission",
        purpose: "Quick shortcut to record security deposit / FDR details.",
        whenToUse: "After obtaining an FDR from a scheduled commercial bank.",
        expectedResult: "Navigates to /institution/submit/payment."
      },
      {
        name: "Notification Bell",
        type: "button",
        label: "🔔 (Bell Icon)",
        purpose: "Displays the total count of unread verification updates and reminder letters.",
        whenToUse: "When checking recent decisions, notices, or instructions issued by AICTE FD.",
        expectedResult: "Opens /institution/notifications."
      }
    ],
    statuses: {
      "APPROVED": "Institution registration or application is confirmed and in good standing.",
      "PENDING": "Application or registration is under administrative verification.",
      "DEFICIENT": "One or more documents require rectification as indicated in LoD/EoD."
    },
    prerequisites: ["Completed Institution Profile onboarding (/institution/complete-profile)."],
    nextSteps: ["Navigate to Submit → Approval Seeking or Submit → Payment / FDR Submission depending on current requirements."]
  },

  institutionApprovalSeeking: {
    id: "institutionApprovalSeeking",
    title: "Approval Seeking (12 Mandatory Documents)",
    path: "/institution/submit/approval",
    role: "INSTITUTION",
    purpose: "Upload and submit the 12 statutory compliance documents mandated under APH Appendix 11 for Letter of Approval (LoA) or Extension of Approval (EoA).",
    overview: "Presents an application header (Application Type: LOA/EOA) and 12 document slots (Land Documents, Land Use Certificate, Approved Building Plan, Occupancy Certificate, Structural Stability, Fire NOC, Barrier-Free Environment, Potable Water, Prescribed E-Affidavit, Trust Registration, Audited Financials, Faculty Cadre Ratio).",
    navigationPath: "Sidebar Menu → Submit → Approval Seeking (/institution/submit/approval)",
    controls: [
      {
        name: "Application Type Selector",
        type: "dropdown",
        label: "Application Type (LOA / EOA)",
        purpose: "Designates whether the filing is for a New Technical Institution (LoA) or Annual Extension (EoA).",
        whenToUse: "At the start of the application filing.",
        expectedResult: "Locks the application scope and generates a unique application reference."
      },
      {
        name: "Document Upload Button",
        type: "button",
        label: "Upload Document (Per Slot)",
        purpose: "Uploads authentic PDF document for the respective statutory category (max 5MB, PDF/JPEG/PNG).",
        whenToUse: "To attach the corresponding approved certificate or deed.",
        expectedResult: "Files are validated by magic number, scanned, securely stored, and preview link appears."
      },
      {
        name: "Submit Application Button",
        type: "button",
        label: "Submit Application / Save Compliance",
        purpose: "Submits all uploaded mandatory documents to the AICTE Finance Division for formal Scrutiny.",
        whenToUse: "Once all required document slots are filled with genuine, legible documents.",
        expectedResult: "Status changes to SUBMITTED and documents appear in the FD employee scrutiny queue."
      }
    ],
    statuses: {
      "NEW APPLICATION / NOT SUBMITTED": "Form is currently being drafted by the institution; not yet received by AICTE FD.",
      "SUBMITTED": "Form has been formally lodged and is queued for FD verification.",
      "UNDER_REVIEW": "AICTE FD employee is actively scrutinizing the uploaded certificates.",
      "APPROVED": "All statutory documents have passed Scrutiny; LoA/EoA generation is unlocked.",
      "DEFICIENT": "Deficiencies found. Review LoD/EoD under Receive section and re-upload."
    },
    prerequisites: ["Institutional Profile must be complete.", "Scanned authentic PDFs of all required certificates."],
    nextSteps: ["Monitor progress in Receive → LoA/EoA or review deficiencies in Receive → LoD/EoD."]
  },

  institutionPaymentFdr: {
    id: "institutionPaymentFdr",
    title: "Payment / FDR Submission",
    path: "/institution/submit/payment",
    role: "INSTITUTION",
    purpose: "Submit Fixed Deposit Receipt (FDR) security deposit details pledged jointly with the Regional Officer, AICTE.",
    overview: "Form to input FDR reference number, principal amount, maturity date (8-10 years), bank and branch name, IFSC code, bank officer details, and upload the scanned joint FDR receipt copy with bank lien endorsement.",
    navigationPath: "Sidebar Menu → Submit → Payment / FDR Submission (/institution/submit/payment)",
    controls: [
      {
        name: "FDR Number Field",
        type: "form_field",
        label: "FDR Reference Number",
        purpose: "Unique receipt number issued by the issuing Scheduled Commercial Bank.",
        whenToUse: "Entering the deposit identifier for official bank confirmation.",
        expectedResult: "Stored as the deposit reference in the system."
      },
      {
        name: "Maturity Date Field",
        type: "form_field",
        label: "Maturity Date",
        purpose: "Date on which the 8 to 10-year joint lock-in term expires.",
        whenToUse: "Entering date printed on FDR receipt.",
        expectedResult: "Used by FD Shield to compute lock-in compliance and maturity reminder cycles."
      },
      {
        name: "FDR Upload Slot",
        type: "button",
        label: "Choose File / Upload FDR Receipt",
        purpose: "Uploads legible PDF scan of the joint FDR with bank lien stamp.",
        whenToUse: "Attaching the proof of deposit.",
        expectedResult: "Stores document and displays file preview link."
      },
      {
        name: "Submit FDR Button",
        type: "button",
        label: "Submit FDR Record",
        purpose: "Dispatches the deposit filing to the AICTE Finance Division for verification.",
        whenToUse: "When all bank details and receipt scans have been provided.",
        expectedResult: "Creates deposit record with status PENDING_VERIFICATION."
      }
    ],
    statuses: {
      "PENDING_VERIFICATION": "FDR submission received; awaiting FD bank lien audit.",
      "VERIFIED": "FD employee has verified deposit authenticity, joint title, and lien condition.",
      "REJECTED": "Deposit details or document rejected due to missing lien, incorrect amount, or non-joint name."
    },
    prerequisites: ["Deposit created in Scheduled Commercial Bank in joint name with Regional Officer, AICTE."],
    nextSteps: ["Check verification status in Receive → Deposit Details (/institution/receive/deposit)."]
  },

  institutionReleaseApplication: {
    id: "institutionReleaseApplication",
    title: "FDR Release Application",
    path: "/institution/submit/release",
    role: "INSTITUTION",
    purpose: "Request refund / release of matured security deposit upon completion of the mandatory lock-in period.",
    overview: "Requires selecting an eligible matured FDR and uploading 4 mandatory release compliance documents: (1) Official Release Request Letter, (2) Copy of FDR Receipt, (3) Sworn Affidavit 6, and (4) Latest Extension of Approval (EoA).",
    navigationPath: "Sidebar Menu → Submit → Release Application (/institution/submit/release)",
    controls: [
      {
        name: "FDR Reference Selector",
        type: "dropdown",
        label: "Select Matured FDR",
        purpose: "Selects which verified, matured deposit is being claimed for release.",
        whenToUse: "Initiating release for a matured deposit.",
        expectedResult: "Links the 4 release documents to this specific deposit."
      },
      {
        name: "Upload Release Letter",
        type: "button",
        label: "Upload Release Letter",
        purpose: "Attaches official management letter requesting return of funds.",
        whenToUse: "Mandatory document slot 1.",
        expectedResult: "Validates and uploads release letter PDF."
      },
      {
        name: "Upload Affidavit 6",
        type: "button",
        label: "Upload Affidavit (Affidavit-6)",
        purpose: "Sworn undertaking confirming fulfillment of all approval conditions, permanent site operation, no pending fee refund disputes, and no legal inquiries.",
        whenToUse: "Mandatory document slot 3.",
        expectedResult: "Attaches Affidavit-6 PDF."
      },
      {
        name: "Submit Release Request",
        type: "button",
        label: "Submit Release Application",
        purpose: "Lodges the formal release claim with the Finance Division and initiates cross-bureau screening.",
        whenToUse: "After all 4 required release files are uploaded.",
        expectedResult: "Generates release request ID and notifies FD Employee queue."
      }
    ],
    statuses: {
      "SUBMITTED": "Release application received by AICTE.",
      "PENDING_FD_REVIEW": "FD Employee is checking the 4 uploaded documents.",
      "APPROVED": "All 4 documents verified and PGRC + Vigilance clearances are positive. Ready for discharge.",
      "REJECTED": "Rejected due to unfulfilled conditions, pending proven grievance, or invalid affidavit.",
      "MATURITY_EXTENDED": "Release held because an ongoing grievance (PGRC) or vigilance investigation is active."
    },
    prerequisites: ["FDR must have reached its maturity date.", "Affidavit 6 notarized.", "PGRC and Vigilance clearances clear."],
    nextSteps: ["Track release progress in Receive → Deposit Details."]
  },

  institutionReceiveLoaEoa: {
    id: "institutionReceiveLoaEoa",
    title: "Receive LoA / EoA Letters",
    path: "/institution/receive/loa-eoa",
    role: "INSTITUTION",
    purpose: "View, preview, and download official Letter of Approval (LoA) or Extension of Approval (EoA) issued by AICTE.",
    overview: "Lists all approved academic session authorizations with reference numbers, approval dates, approved intake, and formal letter downloads.",
    navigationPath: "Sidebar Menu → Receive → LoA / EoA (/institution/receive/loa-eoa)",
    controls: [
      {
        name: "Preview Letter Button",
        type: "button",
        label: "Eye (Preview)",
        purpose: "Opens an on-screen modal rendering the official digitally generated approval letter text.",
        whenToUse: "To inspect approval terms, approved programmes, and intake quotas.",
        expectedResult: "Displays formal LoA/EoA letter dialog."
      },
      {
        name: "Download PDF Button",
        type: "button",
        label: "Download (PDF)",
        purpose: "Downloads the tamper-evident PDF approval certificate for university affiliation and state counseling.",
        whenToUse: "To submit proof of AICTE approval to affiliating university or state admission authority.",
        expectedResult: "Initiates secure PDF download."
      }
    ],
    statuses: {
      "APPROVED": "Approval granted; official letter is available for download."
    },
    prerequisites: ["All mandatory documents approved during Scrutiny."],
    nextSteps: ["Submit downloaded LoA/EoA to affiliating university to obtain academic affiliation."]
  },

  institutionReceiveLodEod: {
    id: "institutionReceiveLodEod",
    title: "Receive LoD / EoD Letters",
    path: "/institution/receive/lod-eod",
    role: "INSTITUTION",
    purpose: "Review formal Letter of Deficiency (LoD) or Extension of Deficiency (EoD) notices issued when compliance documents fail Scrutiny.",
    overview: "Lists deficiency notices containing specific remarks from the Finance Division explaining why an application or document was not approved.",
    navigationPath: "Sidebar Menu → Receive → LoD / EoD (/institution/receive/lod-eod)",
    controls: [
      {
        name: "Preview Deficiency Notice",
        type: "button",
        label: "Preview / Eye Icon",
        purpose: "Displays the official deficiency notice detailing which clauses or certificates failed verification.",
        whenToUse: "To identify exact errors before re-submitting.",
        expectedResult: "Shows itemized checklist of failed items with reviewer remarks."
      },
      {
        name: "Download Deficiency PDF",
        type: "button",
        label: "Download PDF",
        purpose: "Downloads formal deficiency letter.",
        whenToUse: "For internal management and legal review.",
        expectedResult: "Saves LoD/EoD notice PDF to local machine."
      }
    ],
    statuses: {
      "DEFICIENCY_ISSUED": "Specific requirements are missing; compliance must be re-submitted within prescribed cutoff."
    },
    prerequisites: ["Application evaluated by FD Employee."],
    nextSteps: ["Rectify indicated certificates and re-upload under Submit → Approval Seeking (/institution/submit/approval)."]
  },

  institutionReceiveDeposit: {
    id: "institutionReceiveDeposit",
    title: "Deposit Details",
    path: "/institution/receive/deposit",
    role: "INSTITUTION",
    purpose: "Comprehensive view of all joint security deposits, lien status, maturity timelines, and instructions issued by AICTE FD.",
    overview: "Contains two sections: (1) Deposit Instructions issued by AICTE specifying required amount and bank details, and (2) Clearances & Verified FDR Deposits showing verified receipts, lock-in timeline, and release status.",
    navigationPath: "Sidebar Menu → Receive → Deposit Details (/institution/receive/deposit)",
    controls: [
      {
        name: "View Deposit Instruction",
        type: "card",
        label: "Deposit Instruction Card",
        purpose: "Displays official bank details, designated amount, and deadline for creating new FDR.",
        whenToUse: "When creating initial security deposit after receiving LoA.",
        expectedResult: "Provides account instructions to bring to the bank."
      },
      {
        name: "Verified Deposits Table",
        type: "table_action",
        label: "Verified FDR Records",
        purpose: "Shows active deposits, maturity dates, and whether release is available.",
        whenToUse: "To check how many years remain on the 10-year term and verify lien status.",
        expectedResult: "Displays real-time deposit status."
      }
    ],
    statuses: {
      "ACTIVE": "Deposit is locked under AICTE joint lien.",
      "MATURED": "Prescribed 8-10 year lock-in term has elapsed; eligible for Release Request.",
      "RELEASED": "Funds returned and joint lien officially discharged."
    },
    prerequisites: ["FDR submitted and verified."],
    nextSteps: ["When status is MATURED, file Release Application under Submit → Release Application."]
  },

  institutionReceiveComplaintLetters: {
    id: "institutionReceiveComplaintLetters",
    title: "FD Document Deficiency Remarks / Outcome Letters",
    path: "/institution/receive/complaint-letters",
    role: "INSTITUTION",
    purpose: "Review itemized document verification remarks, rejection reasons, and formal compliance outcome notices recorded by the Finance Division.",
    overview: "Provides a granular table mapping Application Reference, Application Type, Document Name, Verification Status (NOT VERIFIED), FD Rejection Remark, Decision Date, and direct action buttons.",
    navigationPath: "Sidebar Menu → Receive → Complaint Outcome Letters (/institution/receive/complaint-letters)",
    controls: [
      {
        name: "View Remark Modal",
        type: "button",
        label: "View Remark / Eye Icon",
        purpose: "Opens modal displaying the full historical rejection log and exact reviewer comments for a document.",
        whenToUse: "When a document was marked NOT VERIFIED and detailed feedback is needed.",
        expectedResult: "Displays full remark history dialog."
      },
      {
        name: "Rectify & Re-upload Link",
        type: "button",
        label: "Re-upload in Approval Seeking",
        purpose: "Navigates directly to the specific document slot in /institution/submit/approval with the target document highlighted.",
        whenToUse: "To immediately replace a rejected certificate with a corrected authentic version.",
        expectedResult: "Redirects to approval seeking upload screen."
      }
    ],
    statuses: {
      "NOT VERIFIED": "Document failed scrutiny due to defect, illegibility, expiry, or non-compliance.",
      "VERIFIED": "Document passed scrutiny."
    },
    prerequisites: ["At least one document reviewed by FD Employee."],
    nextSteps: ["Address the cited deficiency and re-upload the document."]
  },

  institutionNotifications: {
    id: "institutionNotifications",
    title: "Notifications",
    path: "/institution/notifications",
    role: "INSTITUTION",
    purpose: "Central inbox of all official notices, verification results, LoA/EoA issuances, LoD notices, and FDR maturity reminders.",
    overview: "Lists all notifications in chronological order with category badges, timestamps, unread indicators, and direct navigation links.",
    navigationPath: "Header Bell Icon or Sidebar Menu → Notifications (/institution/notifications)",
    controls: [
      {
        name: "Mark All Read Button",
        type: "button",
        label: "Mark All as Read",
        purpose: "Clears unread counter across all notification items.",
        whenToUse: "After reviewing recent alerts.",
        expectedResult: "Notification badge count resets to zero."
      },
      {
        name: "Notification Item Click",
        type: "button",
        label: "Click Notification Card",
        purpose: "Marks individual item as read and navigates to the associated portal page (e.g., LoD notice, deposit details, or approval letter).",
        whenToUse: "To inspect the event that triggered the alert.",
        expectedResult: "Opens relevant page directly."
      }
    ],
    statuses: {
      "UNREAD": "Indicated by colored dot and active badge counter in header.",
      "READ": "Archived alert."
    },
    prerequisites: ["Active portal session."],
    nextSteps: ["Act upon instructions contained in notices."]
  },

  institutionProfile: {
    id: "institutionProfile",
    title: "Institution Profile",
    path: "/institution/profile",
    role: "INSTITUTION",
    purpose: "View and edit registered institutional details, trust governance, address, official contacts, and principal credentials.",
    overview: "Displays statutory identity cards: College ID, Institution Name, Trust/Society Name, Registration Year, Address, and Authorized Signatory.",
    navigationPath: "Sidebar Menu → Profile (/institution/profile)",
    controls: [
      {
        name: "Edit Profile Button",
        type: "button",
        label: "Edit Profile / Update Details",
        purpose: "Opens editable form to modify phone, address, and principal contact information.",
        whenToUse: "When administrative contacts or principal changes occur.",
        expectedResult: "Saves updated profile to database."
      }
    ],
    statuses: {
      "ACTIVE": "Profile verified and in sync with AICTE database."
    },
    prerequisites: ["Logged in as INSTITUTION."],
    nextSteps: ["Keep principal email and contact phone updated to ensure timely receipt of reminders."]
  },

  institutionHandbook: {
    id: "institutionHandbook",
    title: "Approval Process Handbook Explorer",
    path: "/institution/handbook",
    role: "INSTITUTION",
    purpose: "Searchable reference library of the official AICTE Approval Process Handbook (2024–27).",
    overview: "Provides chapter filters, keyword search, clause summaries, and regulatory text directly inside the portal.",
    navigationPath: "Sidebar Menu → Handbook (/institution/handbook)",
    controls: [
      {
        name: "Search Handbook Input",
        type: "form_field",
        label: "Search Clauses...",
        purpose: "Searches indexed handbook clauses by keyword, number, or topic.",
        whenToUse: "Looking up regulatory norms, land area, cadre ratios, or fee rules.",
        expectedResult: "Filters handbook cards to matching clauses."
      }
    ],
    statuses: {},
    prerequisites: ["Accessible to all authorized portal users."],
    nextSteps: ["Verify statutory requirements before submitting documents."]
  },

  // =========================================================================
  // 2. FD VERIFICATION EMPLOYEE PORTAL
  // =========================================================================
  fdDashboard: {
    id: "fdDashboard",
    title: "AICTE FD Shield - Finance Division Portal",
    path: "/fd/dashboard",
    role: "AICTE_FD_EMPLOYEE",
    purpose: "Central administrative console for AICTE Finance Division employees to verify approval documents, audit FDR security deposits, issue maturity reminder letters, review release requests, and screen cross-bureau compliance.",
    overview: "Full-width dashboard with 9 navigable sub-views (Dashboard, Pending Verification, Approval Seeking Applications, Deposit Records, Alive FDs, Released FDs, Rejected Forms, Release Applications, Compliance Status), statistical counters, sync button, and notification drawer.",
    navigationPath: "Login with AICTE_FD_EMPLOYEE credentials → automatically redirected to /fd/dashboard.",
    controls: [
      {
        name: "Dashboard Tab",
        type: "tab",
        label: "Dashboard",
        purpose: "High-level metrics: Total Applications, Alive Deposits, Matured FDs, Pending Release Requests, and Active Notifications.",
        whenToUse: "To monitor overall Finance Division operational health.",
        expectedResult: "Displays metric summary cards and recent activity tables."
      },
      {
        name: "Approval Applications Tab",
        type: "tab",
        label: "Approval Seeking Applications",
        purpose: "Lists submitted LoA/EoA document packages from institutions. Allows inspecting each of the 12 uploaded files, marking them VERIFIED or NOT VERIFIED with mandatory remarks, and generating official LoA/EoA or LoD/EoD letters.",
        whenToUse: "During the Scrutiny verification cycle.",
        expectedResult: "Opens application table with Scrutiny action buttons."
      },
      {
        name: "Deposit Records Tab",
        type: "tab",
        label: "Deposit Records",
        purpose: "Lists all submitted joint FDR records. FD Employee verifies bank receipt, confirms lien endorsement, and updates deposit status.",
        whenToUse: "When institutions submit new security deposits.",
        expectedResult: "Shows deposit verification table."
      },
      {
        name: "Alive FDs Tab",
        type: "tab",
        label: "Alive FDs",
        purpose: "Monitors all active security deposits currently under lock-in. Highlights deposits approaching maturity (within 30 days) and provides the 'Generate Maturity Letter' trigger.",
        whenToUse: "To track locked-in funds and dispatch statutory maturity reminder letters.",
        expectedResult: "Lists active deposits with remaining days countdown."
      },
      {
        name: "Release Applications Tab",
        type: "tab",
        label: "Release Applications",
        purpose: "Review matured deposit refund applications. Inspects the 4 release files (Release Letter, FD Copy, Affidavit 6, EoA) and checks automated PGRC + Vigilance clearance flags.",
        whenToUse: "To evaluate whether a matured deposit can be safely discharged.",
        expectedResult: "Displays release request dossier with 'Approve Release' and 'Reject / Withhold' buttons."
      },
      {
        name: "Compliance Status Tab",
        type: "tab",
        label: "Compliance Status",
        purpose: "Cross-bureau clearance table showing real-time grievance and vigilance inquiry statuses for all institutions with pending release requests.",
        whenToUse: "To verify whether an institution has pending student complaints or vigilance investigations blocking release.",
        expectedResult: "Displays PGRC and Vigilance clearance badges (VERIFIED, ON PROCESS, REJECTED)."
      },
      {
        name: "Generate Maturity Letter Button",
        type: "button",
        label: "Generate Letter / Send Maturity Reminder",
        purpose: "Opens the Maturity Reminder modal for an FDR maturing within 30 days. Generates an authentic AICTE reminder letter draft, displays preview, and dispatches email + portal notification to the institution upon explicit confirmation.",
        whenToUse: "When an active FDR reaches its 30-day pre-maturity window.",
        expectedResult: "Dispatches reminder letter, records timestamp, prevents duplicate sends within 30 days, and logs notification."
      },
      {
        name: "Sync Button",
        type: "button",
        label: "Sync (Refresh)",
        purpose: "Performs parallel live sync with MongoDB to refresh all 8 operational datasets.",
        whenToUse: "To pull newly filed applications or updated clearance decisions.",
        expectedResult: "Updates counters and tables instantly."
      }
    ],
    statuses: {
      "VERIFIED": "FD Employee verified certificate or deposit authenticity.",
      "NOT VERIFIED": "FD Employee marked document deficient; must provide cause remark.",
      "MATURITY DATE EXTENDED": "Release held because cross-bureau complaint clearance is in ON PROCESS or INVESTIGATION status.",
      "REJECTED": "Release or document rejected due to proven violation or severe non-compliance."
    },
    prerequisites: ["AICTE_FD_EMPLOYEE authentication."],
    nextSteps: ["Perform scrutiny on pending items; issue LoA/EoA for compliant applications; dispatch maturity letters for due FDRs."]
  },

  // =========================================================================
  // 3. PGRC EMPLOYEE PORTAL
  // =========================================================================
  pgrcDashboard: {
    id: "pgrcDashboard",
    title: "Public Grievance Redressal Cell (PGRC) Portal",
    path: "/pgrc/dashboard",
    role: "PGRC_EMPLOYEE",
    purpose: "Review, investigate, and adjudicate student, faculty, and public grievances filed against technical institutions.",
    overview: "Full-page grievance queue categorized into 5 tabs: NEW, INVESTIGATION, PROVEN, UNPROVEN, and ALL. Allows inspecting grievance evidence, recording investigation notes, and making formal decisions.",
    navigationPath: "Login with PGRC_EMPLOYEE credentials → automatically redirected to /pgrc/dashboard.",
    controls: [
      {
        name: "Filter Tabs",
        type: "tab",
        label: "NEW | INVESTIGATION | PROVEN | UNPROVEN | ALL",
        purpose: "Filters grievances by current adjudicative stage.",
        whenToUse: "To navigate work queues.",
        expectedResult: "Filters table rows instantly."
      },
      {
        name: "Review / Eye Icon",
        type: "button",
        label: "Review (Eye)",
        purpose: "Opens the full complaint dossier showing complainant details, institution, description, and attached evidence files.",
        whenToUse: "To review grievance facts before decision.",
        expectedResult: "Opens dossier modal with evidence preview."
      },
      {
        name: "Move to Investigation Button",
        type: "button",
        label: "Investigate / Mark Under Investigation",
        purpose: "Changes status to INVESTIGATION. Prompts for formal reason and confirmation.",
        whenToUse: "When grievance requires fact-finding or committee inquiry.",
        expectedResult: "Status updates to INVESTIGATION; automatically marks FD clearance as ON PROCESS (extending FDR maturity)."
      },
      {
        name: "Mark Proven Button",
        type: "button",
        label: "Mark Proven",
        purpose: "Adjudicates the complaint as verified/proven violation against the institution. Requires mandatory reason.",
        whenToUse: "When investigation establishes violation of AICTE norms (e.g. unrefunded fees, faculty harassment).",
        expectedResult: "Status updates to PROVEN; automatically REJECTS FD clearance, blocking deposit release."
      },
      {
        name: "Mark Unproven Button",
        type: "button",
        label: "Mark Unproven",
        purpose: "Dismisses complaint as unsubstantiated after inquiry. Requires mandatory reason.",
        whenToUse: "When evidence shows institution acted compliantly.",
        expectedResult: "Status updates to UNPROVEN; clears institution in PGRC bureau."
      }
    ],
    statuses: {
      "NEW": "Newly submitted complaint; pending initial review.",
      "INVESTIGATION / ON_PROCESS": "Formal fact-finding underway; blocks FDR release by setting clearance to ON PROCESS.",
      "PROVEN": "Grievance substantiated; permanently blocks release until rectified.",
      "UNPROVEN": "Complaint dismissed after review."
    },
    prerequisites: ["PGRC_EMPLOYEE authentication."],
    nextSteps: ["Review new complaints promptly; communicate outcomes via public tracking."]
  },

  // =========================================================================
  // 4. VIGILANCE EMPLOYEE PORTAL
  // =========================================================================
  vigilanceDashboard: {
    id: "vigilanceDashboard",
    title: "AICTE Vigilance Division Portal",
    path: "/vigilance/dashboard",
    role: "VIGILANCE_EMPLOYEE",
    purpose: "Investigate financial irregularities, ghost faculty, unauthorized institutions, and integrity violations against technical colleges.",
    overview: "High-security complaint queue organized into tabs (NEW, INVESTIGATION, PROVEN, UNPROVEN, ALL). Provides dossier inspection, evidence file review, and adjudicative decision logging.",
    navigationPath: "Login with VIGILANCE_EMPLOYEE credentials → automatically redirected to /vigilance/dashboard.",
    controls: [
      {
        name: "Review Dossier Button",
        type: "button",
        label: "Review (Eye Icon)",
        purpose: "Opens the confidential vigilance dossier including complainant affidavit and evidence documents.",
        whenToUse: "To examine investigation evidence.",
        expectedResult: "Displays dossier modal with full case history."
      },
      {
        name: "Initiate Investigation Button",
        type: "button",
        label: "Investigate",
        purpose: "Places the institution under formal vigilance inquiry.",
        whenToUse: "When prima facie evidence indicates irregularity.",
        expectedResult: "Status updates to INVESTIGATION; synchronizes with FD Shield to suspend FDR release."
      },
      {
        name: "Mark Proven Button",
        type: "button",
        label: "Mark Proven",
        purpose: "Confirms vigilance breach (e.g., fraudulent land deed, fake faculty, unauthorized capitation fees).",
        whenToUse: "When vigilance inquiry concludes with substantiated findings.",
        expectedResult: "Status updates to PROVEN; blocks all deposit releases and initiates Council penal action."
      },
      {
        name: "Mark Unproven Button",
        type: "button",
        label: "Mark Unproven",
        purpose: "Exonerates the institution when inquiry finds no wrongdoing.",
        whenToUse: "When claims are disproven.",
        expectedResult: "Status updates to UNPROVEN; grants affirmative vigilance clearance."
      }
    ],
    statuses: {
      "NEW": "New confidential complaint filed.",
      "INVESTIGATION": "Active inquiry underway; clearance status set to ON PROCESS in FD Shield.",
      "PROVEN": "Violation proven; clearance status set to REJECTED in FD Shield.",
      "UNPROVEN": "Inquiry completed; institution cleared."
    },
    prerequisites: ["VIGILANCE_EMPLOYEE or VIGILANCE_SUPERVISOR authentication."],
    nextSteps: ["Maintain comprehensive investigation audit trail."]
  },

  // =========================================================================
  // 5. PUBLIC COMPLAINT & TRACKING PAGES
  // =========================================================================
  publicPgrcComplaint: {
    id: "publicPgrcComplaint",
    title: "Public Grievance Portal (PGRC)",
    path: "/complaints/pgrc",
    role: "PUBLIC",
    purpose: "Public citizen portal allowing students, parents, faculty, and stakeholders to lodge formal grievances against any approved AICTE institution.",
    overview: "Unauthenticated submission form collecting complainant name, email, mobile, institution dropdown, grievance category, subject, description, and optional evidence PDF/image upload.",
    navigationPath: "Landing Page → File Grievance or /complaints/pgrc",
    controls: [
      {
        name: "Institution Selector",
        type: "dropdown",
        label: "Select Institution",
        purpose: "Searchable dropdown of all approved AICTE colleges.",
        whenToUse: "Selecting the institution against which grievance is filed.",
        expectedResult: "Links complaint to the institution's official record."
      },
      {
        name: "Evidence Attachment",
        type: "button",
        label: "Upload Evidence (PDF / Images)",
        purpose: "Attach supporting fee receipts, correspondence, or documents (max 5MB).",
        whenToUse: "Providing factual proof of grievance.",
        expectedResult: "Validates and uploads file securely."
      },
      {
        name: "Submit Complaint Button",
        type: "button",
        label: "Submit Grievance",
        purpose: "Lodges the grievance with the AICTE PGRC.",
        whenToUse: "When all form fields are completed.",
        expectedResult: "Returns a unique Complaint Reference Number (e.g. PGRC-2026-XXXXX) for tracking."
      }
    ],
    statuses: {},
    prerequisites: ["None (open to all citizens)."],
    nextSteps: ["Save the Complaint Reference Number and track status on /complaints/pgrc/track."]
  },

  publicPgrcTrack: {
    id: "publicPgrcTrack",
    title: "Track PGRC Complaint",
    path: "/complaints/pgrc/track",
    role: "PUBLIC",
    purpose: "Allows citizens to check real-time progress and official remarks on their filed PGRC grievance.",
    overview: "Search form requiring Complaint Reference Number and Complainant Email. Displays visual timeline and adjudicative outcome remarks.",
    navigationPath: "Landing Page → Track Complaint or /complaints/pgrc/track",
    controls: [
      {
        name: "Track Status Button",
        type: "button",
        label: "Track Status",
        purpose: "Queries database for latest status of the complaint reference.",
        whenToUse: "Checking investigation progress.",
        expectedResult: "Displays status card (Submitted, Under Review, Investigation, Proven, Unproven) with officer remarks."
      }
    ],
    statuses: {
      "Submitted": "Grievance received and queued for review.",
      "Investigation": "Committee or officer fact-finding in progress.",
      "Proven": "Grievance substantiated; corrective action ordered.",
      "Unproven": "Grievance closed after investigation."
    },
    prerequisites: ["Valid Complaint Reference Number and registered Email."],
    nextSteps: ["Review officer remarks for required responses."]
  },

  publicVigilanceComplaint: {
    id: "publicVigilanceComplaint",
    title: "Public Vigilance Portal",
    path: "/complaints/vigilance",
    role: "PUBLIC",
    purpose: "Confidential filing channel for reporting financial corruption, faculty fraud, or severe ethical violations.",
    overview: "Unauthenticated form with privacy safeguards allowing whistleblowers to report integrity violations with evidence.",
    navigationPath: "Landing Page → Vigilance Portal or /complaints/vigilance",
    controls: [
      {
        name: "Submit Vigilance Report Button",
        type: "button",
        label: "Submit Vigilance Complaint",
        purpose: "Lodges confidential report with the AICTE Chief Vigilance Officer (CVO).",
        whenToUse: "Reporting serious corruption or malpractice.",
        expectedResult: "Returns confidential Vigilance Reference Number (VIG-2026-XXXXX)."
      }
    ],
    statuses: {},
    prerequisites: ["None."],
    nextSteps: ["Track confidential inquiry progress on /complaints/vigilance/track."]
  },

  publicVigilanceTrack: {
    id: "publicVigilanceTrack",
    title: "Track Vigilance Complaint",
    path: "/complaints/vigilance/track",
    role: "PUBLIC",
    purpose: "Confidential tracking of vigilance inquiries using Reference Number and registered Email.",
    overview: "Displays high-level inquiry status without disclosing confidential internal officer notes.",
    navigationPath: "/complaints/vigilance/track",
    controls: [
      {
        name: "Track Vigilance Button",
        type: "button",
        label: "Track Vigilance Case",
        purpose: "Queries case status.",
        whenToUse: "Checking case resolution.",
        expectedResult: "Displays status badge."
      }
    ],
    statuses: {
      "Submitted": "Case under initial assessment.",
      "Investigation": "Active inquiry underway.",
      "Proven": "Violation substantiated.",
      "Unproven": "Closed."
    },
    prerequisites: ["Vigilance Reference Number and Email."],
    nextSteps: ["Check for public resolution statement."]
  }
};

// =========================================================================
// 6. WORKFLOW & TERMINOLOGY KNOWLEDGE
// =========================================================================
export const PORTAL_TERMINOLOGY_KNOWLEDGE: Record<string, { term: string; definition: string; portalContext: string }> = {
  fd: {
    term: "FD (Finance Division)",
    definition: "FD stands for Finance Division. In the AICTE Portal, it manages financial deposit-related activities, including deposit verification, scrutiny of statutory fees, monitoring active deposits, and release processing.",
    portalContext: "Finance Division officers log into the FD Shield console (/fd/dashboard) to review approval applications, verify bank deposits, and evaluate deposit release applications."
  },
  fdr: {
    term: "FDR (Fixed Deposit Receipt)",
    definition: "FDR stands for Fixed Deposit Receipt. It is a recognized financial document issued by a Scheduled Commercial Bank certifying that a specific sum has been deposited for an agreed term. In the AICTE Portal, it serves as the mandatory security deposit pledged in the joint names of the institution and the Regional Officer, AICTE.",
    portalContext: "Institutions submit FDR receipt details under Submit → Payment / FDR Submission (/institution/submit/payment). The Finance Division verifies the receipt under Deposit Records, and institutions apply for release under Submit → Release Application (/institution/submit/release) upon term completion."
  },
  approval_seeking: {
    term: "Approval Seeking",
    definition: "Approval Seeking is the formal regulatory process through which an institution applies for Letter of Approval (LoA) for a new institution/program or Extension of Approval (EoA) for annual continuation, by uploading the 12 mandatory statutory documents.",
    portalContext: "Institutions complete this in the sidebar under Submit → Approval Seeking (/institution/submit/approval). Once submitted, the file is queued for Finance Division officer scrutiny."
  },
  alive_fds: {
    term: "Alive FDs",
    definition: "Alive FDs are verified security deposit records that remain active and have not been recorded as released. These represent live deposits currently held in joint lien with AICTE.",
    portalContext: "Authorized Finance Division employees monitor active lock-in periods, maturity countdowns, and pre-maturity reminder letters under the Alive FDs tab on the FD Dashboard (/fd/dashboard)."
  },
  released_fds: {
    term: "Released FDs",
    definition: "Released FDs are security deposit records that have successfully completed their lock-in period, obtained inter-departmental clearances, and been formally discharged and returned to the institution.",
    portalContext: "Accessible in the FD Employee Portal under the Released FDs tab (/fd/dashboard), displaying the historical registry of all released deposits and discharge dates."
  },
  rejected_forms: {
    term: "Rejected Forms",
    definition: "Rejected Forms contains applications, submissions, or release requests that have been rejected or marked deficient during scrutiny. Authorized users can review recorded decisions, dates, and officer remarks.",
    portalContext: "Finance Division officers view rejected submissions under the Rejected Forms tab on /fd/dashboard. Institutions view their itemized document deficiencies under Receive → Complaint Outcome Letters (/institution/receive/complaint-letters)."
  },
  release_applications: {
    term: "Release Applications",
    definition: "Release Applications is the module where institutions apply for the refund/discharge of their matured FDR security deposit after completing the statutory lock-in period.",
    portalContext: "Institutions submit their request under Submit → Release Application (/institution/submit/release) with the 4 mandatory files (Release Letter, FDR Copy, Affidavit 6, latest EoA). FD officers evaluate and approve releases under the Release Applications view."
  },
  compliance_status: {
    term: "Compliance Status / Bureau Clearance",
    definition: "Compliance Status is the cross-bureau clearance registry that checks whether an institution has active complaints or investigations pending with the Public Grievance Redressal Cell (PGRC) or the Vigilance Division.",
    portalContext: "Under AICTE rules (Clause 6.46), no security deposit can be released until affirmative clearances are confirmed from both PGRC and Vigilance. FD employees inspect real-time clearance badges under Compliance Status."
  },
  pgrc: {
    term: "PGRC (Public Grievance Redressal Cell)",
    definition: "PGRC stands for Public Grievance Redressal Cell. It is the designated AICTE committee that handles complaints and grievances submitted by students, faculty, staff, or parents against technical institutions.",
    portalContext: "The public submits and tracks grievances at /complaints/pgrc and /complaints/pgrc/track. PGRC officers investigate and resolve grievances on /pgrc/dashboard."
  },
  vigilance: {
    term: "Vigilance Division",
    definition: "The Vigilance Division is the specialized investigative authority in AICTE that examines allegations of institutional misconduct, corruption, financial embezzlement, and fraud.",
    portalContext: "Whistleblowers and citizens submit confidential complaints at /complaints/vigilance and track them at /complaints/vigilance/track. Vigilance officers manage cases on /vigilance/dashboard."
  },
  handbook: {
    term: "Approval Process Handbook (APH)",
    definition: "The Approval Process Handbook is the official statutory publication issued by AICTE outlining legal regulations, land norms, faculty ratios, infrastructure rules, and approval procedures for technical institutions.",
    portalContext: "Authorized portal users can search and read indexed clauses of the 2024–27 Handbook directly under Sidebar → Handbook (/institution/handbook)."
  },
  loa: {
    term: "LoA (Letter of Approval)",
    definition: "Letter of Approval is the initial formal regulatory permission granted by AICTE allowing a society or trust to establish a New Technical Institution or introduce a new technical programme.",
    portalContext: "Institutions apply for LoA under Submit → Approval Seeking. Once approved, the official signed LoA is downloaded under Receive → LoA / EoA (/institution/receive/loa-eoa)."
  },
  eoa: {
    term: "EoA (Extension of Approval)",
    definition: "Extension of Approval is the annual permission granted to existing technical colleges to continue operations and admit students for the upcoming academic year.",
    portalContext: "Existing institutions file annual compliance under Submit → Approval Seeking. Once approved, the annual EoA certificate is downloaded under Receive → LoA / EoA."
  },
  lod_eod: {
    term: "LoD / EoD (Letter / Extension of Deficiency)",
    definition: "A Letter of Deficiency (LoD) or Extension of Deficiency (EoD) is a formal notification issued by AICTE when an institution's submitted documents or facilities fail scrutiny, listing the deficiencies that must be rectified.",
    portalContext: "Appears under Receive → LoD / EoD (/institution/receive/lod-eod) and itemized remarks appear under Receive → Complaint Outcome Letters (/institution/receive/complaint-letters)."
  },
  complaint_outcome_letter: {
    term: "Complaint Outcome Letter / Document Deficiency Remarks",
    definition: "In the AICTE Portal under Receive → Complaint Outcome Letters (/institution/receive/complaint-letters), this module displays the itemized scrutiny remarks, rejection reasons, and formal verification outcomes recorded by the Finance Division for deficient documents. Additionally, in the FD Employee Portal, it refers to the formal clearance outcome letter generated between bureaus (PGRC and Vigilance).",
    portalContext: "Institutions use this page to view why a document was rejected and click the direct 'Re-upload' button to rectify it. FD employees generate formal cross-bureau outcome letters under the Compliance Status view."
  },
  maturity_letter: {
    term: "Generate Maturity Letter (FD Employee Feature)",
    definition: "A specialized administrative feature in the FD Employee Portal (under Alive FDs and Notifications) used when a verified FDR enters its 30-day pre-maturity window. Clicking 'Generate Maturity Letter' creates a formal pre-filled AICTE reminder notice draft informing the institution that their security deposit is approaching maturity and guiding them to file Affidavit 6 for release.",
    portalContext: "When the FD employee confirms sending, the system dispatches an email to the institution's principal, logs a persistent notification in the institution's portal inbox, records the dispatch date in MongoDB, and enforces duplicate-sending protection for 30 days."
  }
};
