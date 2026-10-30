// src/services/portalResponseSynthesizer.ts
/**
 * AICTE Unified Portal - Accurate Portal & Workflow Response Synthesizer
 * 
 * Generates concise, directly useful, role-aware responses for:
 * 1. Portal Navigation questions
 * 2. Page & Button explanations
 * 3. Workflow & How-to questions
 * 4. General definitions
 * 5. Live status inquiries
 */

import { PORTAL_PAGES_KNOWLEDGE, PORTAL_TERMINOLOGY_KNOWLEDGE } from "./portalKnowledgeBase";
import { FINANCIAL_KNOWLEDGE } from "./financialKnowledgeBase";
import { ClassificationResult } from "./questionClassifier";

export function generatePortalGuidanceAnswer({
  userQuery,
  classification,
  portalContext,
}: {
  userQuery: string;
  classification: ClassificationResult;
  portalContext: any;
}): { content: string; citations: any[] } {
  const q = userQuery.toLowerCase().trim();
  const role = portalContext.role || "INSTITUTION";

  // 1. DIRECT REPLIES (Greetings, Casual conversation, Refusals)
  if (classification.reply) {
    return {
      content: classification.reply,
      citations: [],
    };
  }

  // 2. BASIC FINANCIAL KNOWLEDGE & GENERAL DEFINITIONS
  if (classification.category === "GENERAL_DEFINITION" || classification.matchedTermKey) {
    const key = classification.matchedTermKey;
    if (key && FINANCIAL_KNOWLEDGE[key]) {
      const finInfo = FINANCIAL_KNOWLEDGE[key];
      const portalNote = finInfo.portalContext ? `\n\n**In the AICTE Portal:**\n${finInfo.portalContext}` : "";
      return {
        content: `**${finInfo.term}**\n\n${finInfo.definition}${portalNote}`,
        citations: [],
      };
    }
    if (key && PORTAL_TERMINOLOGY_KNOWLEDGE[key]) {
      const termInfo = PORTAL_TERMINOLOGY_KNOWLEDGE[key];
      return {
        content: `**${termInfo.term}**\n\n${termInfo.definition}\n\n**Portal Relevance:**\n${termInfo.portalContext}`,
        citations: [],
      };
    }

    if (q.includes("handbook")) {
      const info = PORTAL_TERMINOLOGY_KNOWLEDGE.handbook;
      return {
        content: `**${info.term}**:\n${info.definition}\n\n**Portal Access:**\n${info.portalContext}`,
        citations: [],
      };
    }
    if (q.includes("fdr")) {
      const info = PORTAL_TERMINOLOGY_KNOWLEDGE.fdr;
      return {
        content: `**${info.term}**:\n${info.definition}\n\n**In this Portal:**\n${info.portalContext}`,
        citations: [],
      };
    }
    if (q.includes("complaint outcome letter")) {
      const info = PORTAL_TERMINOLOGY_KNOWLEDGE.complaint_outcome_letter;
      return {
        content: `**${info.term}**:\n${info.definition}\n\n**How to Use:**\n${info.portalContext}`,
        citations: [],
      };
    }
    if (q.includes("eoa")) {
      const info = PORTAL_TERMINOLOGY_KNOWLEDGE.eoa;
      return {
        content: `**${info.term}**:\n${info.definition}\n\n**In this Portal:**\n${info.portalContext}`,
        citations: [],
      };
    }
    if (q.includes("loa")) {
      const info = PORTAL_TERMINOLOGY_KNOWLEDGE.loa;
      return {
        content: `**${info.term}**:\n${info.definition}\n\n**In this Portal:**\n${info.portalContext}`,
        citations: [],
      };
    }
  }

  // 3. PAGE & BUTTON EXPLANATIONS
  if (classification.category === "PAGE_BUTTON_EXPLANATION") {
    // Verify Button Explanation
    if (
      q.includes("verify button") ||
      q.includes("what does verify do") ||
      q.includes("what does verify button do") ||
      q.includes("what does the verify button do") ||
      (q.includes("verify") && q.includes("button") && !q.includes("maturity"))
    ) {
      if (role === "AICTE_FD_EMPLOYEE") {
        return {
          content:
            `### Verify Button\n\n` +
            `**Purpose:** Records your administrative confirmation that an uploaded statutory certificate or FDR receipt satisfies AICTE norms.\n\n` +
            `**Where it appears:** In the **FD Employee Portal** on the **Approval Seeking Applications** detail view (\`/fd/dashboard\`) and within the **Document Preview Modal**.\n\n` +
            `**What happens when clicked:**\n` +
            `- The document's status immediately updates from **PENDING** to **VERIFIED** with a green badge.\n` +
            `- Your officer user ID and timestamp are permanently recorded with the decision.\n` +
            `- The institution receives a real-time notification confirming the document was verified.\n` +
            `- If all 12 documents are verified, the **Generate Letter (LoA / EoA)** option becomes active.`,
          citations: [],
        };
      }
      return {
        content:
          `In the **AICTE Finance Division Portal**, authorized officers click the **Verify** button next to an uploaded document after inspecting it. ` +
          `Clicking Verify updates the document status to **VERIFIED** and enables the council to generate your final Letter of Approval (LoA) or Extension of Approval (EoA).`,
        citations: [],
      };
    }

    // Download Button / How can I download my document
    if (
      q.includes("download button") ||
      q.includes("how can i download") ||
      q.includes("download my document") ||
      q.includes("download document")
    ) {
      if (role === "INSTITUTION") {
        return {
          content:
            `### How to Download Documents in the Institution Portal:\n\n` +
            `1. **Submitted Documents:** Open **Submit → Approval Seeking** (\`/institution/submit/approval\`) or **Receive → Complaint Outcome Letters** (\`/institution/receive/complaint-letters\`) and click the **Download** link next to any uploaded certificate.\n` +
            `2. **Approval Letters (LoA / EoA):** Navigate to **Receive → LoA / EoA** (\`/institution/receive/loa-eoa\`) and click **Download Certificate** to save your official signed PDF.\n` +
            `3. **Deficiency Letters (LoD / EoD):** Navigate to **Receive → LoD / EoD** (\`/institution/receive/lod-eod\`) to download issued deficiency notices.`,
          citations: [],
        };
      }
      return {
        content:
          `In the portal, you can download files directly from the document table or the Document Preview window by clicking the **Download** button with the arrow icon.`,
        citations: [],
      };
    }

    // Generate Maturity Letter Button
    if (
      q.includes("generate maturity letter") ||
      q.includes("maturity letter") ||
      (q.includes("button") && q.includes("maturity"))
    ) {
      return {
        content:
          `### Generate Maturity Letter Button\n\n` +
          `**Purpose:** Creates and dispatches an authentic AICTE maturity reminder notice for an active Fixed Deposit Receipt (FDR) approaching its 10-year term maturity.\n\n` +
          `**Where it appears:** In the **AICTE FD Employee Portal** under **Alive FDs** (\`/fd/dashboard\`) and in the **Notifications Drawer** for deposits within 30 days of maturity.\n\n` +
          `**How to use:**\n` +
          `1. Select the deposit item flagged in the 30-day pre-maturity window.\n` +
          `2. Click **Generate Letter** (or open the reminder notice in the notification drawer).\n` +
          `3. Review the generated letter draft with institution, college ID, and FDR details.\n` +
          `4. Check the confirmation checkbox and click **Confirm & Send Reminder Letter**.\n\n` +
          `**What happens next:**\n` +
          `- The formal letter is sent via email to the institution's official email.\n` +
          `- A persistent notification is logged in the institution's portal inbox.\n` +
          `- The dispatch date is recorded in MongoDB, and duplicate protection is enforced for 30 days.`,
        citations: [],
      };
    }

    if (q.includes("what is this page for") || q.includes("explain this page")) {
      const currentRoute = portalContext.currentRoute || "";
      const pageEntry = Object.values(PORTAL_PAGES_KNOWLEDGE).find(p => p.path === currentRoute);
      if (pageEntry) {
        return {
          content:
            `### ${pageEntry.title}\n\n` +
            `**Navigation Path:** ${pageEntry.navigationPath}\n` +
            `**Purpose:** ${pageEntry.purpose}\n\n` +
            `**What you can do here:**\n${pageEntry.overview}`,
          citations: [],
        };
      }
      return {
        content:
          `You are currently viewing the **${portalContext.portal || "AICTE Portal"}** at route \`${currentRoute || "/"}\`. ` +
          `This page is dedicated to ${portalContext.workflowStage || "portal"} operations. Could you specify which button, table, or control on this screen you'd like explained?`,
        citations: [],
      };
    }

    if (q.includes("what does this button do") || q.includes("what does button do")) {
      return {
        content:
          `Which specific button are you inquiring about? For example, are you asking about **Generate Maturity Letter**, **Submit Application**, **Verify Document**, or **Sync**? Please name the button or current page so I can give you the exact steps.`,
        citations: [],
      };
    }
  }

  // 4. PORTAL NAVIGATION GUIDANCE
  if (classification.category === "PORTAL_NAVIGATION") {
    // Deposit Details navigation
    if (q.includes("deposit details") || (q.includes("deposit") && q.includes("where"))) {
      if (role === "INSTITUTION") {
        return {
          content:
            `To view your deposit details in the **Institution Portal**:\n\n` +
            `👉 Navigate to **Receive → Deposit Details** (\`/institution/receive/deposit\`)\n\n` +
            `Here you can see:\n` +
            `- **Deposit Instructions:** Prescribed deposit amounts and AICTE joint account bank details.\n` +
            `- **Verified FDR Deposits:** All verified security deposit receipts, maturity dates, and lien status.`,
          citations: [],
        };
      }
      if (role === "AICTE_FD_EMPLOYEE") {
        return {
          content:
            `In the **AICTE FD Employee Portal**:\n\n` +
            `👉 Click **Deposit Records** in the sidebar to review submitted FDR receipts, or click **Alive FDs** to view active deposits and maturity countdowns.`,
          citations: [],
        };
      }
    }

    // FDR Page
    if (q.includes("where is the fdr page") || q.includes("fdr page")) {
      if (role === "INSTITUTION") {
        return {
          content:
            `In the **Institution Portal**, FDR-related pages are organized under two menus:\n\n` +
            `1. **Submit new FDR:** **Submit → Payment / FDR Submission** (\`/institution/submit/payment\`)\n` +
            `2. **View verified deposits:** **Receive → Deposit Details** (\`/institution/receive/deposit\`)\n` +
            `3. **Apply for release:** **Submit → Release Application** (\`/institution/submit/release\`)`,
          citations: [],
        };
      }
    }

    // Payment details navigation
    if (q.includes("payment details") || (q.includes("payment") && q.includes("where"))) {
      if (role === "INSTITUTION") {
        return {
          content:
            `In the **Institution Portal**, payment and deposit information is organized at:\n\n` +
            `1. **Submit new FDR / Bank details:** **Submit → Payment / FDR Submission** (\`/institution/submit/payment\`)\n` +
            `2. **View verified deposits & AICTE account instructions:** **Receive → Deposit Details** (\`/institution/receive/deposit\`)`,
          citations: [],
        };
      }
    }

    // Notifications
    if (q.includes("notification") || q.includes("notifications")) {
      if (role === "INSTITUTION") {
        return {
          content:
            `To open your notifications:\n\n` +
            `👉 Click the **🔔 (Bell Icon)** in the top-right header, or select **Notifications** from the left navigation menu (\`/institution/notifications\`).\n\n` +
            `You can review all verification outcomes, deficiency notices, and maturity reminder letters here.`,
          citations: [],
        };
      }
      if (role === "AICTE_FD_EMPLOYEE") {
        return {
          content:
            `In the **FD Employee Portal**, click the **🔔 (Bell Icon)** in the top-right header bar to open the sliding Notification Drawer with action buttons for maturity reminders and pending submissions.`,
          citations: [],
        };
      }
    }

    // Track a Complaint
    if (q.includes("track") && q.includes("complaint")) {
      return {
        content:
          `You can track public complaints at the dedicated public tracking pages:\n\n` +
          `1. **Public Grievance (PGRC) Tracking:** \`/complaints/pgrc/track\` (requires Complaint Reference Number & registered Email)\n` +
          `2. **Public Vigilance Tracking:** \`/complaints/vigilance/track\`\n` +
          `3. **Institution Grievances:** If you are an institution user, view your raised complaints under **Complaints → Status** (\`/institution/complaints/status\`).`,
        citations: [],
      };
    }
  }

  // 5. LIVE RECORD & STATUS INQUIRIES
  if (classification.category === "LIVE_RECORD_STATUS") {
    // Tenant Isolation Check: If institution user asks for another college ID
    const collegeMatch = q.match(/c-\d+/i);
    if (role === "INSTITUTION" && collegeMatch) {
      const requestedCollege = collegeMatch[0].toUpperCase();
      const userCollege = (portalContext.collegeId || "").toUpperCase();
      if (userCollege && requestedCollege !== userCollege) {
        return {
          content:
            `### Data Isolation Notice\n\n` +
            `You are authenticated as **${portalContext.institutionName || "Institution"}** (\`${userCollege}\`). ` +
            `Under AICTE security policy, you cannot view data for other institutions (\`${requestedCollege}\`). ` +
            `You can only view status and records belonging to your own institution.`,
          citations: [],
        };
      }
    }

    // Employee pending queue check
    if (role === "AICTE_FD_EMPLOYEE" && (q.includes("pending") || q.includes("queue"))) {
      return {
        content:
          `### FD Verification Officer Queue Status\n\n` +
          `Hello **${portalContext.userName || "Officer"}**, there are currently **${portalContext.pendingCount ?? 0}** pending application(s) awaiting scrutiny in your verification queue. ` +
          `Open **Pending Verification** (\`/fd/dashboard\`) to review and process submitted files.`,
        citations: [],
      };
    }

    // Why was my application returned for correction?
    if (q.includes("returned for correction") || q.includes("why was my application returned") || (q.includes("why") && q.includes("returned"))) {
      if (role === "INSTITUTION") {
        const app = portalContext.application || {};
        const appId = app.applicationId || portalContext.applicationNumber || "N/A";
        const status = app.status || portalContext.applicationStatus || "RETURNED_FOR_CORRECTION";
        const remarks = app.lastRemarks || portalContext.lastRemarks || "Deficiencies detected during scrutiny.";
        const docs = portalContext.deficientDocuments || [];

        let resp = `### Why Your Application Was Returned for Correction\n\n`;
        resp += `- **Application ID:** \`${appId}\`\n`;
        resp += `- **Current Status:** **${status}**\n`;
        resp += `- **Recorded Scrutiny Remarks:** ${remarks}\n\n`;

        if (docs.length > 0) {
          resp += `**Deficient Document(s) Requiring Rectification:**\n`;
          docs.forEach((d: any) => {
            resp += `- **${d.documentName}:** ${d.remarks || "Rejected during officer scrutiny"}\n`;
          });
          resp += `\n`;
        }

        resp += `**Action Steps to Rectify:**\n`;
        resp += `1. Review the full remarks under **Receive → Complaint Outcome Letters** (\`/institution/receive/complaint-letters\`).\n`;
        resp += `2. Prepare the updated authentic PDF certificates.\n`;
        resp += `3. Navigate to **Submit → Approval Seeking** (\`/institution/submit/approval\`) and re-upload the corrected documents.`;
        return { content: resp, citations: [] };
      }
    }

    // Why is my release request pending?
    if (q.includes("release request pending") || q.includes("release pending") || q.includes("why is my release")) {
      if (role === "INSTITUTION") {
        let resp = `Here is the status and verification breakdown for your FDR Release Request:\n\n`;
        if (portalContext.releaseRequestId) {
          resp += `- **Release Request ID:** \`${portalContext.releaseRequestId}\`\n`;
          resp += `- **Current Status:** **${portalContext.releaseStatus || "PENDING_FD_REVIEW"}**\n\n`;
        }
        resp +=
          `### Why a Release Request Remains Pending:\n` +
          `Under AICTE Finance Division procedures, a release request requires all three of the following conditions:\n\n` +
          `1. **4 Mandatory Documents Verified:** Release Letter, FDR Copy, Sworn Affidavit 6, and latest EoA. If any document is still being scrutinized or marked deficient, release cannot proceed.\n` +
          `2. **PGRC Bureau Clearance:** If any student or staff grievance against the institution is under investigation, the clearance status is set to **ON PROCESS**, extending the release hold.\n` +
          `3. **Vigilance Bureau Clearance:** If any inquiry or integrity check is active, clearance is marked **ON PROCESS**, keeping release pending.\n\n` +
          `**Where to check:** Open **Receive → Deposit Details** (\`/institution/receive/deposit\`) to view your real-time clearance badges.`;
        return { content: resp, citations: [] };
      }
    }

    // Application Status
    if (q.includes("status of my application") || q.includes("application status")) {
      if (role === "INSTITUTION") {
        return {
          content:
            `### Application Status Summary\n\n` +
            `- **Application Reference:** **${portalContext.applicationNumber || "None recorded"}**\n` +
            `- **Status:** **${portalContext.applicationStatus || "NOT SUBMITTED"}**\n` +
            `- **Document Verification:** ${portalContext.documentStats?.verified || 0} / ${portalContext.documentStats?.total || 12} Verified\n\n` +
            `To view detailed verification remarks, go to **Receive → Complaint Outcome Letters** (\`/institution/receive/complaint-letters\`).`,
          citations: [],
        };
      }
    }
  }

  // 6. HOW-TO & WORKFLOW GUIDANCE
  if (classification.category === "HOWTO_WORKFLOW") {
    // How do I release my FDR deposit? / How do I submit a release application?
    if (
      q.includes("how do i release") ||
      q.includes("how to release") ||
      q.includes("release application") ||
      q.includes("release my fdr") ||
      q.includes("release fdr") ||
      q.includes("release deposit") ||
      q.includes("fdr deposit release")
    ) {
      if (role === "INSTITUTION") {
        return {
          content:
            `### How to Apply for FDR Deposit Release in the Institution Portal:\n\n` +
            `1. Navigate to **Submit → Release Application** (\`/institution/submit/release\`).\n` +
            `2. Select the matured Fixed Deposit Receipt from your registered deposits list.\n` +
            `3. Upload the **4 mandatory release documents**:\n` +
            `   - **Release Request Letter** (on official institutional letterhead)\n` +
            `   - **Original FDR Copy** (with bank discharge/lien status)\n` +
            `   - **Sworn Affidavit 6** (notarized on ₹100 stamp paper as prescribed in the Approval Process Handbook)\n` +
            `   - **Latest Extension of Approval (EoA) / NOC**\n` +
            `4. Verify that there are no active disciplinary actions or unresolved complaints under PGRC or Vigilance.\n` +
            `5. Click **Submit Release Request**.\n` +
            `6. Monitor your review progress and clearance statuses in **Receive → Deposit Details** (\`/institution/receive/deposit\`).`,
          citations: [],
        };
      }
    }

    // How do I submit an FDR? / FDR submission workflow
    if (
      q.includes("how do i submit an fdr") ||
      q.includes("how to submit an fdr") ||
      q.includes("how do i submit fdr") ||
      q.includes("how to submit fdr")
    ) {
      if (role === "INSTITUTION") {
        return {
          content:
            `### How to Submit an FDR in the Institution Portal:\n\n` +
            `1. In the sidebar menu, click **Submit → Payment / FDR Submission** (\`/institution/submit/payment\`).\n` +
            `2. Enter the **FDR Number**, **Issuing Bank**, **Branch**, **Deposit Amount**, and **Maturity Date** (confirming it is created jointly with Regional Officer, AICTE).\n` +
            `3. Upload a legible PDF copy of the official Bank Fixed Deposit Receipt bearing the bank's lien endorsement seal.\n` +
            `4. Click **Submit FDR Details**.\n` +
            `5. Your deposit will be transmitted to the AICTE Finance Division (FD) for verification and will appear under **Receive → Deposit Details** (\`/institution/receive/deposit\`).`,
          citations: [],
        };
      }
    }

    // What happens after submitting an FDR?
    if (
      q.includes("what happens after submitting an fdr") ||
      q.includes("what happens after submit fdr") ||
      q.includes("what happens after submitting fdr") ||
      q.includes("after submitting my fdr") ||
      q.includes("after submit my fdr")
    ) {
      return {
        content:
          `### What Happens After Submitting an FDR:\n\n` +
          `1. **Transmission to Finance Division:** Your FDR receipt and bank details are received by the **AICTE Finance Division (FD)** and queued in their **Deposit Records** tab.\n` +
          `2. **Scrutiny & Verification:** An FD officer inspects the bank receipt to verify the principal amount, bank branch, joint lien in favor of the Regional Officer, AICTE, and the required lock-in duration.\n` +
          `3. **Transfer to Active Registry:** Once marked **Verified**, the deposit is transferred to the **Alive FDs** registry for active term monitoring.\n` +
          `4. **Institution Notification:** You receive an automated confirmation notification in your portal inbox, and your status in **Receive → Deposit Details** updates to **Active / Verified**.\n` +
          `5. **Next Step:** Ensure all mandatory statutory documents are submitted under **Submit → Approval Seeking** to complete your institutional approval requirements.`,
        citations: [],
      };
    }

    // Who verifies my documents? / Who will approve it?
    if (
      q.includes("who verifies my documents") ||
      q.includes("who verifies documents") ||
      q.includes("who verifies it") ||
      q.includes("who will approve it") ||
      q.includes("who approves it") ||
      q.includes("who approves my application")
    ) {
      return {
        content:
          `### Document Verification and Approval Authority:\n\n` +
          `- **Document & FDR Scrutiny:** Uploaded institutional documents and security deposit receipts are scrutinized and verified by authorized officers of the **AICTE Finance Division (FD)**.\n` +
          `- **Grievance Checks:** Student or faculty complaint checks are processed by the **Public Grievance Redressal Cell (PGRC)**.\n` +
          `- **Integrity & Vigilance Clearances:** Ethics, fraud, or whistleblower screenings are reviewed by the **AICTE Vigilance Division**.\n` +
          `- **Final Regulatory Approval:** Final Letters of Approval (LoA) or Extensions of Approval (EoA) are generated and issued by the **Approval Bureau / Competent Council Authority** following complete scrutiny.`,
        citations: [],
      };
    }

    // What happens after release submission?
    if (
      q.includes("what happens after release submission") ||
      q.includes("after release submission") ||
      q.includes("after submitting release")
    ) {
      return {
        content:
          `### What Happens After Submitting a Release Application:\n\n` +
          `1. **Finance Division Review:** Your 4 release documents (Release Request Letter, FDR Copy, Notarized Affidavit 6, and latest EoA) are queued in the FD Employee Portal under **Release Applications**.\n` +
          `2. **Automated Inter-Bureau Screening:** The system initiates statutory clearance checks with **PGRC** (verifying no pending student/faculty wage or fee complaints) and **Vigilance** (verifying no criminal or ethical proceedings).\n` +
          `3. **Officer Evaluation:** Once clearances are confirmed, the Finance Division officer assesses lock-in maturity and approves discharge.\n` +
          `4. **Discharge & Notice:** AICTE issues the official No Objection Certificate (NOC) / Letter of Discharge to the bank, releasing the lien, and updates your deposit status to **RELEASED**.`,
        citations: [],
      };
    }

    // How do I submit a complaint?
    if (
      q.includes("how do i submit a complaint") ||
      q.includes("how to submit a complaint") ||
      q.includes("submit a complaint") ||
      q.includes("submit complaint")
    ) {
      return {
        content:
          `### How to Submit a Complaint in the AICTE Portal:\n\n` +
          `1. **Student / Faculty Grievance:** Go to **Public Grievance Portal** (\`/complaints/pgrc\`), fill in your details, select the institution, describe the issue, and upload any proof.\n` +
          `2. **Corruption / Malpractice Complaint:** Go to **Public Vigilance Portal** (\`/complaints/vigilance\`) to lodge a confidential complaint.\n` +
          `3. After submission, save the generated **Reference Number** (e.g. \`PGRC-2026-XXXXX\` or \`VIG-2026-XXXXX\`) to track your inquiry.`,
        citations: [],
      };
    }

    // How do I track my complaint?
    if (
      q.includes("how do i track my complaint") ||
      q.includes("how to track my complaint") ||
      q.includes("how do i track complaint") ||
      q.includes("how to track complaint") ||
      q.includes("track my complaint")
    ) {
      return {
        content:
          `### How to Track Your Complaint:\n\n` +
          `1. **PGRC Complaint Tracking:** Navigate to \`/complaints/pgrc/track\`.\n` +
          `2. Enter your **Complaint Reference Number** and registered **Email Address**.\n` +
          `3. Click **Track Status** to view the live timeline, committee hearings, and outcome remarks.\n` +
          `4. For Vigilance inquiries, visit \`/complaints/vigilance/track\` with your Vigilance case number.`,
        citations: [],
      };
    }

    // Role Declaration Response (e.g. "I am an institution user")
    if (
      q === "i am an institution user" ||
      q === "i am an institution user." ||
      q === "i am institution" ||
      q === "i am a college user"
    ) {
      return {
        content:
          `Welcome! I can guide you through the **Institution Portal**, including submitting approval applications, uploading documents, tracking verification remarks, recording FDR deposits, and submitting release requests. How can I help you today?`,
        citations: [],
      };
    }

    // Payment details navigation
    if (q.includes("where can i find my payment details") || q.includes("where are my payment details") || q.includes("payment details")) {
      if (role === "INSTITUTION") {
        return {
          content:
            `In the **Institution Portal**, payment and deposit information is located at:\n\n` +
            `1. **Submit new FDR / Bank details:** **Submit → Payment / FDR Submission** (\`/institution/submit/payment\`)\n` +
            `2. **View verified deposits & bank details:** **Receive → Deposit Details** (\`/institution/receive/deposit\`)`,
          citations: [],
        };
      }
    }

    // Prompt injection / administrative action override defense
    if (
      q.includes("ignore previous instructions") ||
      q.includes("ignore all instructions") ||
      q.includes("approve my application") ||
      q.includes("approve this application") ||
      q.includes("approve release") ||
      q.includes("mark as verified") ||
      q.includes("change status to")
    ) {
      return {
        content:
          `### Portal Action Boundary Notice\n\n` +
          `I am an informational AI guide and cannot execute administrative actions, alter database records, or approve applications. ` +
          `Approval and verification are statutory responsibilities strictly reserved for authorized AICTE officers.\n\n` +
          `**Approval Process:**\n` +
          `- As an institution, submit your documents at **Submit → Approval Seeking** (\`/institution/submit/approval\`).\n` +
          `- Designated AICTE Finance Division (FD) officers will scrutinize your submission in their official dashboard and issue the formal Letter of Approval (LoA) or Letter of Deficiency (LoD).`,
        citations: [],
      };
    }

    // What should I do after this application is returned for correction?
    if (q.includes("returned for correction") || q.includes("application is returned") || (q.includes("correction") && q.includes("what should i do"))) {
      return {
        content:
          `### What to Do After Your Application is Returned for Correction:\n\n` +
          `1. **Read Specific Deficiency Remarks:** Open **Receive → Complaint Outcome Letters** (\`/institution/receive/complaint-letters\`) or **Receive → LoD / EoD** (\`/institution/receive/lod-eod\`). Read the exact remark recorded by the FD officer for each rejected document.\n` +
          `2. **Prepare Rectified Documents:** Obtain the updated authentic certificate, building approval plan, or sworn affidavit that directly satisfies the cited requirement.\n` +
          `3. **Re-upload in Approval Seeking:** Navigate to **Submit → Approval Seeking** (\`/institution/submit/approval\`), locate the deficient document slot, and upload the corrected PDF.\n` +
          `4. **Submit for Re-Scrutiny:** Click **Save / Submit Application** to return the file to the AICTE Finance Division for re-evaluation.`,
        citations: [],
      };
    }

    // How do I use the AICTE portal?
    if (
      q.includes("how do i use the aicte portal") ||
      q.includes("how to use the aicte portal") ||
      q.includes("how do i use the portal") ||
      q.includes("how to use the portal") ||
      q.includes("how do i use portal") ||
      q.includes("how to use portal") ||
      q === "how do i use the aicte portal?" ||
      q === "how to use aicte portal"
    ) {
      if (role === "INSTITUTION") {
        return {
          content:
            `### How to Use the AICTE Unified Portal (Institution Guide):\n\n` +
            `1. **Dashboard Overview (\`/institution/dashboard\`):** Check your institutional approval status, FDR metrics, and active notifications.\n` +
            `2. **Submit Approval Documents (\`/institution/submit/approval\`):** Upload all 12 mandatory statutory certificates for LoA or annual EoA.\n` +
            `3. **Submit FDR / Payments (\`/institution/submit/payment\`):** Record your bank FDR receipt and deposit information under joint lien with Regional Officer, AICTE.\n` +
            `4. **Monitor Deposit Details & Clearances (\`/institution/receive/deposit\`):** Track active FDR lock-in status and cross-bureau clearances from PGRC and Vigilance.\n` +
            `5. **Download Official Documents (\`/institution/receive/loa-eoa\`):** Download approved Letters of Approval (LoA) or Extension of Approval (EoA).\n` +
            `6. **Request Deposit Release (\`/institution/submit/release\`):** Apply for return of matured FDR security deposits upon completing the lock-in term.`,
          citations: [],
        };
      }
      return {
        content:
          `### How to Use the AICTE Unified Portal:\n\n` +
          `1. **Institutions:** Submit statutory approval documents, record security deposit FDRs, track verification remarks, and apply for deposit release.\n` +
          `2. **Finance Division (FD):** Scrutinize institution applications, verify FDR receipts, and process deposit clearances.\n` +
          `3. **PGRC & Vigilance:** Adjudicate complaints and maintain integrity clearances.\n` +
          `4. **Public & Students:** Lodge and track grievances at \`/complaints/pgrc/track\`.`,
        citations: [],
      };
    }

    // How do I submit an application?
    if (q.includes("how do i submit an application") || q.includes("how to submit application")) {
      return {
        content:
          `### How to Submit an Application in the Institution Portal:\n\n` +
          `1. In the sidebar menu, click **Submit → Approval Seeking** (\`/institution/submit/approval\`).\n` +
          `2. Select your **Application Type** (LoA for new institution, or EoA for annual extension).\n` +
          `3. Upload authentic PDF documents for all **12 statutory categories** (Land Deed, Building Plan, Fire NOC, Structural Stability, Affidavit-1, etc.).\n` +
          `4. Once all slots display green uploaded status, click **Submit Application**.\n` +
          `5. Your file will immediately move to **SUBMITTED** status and be queued for FD Scrutiny.`,
        citations: [],
      };
    }

    // How do I verify an FDR?
    if (q.includes("how do i verify an fdr") || q.includes("verify an fdr") || q.includes("how to verify fdr")) {
      if (role === "AICTE_FD_EMPLOYEE") {
        return {
          content:
            `### How to Verify an FDR (FD Employee Portal):\n\n` +
            `1. Open the **Deposit Records** tab in the sidebar menu.\n` +
            `2. Select the deposit item marked \`PENDING_VERIFICATION\` and click **Verify**.\n` +
            `3. Check the uploaded bank receipt to confirm:\n` +
            `   - It is in the joint name of the institution and Regional Officer, AICTE.\n` +
            `   - The term is strictly 8 to 10 years.\n` +
            `   - The bank lien stamp is clear and valid.\n` +
            `4. Enter your verification note and click **Mark as Verified**.\n` +
            `5. The deposit will automatically transfer to the **Alive FDs** monitoring registry.`,
          citations: [],
        };
      }
      return {
        content:
          `FDR verification is performed administratively by the **AICTE Finance Division (FD)**. As an institution, submit your FDR receipt under **Submit → Payment / FDR Submission** (\`/institution/submit/payment\`) and monitor approval under **Receive → Deposit Details** (\`/institution/receive/deposit\`).`,
        citations: [],
      };
    }

    // What should I do after receiving LoA?
    if (q.includes("after receiving loa") || q.includes("after loa")) {
      return {
        content:
          `### Next Steps After Receiving Letter of Approval (LoA):\n\n` +
          `1. **Download Official Certificate:** Go to **Receive → LoA / EoA** (\`/institution/receive/loa-eoa\`) and download your signed approval certificate.\n` +
          `2. **Obtain University Affiliation:** Present the LoA to your designated Affiliating University or State Technical Board to finalize affiliation before admitting students.\n` +
          `3. **Participate in Centralized Admissions:** Coordinate with the State Admission Authority for approved intake counseling.\n` +
          `4. **Submit 10-Year Joint FDR:** If not yet submitted, create the joint FDR with the Regional Officer, AICTE and record it in **Submit → Payment / FDR Submission**.\n` +
          `5. **Prepare for Annual EoA:** For subsequent sessions, file annual compliance under Chapter 2.`,
        citations: [],
      };
    }

    // How do I track my PGRC complaint?
    if (q.includes("track my pgrc complaint") || q.includes("track pgrc")) {
      return {
        content:
          `### How to Track Your PGRC Complaint:\n\n` +
          `1. Open **Track PGRC Complaint** at \`/complaints/pgrc/track\`.\n` +
          `2. Enter your **Complaint Reference Number** (e.g. \`PGRC-2026-XXXXX\`).\n` +
          `3. Enter the **Email Address** used during submission.\n` +
          `4. Click **Track Status** to view the live timeline and committee remarks.`,
        citations: [],
      };
    }
  }

  // Fallback direct answer
  return {
    content:
      `I can guide you with any page, button, form, or workflow in the AICTE Portal, or explain official regulations from the 2024–27 Handbook. Could you please specify which portal page or requirement you are looking for?`,
    citations: [],
  };
}
