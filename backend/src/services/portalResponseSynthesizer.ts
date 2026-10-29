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

  // 2. GENERAL DEFINITIONS & BASIC KNOWLEDGE
  if (classification.category === "GENERAL_DEFINITION" || classification.matchedTermKey) {
    const key = classification.matchedTermKey;
    if (key && PORTAL_TERMINOLOGY_KNOWLEDGE[key]) {
      const termInfo = PORTAL_TERMINOLOGY_KNOWLEDGE[key];
      return {
        content: `**${termInfo.term}**:\n${termInfo.definition}\n\n**Portal Relevance:**\n${termInfo.portalContext}`,
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
