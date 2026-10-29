// backend/scripts/test_chatbot_acceptance.ts
/**
 * Automated Verification Script for Chatbot Intent Classification & Portal Knowledge
 * Validates the 10 prompt acceptance tests.
 */

import { classifyUserQuestion } from "../src/services/questionClassifier";
import { generatePortalGuidanceAnswer } from "../src/services/portalResponseSynthesizer";

const TEST_CASES = [
  {
    name: "Test 1: Where can I see deposit details?",
    query: "Where can I see deposit details?",
    role: "INSTITUTION",
    expectedCategory: "PORTAL_NAVIGATION",
    expectedIncludes: ["/institution/receive/deposit", "Deposit Details"],
    forbiddenIncludes: ["insufficient", "Clause 4.12"],
  },
  {
    name: "Test 2: What is handbook?",
    query: "What is handbook?",
    role: "INSTITUTION",
    expectedCategory: "GENERAL_DEFINITION",
    expectedIncludes: ["Approval Process Handbook", "AICTE"],
    forbiddenIncludes: ["insufficient", "Clause 4.12", "Clause 1.12"],
  },
  {
    name: "Test 3: Hi hello",
    query: "Hi hello",
    role: "INSTITUTION",
    expectedCategory: "GREETING",
    expectedIncludes: ["Hi!"],
    forbiddenIncludes: ["insufficient"],
  },
  {
    name: "Test 4: Bro",
    query: "Bro",
    role: "INSTITUTION",
    expectedCategory: "GREETING",
    expectedIncludes: ["Hey!"],
    forbiddenIncludes: ["insufficient"],
  },
  {
    name: "Test 5: What is complaint outcome letter?",
    query: "What is complaint outcome letter?",
    role: "INSTITUTION",
    expectedCategory: "GENERAL_DEFINITION",
    expectedIncludes: ["Complaint Outcome Letters", "deficiency remarks"],
    forbiddenIncludes: ["insufficient"],
  },
  {
    name: "Test 6: What is FDR?",
    query: "What is FDR?",
    role: "INSTITUTION",
    expectedCategory: "GENERAL_DEFINITION",
    expectedIncludes: ["Fixed Deposit Receipt", "Security Deposit", "Scheduled Commercial Bank"],
    forbiddenIncludes: ["insufficient"],
  },
  {
    name: "Test 7: What does the Generate Maturity Letter button do?",
    query: "What does the Generate Maturity Letter button do?",
    role: "AICTE_FD_EMPLOYEE",
    expectedCategory: "PAGE_BUTTON_EXPLANATION",
    expectedIncludes: ["Generate Maturity Letter", "Alive FDs", "30 days", "email"],
    forbiddenIncludes: ["insufficient"],
  },
  {
    name: "Test 8: What are the official AICTE requirements for FDR release under Clause 6.46?",
    query: "What are the official AICTE requirements for FDR release under Clause 6.46?",
    role: "INSTITUTION",
    expectedCategory: "REGULATORY_HANDBOOK",
    needsHandbookRetrieval: true,
  },
  {
    name: "Test 9: Why is my release request pending?",
    query: "Why is my release request pending?",
    role: "INSTITUTION",
    expectedCategory: "LIVE_RECORD_STATUS",
    expectedIncludes: ["Affidavit 6", "PGRC", "Vigilance", "/institution/receive/deposit"],
    forbiddenIncludes: ["insufficient"],
  },
  {
    name: "Test 10: What should I do after this application is returned for correction?",
    query: "What should I do after this application is returned for correction?",
    role: "INSTITUTION",
    expectedCategory: "HOWTO_WORKFLOW",
    expectedIncludes: ["Complaint Outcome Letters", "Approval Seeking", "/institution/submit/approval"],
    forbiddenIncludes: ["insufficient"],
  },
];

async function run() {
  console.log("====================================================");
  console.log("AICTE CHATBOT ACCEPTANCE SUITE (10 SCENARIOS)");
  console.log("====================================================\n");

  let passed = 0;

  for (const tc of TEST_CASES) {
    const classification = classifyUserQuestion(tc.query, tc.role);

    let ok = true;
    const errors: string[] = [];

    if (classification.category !== tc.expectedCategory) {
      ok = false;
      errors.push(`Category mismatch: got "${classification.category}", expected "${tc.expectedCategory}"`);
    }

    if (!tc.needsHandbookRetrieval) {
      const answer = generatePortalGuidanceAnswer({
        userQuery: tc.query,
        classification,
        portalContext: {
          role: tc.role,
          portal: tc.role === "INSTITUTION" ? "Institution Portal" : "AICTE FD Employee Portal",
          currentRoute: "/institution/dashboard",
        },
      });

      if (tc.expectedIncludes) {
        for (const exp of tc.expectedIncludes) {
          if (!answer.content.toLowerCase().includes(exp.toLowerCase())) {
            ok = false;
            errors.push(`Missing expected phrase: "${exp}"`);
          }
        }
      }

      if (tc.forbiddenIncludes) {
        for (const forb of tc.forbiddenIncludes) {
          if (answer.content.toLowerCase().includes(forb.toLowerCase())) {
            ok = false;
            errors.push(`Found forbidden phrase: "${forb}"`);
          }
        }
      }
    }

    if (ok) {
      passed++;
      console.log(`[PASS] ${tc.name}`);
    } else {
      console.log(`[FAIL] ${tc.name}`);
      errors.forEach((e) => console.log(`       - ${e}`));
    }
  }

  console.log(`\n====================================================`);
  console.log(`ACCEPTANCE RESULTS: ${passed} / ${TEST_CASES.length} PASSED`);
  console.log(`====================================================`);

  if (passed !== TEST_CASES.length) {
    process.exit(1);
  }
}

run().catch(console.error);
