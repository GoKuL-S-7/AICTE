// backend/scripts/test_user_friendly_chatbot.ts
/**
 * Verification Suite for User-Friendly AICTE Portal Assistant
 * Tests all 25 standard scenarios from Phase 12 of the prompt.
 */

import { classifyUserQuestion } from "../src/services/questionClassifier";
import { generatePortalGuidanceAnswer } from "../src/services/portalResponseSynthesizer";

interface TestCase {
  id: number;
  query: string;
  role?: string;
  expectedCategory?: string;
  expectedIncludes: string[];
  forbiddenIncludes?: string[];
}

const TESTS: TestCase[] = [
  {
    id: 1,
    query: "Hi",
    expectedCategory: "GREETING",
    expectedIncludes: ["Hi! How can I help you"],
  },
  {
    id: 2,
    query: "Hi dude",
    expectedCategory: "GREETING",
    expectedIncludes: ["Hi! How can I help you with the AICTE Portal?"],
  },
  {
    id: 3,
    query: "What is FD?",
    expectedCategory: "GENERAL_DEFINITION",
    expectedIncludes: ["Finance Division", "deposit-related"],
  },
  {
    id: 4,
    query: "What is FDR?",
    expectedCategory: "GENERAL_DEFINITION",
    expectedIncludes: ["Fixed Deposit Receipt", "bank", "security deposit"],
  },
  {
    id: 5,
    query: "What is Approval Seeking?",
    expectedCategory: "GENERAL_DEFINITION",
    expectedIncludes: ["Approval Seeking", "12 mandatory statutory documents"],
  },
  {
    id: 6,
    query: "What are Alive FDs?",
    expectedCategory: "GENERAL_DEFINITION",
    expectedIncludes: ["Alive FDs", "active", "Finance Division"],
  },
  {
    id: 7,
    query: "What are Rejected Forms?",
    expectedCategory: "GENERAL_DEFINITION",
    expectedIncludes: ["Rejected Forms", "rejected", "remarks"],
  },
  {
    id: 8,
    query: "Where can I see deposit details?",
    role: "INSTITUTION",
    expectedCategory: "PORTAL_NAVIGATION",
    expectedIncludes: ["/institution/receive/deposit", "Deposit Details"],
  },
  {
    id: 9,
    query: "How do I submit an FDR?",
    role: "INSTITUTION",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["/institution/submit/payment", "Payment / FDR Submission"],
  },
  {
    id: 10,
    query: "What happens after submitting an FDR?",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["Finance Division", "Deposit Records", "Alive FDs"],
  },
  {
    id: 11,
    query: "Who verifies my documents?",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["Finance Division (FD)", "PGRC", "Vigilance"],
  },
  {
    id: 12,
    query: "How can I check my application status?",
    role: "INSTITUTION",
    expectedCategory: "LIVE_RECORD_STATUS",
    expectedIncludes: ["Application Status Summary"],
  },
  {
    id: 13,
    query: "What does the Verify button do?",
    role: "AICTE_FD_EMPLOYEE",
    expectedCategory: "PAGE_BUTTON_EXPLANATION",
    expectedIncludes: ["Verify Button", "VERIFIED", "green badge"],
  },
  {
    id: 14,
    query: "How can I download my document?",
    role: "INSTITUTION",
    expectedCategory: "PAGE_BUTTON_EXPLANATION",
    expectedIncludes: ["Download", "LoA / EoA"],
  },
  {
    id: 15,
    query: "How do I submit a release application?",
    role: "INSTITUTION",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["/institution/submit/release", "Affidavit 6", "NOC"],
  },
  {
    id: 16,
    query: "What happens after release submission?",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["Release Applications", "PGRC", "Vigilance", "NOC"],
  },
  {
    id: 17,
    query: "What is PGRC?",
    expectedCategory: "GENERAL_DEFINITION",
    expectedIncludes: ["Public Grievance Redressal Cell", "grievances"],
  },
  {
    id: 18,
    query: "How do I submit a complaint?",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["/complaints/pgrc", "/complaints/vigilance"],
  },
  {
    id: 19,
    query: "How do I track my complaint?",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["/complaints/pgrc/track", "Complaint Reference Number"],
  },
  {
    id: 20,
    query: "What is Clause 6.46?",
    expectedCategory: "REGULATORY_HANDBOOK",
    expectedIncludes: [], // Route to Handbook RAG pipeline
  },
  {
    id: 21,
    query: "What is Clause 6.63?",
    expectedCategory: "REGULATORY_HANDBOOK",
    expectedIncludes: [], // Route to Handbook RAG pipeline
  },
  {
    id: 22,
    query: "I am an institution user.",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["Institution Portal", "approval applications"],
  },
  {
    id: 23,
    query: "Where can I find my payment details?",
    role: "INSTITUTION",
    expectedCategory: "PORTAL_NAVIGATION",
    expectedIncludes: ["/institution/submit/payment", "/institution/receive/deposit"],
  },
  {
    id: 24,
    query: "What happens next?",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["AICTE"],
  },
  {
    id: 25,
    query: "Who will approve it?",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["Approval Bureau", "Finance Division"],
  },
];

async function runSuite() {
  console.log("=====================================================================");
  console.log("    AICTE PORTAL USER-FRIENDLY CHATBOT 25-POINT ACCEPTANCE SUITE");
  console.log("=====================================================================\n");

  let passed = 0;
  let failed = 0;

  for (const t of TESTS) {
    console.log(`[TEST ${t.id}/25] Query: "${t.query}" (Role: ${t.role || "GENERAL"})`);
    const classification = classifyUserQuestion(t.query, t.role);

    let catMatch = true;
    if (t.expectedCategory && classification.category !== t.expectedCategory) {
      console.error(`  ❌ Category mismatch: Expected '${t.expectedCategory}', got '${classification.category}'`);
      catMatch = false;
    }

    let content = "";
    if (classification.category !== "REGULATORY_HANDBOOK") {
      const res = generatePortalGuidanceAnswer({
        userQuery: t.query,
        classification,
        portalContext: {
          role: t.role || "INSTITUTION",
          applicationNumber: "APP-2026-TEST",
          applicationStatus: "SUBMITTED",
          documentStats: { verified: 12, total: 12 },
        },
      });
      content = res.content;
    }

    let contentMatch = true;
    for (const exp of t.expectedIncludes) {
      if (!content.toLowerCase().includes(exp.toLowerCase())) {
        console.error(`  ❌ Missing text: "${exp}"`);
        contentMatch = false;
      }
    }

    // Developer details check (never expose backend models, endpoints, code paths in content)
    const devLeaks = ["mongoose", "schema.types", "req.session", "express", "sql", "controller", "upload_dir"];
    for (const leak of devLeaks) {
      if (content.toLowerCase().includes(leak)) {
        console.error(`  ❌ Leaked developer term: "${leak}"`);
        contentMatch = false;
      }
    }

    if (catMatch && contentMatch) {
      console.log(`  ✅ PASSED (Category: ${classification.category})`);
      passed++;
    } else {
      console.log(`  ❌ FAILED`);
      if (content) {
        console.log(`     Output preview: ${content.substring(0, 160).replace(/\n/g, " ")}...`);
      }
      failed++;
    }
    console.log("");
  }

  console.log("=====================================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: 25)`);
  console.log("=====================================================================");

  if (failed > 0) process.exit(1);
}

runSuite().catch(console.error);
