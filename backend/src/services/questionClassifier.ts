// src/services/questionClassifier.ts
/**
 * AICTE Unified Portal - Robust Intent & Knowledge Source Classifier
 * 
 * Classifies every user query BEFORE handbook retrieval or response generation.
 * Categories:
 *   A. GREETING (Hi, hello, bro, good morning)
 *   B. CASUAL_CONVERSATION (Thanks, okay, bye, sure, cool)
 *   C. PORTAL_NAVIGATION ("Where can I see deposit details?", "Where is the FDR page?")
 *   D. PAGE_BUTTON_EXPLANATION ("What does Generate Maturity Letter do?", "What is this page for?")
 *   E. HOWTO_WORKFLOW ("How do I submit an application?", "How do I verify an FDR?", "What should I do after receiving LoA?")
 *   F. GENERAL_DEFINITION ("What is FDR?", "What is handbook?", "What is EoA?", "What is complaint outcome letter?")
 *   G. LIVE_RECORD_STATUS ("Why is my release request pending?", "What is the status of my application?")
 *   H. REGULATORY_HANDBOOK ("What does the 2024-27 handbook require for FDR release?", "Clause 6.46 requirements")
 *   I. UNRELATED ("What is the weather?", "Write python code")
 */

import { PORTAL_PAGES_KNOWLEDGE, PORTAL_TERMINOLOGY_KNOWLEDGE } from "./portalKnowledgeBase";

export type QuestionCategory =
  | "GREETING"
  | "CASUAL_CONVERSATION"
  | "PORTAL_NAVIGATION"
  | "PAGE_BUTTON_EXPLANATION"
  | "HOWTO_WORKFLOW"
  | "GENERAL_DEFINITION"
  | "LIVE_RECORD_STATUS"
  | "REGULATORY_HANDBOOK"
  | "UNRELATED";

export interface ClassificationResult {
  category: QuestionCategory;
  primarySource: "PORTAL_GUIDE" | "REGULATORY_HANDBOOK" | "GENERAL_DEFINITION" | "LIVE_CONTEXT" | "DIRECT_REPLY" | "REFUSAL";
  needsHandbookRetrieval: boolean;
  reply?: string;
  matchedPageId?: string;
  matchedTermKey?: string;
}

const GREETING_REGEX =
  /^(hi+|hello+|hey+|hiya|howdy|namaste|namaskar|greetings|bro|dude|good\s*(morning|afternoon|evening|day))(\s+(hi+|hello+|hey+|there|assistant|bot|aicte|team|sir|madam|friend|bro))*[\s!.,?]*$/i;

const GREETING_CASUAL_QUERY_REGEX =
  /^(hi+|hello+|hey+|good\s*(morning|afternoon|evening|day))[\s,!-]+(how\s*are\s*you|how\s*r\s*u|how\s*do\s*you\s*do|what\s*can\s*you\s*do|how\s*can\s*you\s*help(\s*me)?|who\s*are\s*you)[\s!.,?]*$/i;

const GRATITUDE_REGEX =
  /^(thank\s*you|thanks|thanks\s*(a\s*lot|so\s*much|very\s*much|ton)|many\s*thanks|thx)[\s!.,]*$/i;

const ACKNOWLEDGMENT_REGEX =
  /^(ok|okay|ok\s*got\s*it|got\s*it|understood|alright|all\s*right|noted|sure|fine|cool)[\s!.,]*$/i;

const CLOSING_REGEX =
  /^(bye|goodbye|see\s*you|see\s*ya|talk\s*to\s*you\s*later|have\s*a\s*nice\s*day|have\s*a\s*good\s*day|cya|take\s*care)[\s!.,]*$/i;

const STRICT_OFFTOPIC_REGEX =
  /^(what\s*is\s*the\s*weather|weather(\s*today|\s*forecast)?|tell\s*me\s*a\s*joke|joke|who\s*is\s*(the\s*)?(president|prime\s*minister|cm|chief\s*minister)|cricket\s*score|score\s*update|ipl|movie\s*recommendation|play\s*a\s*game|write\s*a\s*poem|write\s*code\s*(for)?|python\s*code|java\s*code|bubble\s*sort|stock\s*market|bitcoin|crypto|recipe\s*(for)?|how\s*to\s*(cook|bake)|who\s*won\s*the\s*match|capital\s*of|translate\s*to|song\s*lyrics|horoscope|sing\s*a\s*song)/i;

export function classifyUserQuestion(
  rawQuery: string,
  userRole?: string,
  clientRoute?: string
): ClassificationResult {
  const query = (rawQuery || "").trim();
  const lower = query.toLowerCase();

  // 1. GREETINGS & CASUAL MESSAGES (Category A)
  if (GREETING_REGEX.test(query) || GREETING_CASUAL_QUERY_REGEX.test(query)) {
    let reply = "Hi! How can I help you use the AICTE Unified Portal today?";
    if (lower.startsWith("bro")) {
      reply = "Hey! How can I help you navigate the AICTE Portal or understand approval workflows today?";
    } else if (lower.includes("good morning")) {
      reply = "Good morning! How can I help you with the AICTE Portal today?";
    } else if (lower.includes("good afternoon")) {
      reply = "Good afternoon! How can I help you with the AICTE Portal today?";
    } else if (lower.includes("good evening")) {
      reply = "Good evening! How can I help you with the AICTE Portal today?";
    }
    return {
      category: "GREETING",
      primarySource: "DIRECT_REPLY",
      needsHandbookRetrieval: false,
      reply
    };
  }

  // 2. CASUAL CONVERSATION (Category A extended)
  if (GRATITUDE_REGEX.test(query)) {
    return {
      category: "CASUAL_CONVERSATION",
      primarySource: "DIRECT_REPLY",
      needsHandbookRetrieval: false,
      reply: "You're welcome! Let me know if you need any more help navigating the portal."
    };
  }
  if (ACKNOWLEDGMENT_REGEX.test(query)) {
    return {
      category: "CASUAL_CONVERSATION",
      primarySource: "DIRECT_REPLY",
      needsHandbookRetrieval: false,
      reply: "Understood! I'm here if you have any questions about portal pages, forms, or approval workflows."
    };
  }
  if (CLOSING_REGEX.test(query)) {
    return {
      category: "CASUAL_CONVERSATION",
      primarySource: "DIRECT_REPLY",
      needsHandbookRetrieval: false,
      reply: "Goodbye! Feel free to reach out anytime you need portal assistance."
    };
  }

  // 3. STRICT OFF-TOPIC REFUSAL (Category H)
  if (STRICT_OFFTOPIC_REGEX.test(query)) {
    return {
      category: "UNRELATED",
      primarySource: "REFUSAL",
      needsHandbookRetrieval: false,
      reply: "I am specialized strictly in the AICTE Unified Portal and the AICTE Approval Process Handbook (2024–27). This topic is outside my coverage."
    };
  }

  // 4. GENERAL DEFINITIONS & TERMINOLOGY (Category E)
  // e.g. "What is a handbook?", "what is handbook", "what is fdr", "what is eoa", "what is loa", "what is complaint outcome letter"
  const isDefinitionPattern =
    /^what\s+(is|are|does\s+mean|means|do\s+you\s+mean\s+by)\s+(a\s+|an\s+|the\s+)?([a-z0-9\s/_\-]+)\??$/i.test(lower) ||
    /^explain\s+([a-z0-9\s/_\-]+)\??$/i.test(lower) ||
    /^meaning\s+of\s+([a-z0-9\s/_\-]+)\??$/i.test(lower);

  if (isDefinitionPattern) {
    if (lower.includes("handbook") || lower.includes("aph")) {
      return {
        category: "GENERAL_DEFINITION",
        primarySource: "GENERAL_DEFINITION",
        needsHandbookRetrieval: false,
        matchedTermKey: "handbook"
      };
    }
    if (lower.includes("fdr") || lower.includes("fixed deposit") || lower.includes("security deposit")) {
      // If asking specifically for clause/amounts/regulatory norms, let it go to regulatory
      if (!lower.includes("clause") && !lower.includes("penalty") && !lower.includes("how much")) {
        return {
          category: "GENERAL_DEFINITION",
          primarySource: "GENERAL_DEFINITION",
          needsHandbookRetrieval: false,
          matchedTermKey: "fdr"
        };
      }
    }
    if (lower.includes("complaint outcome letter") || lower.includes("outcome letter")) {
      return {
        category: "GENERAL_DEFINITION",
        primarySource: "PORTAL_GUIDE",
        needsHandbookRetrieval: false,
        matchedTermKey: "complaint_outcome_letter"
      };
    }
    if (lower.includes("loa") || lower.includes("letter of approval")) {
      if (!lower.includes("clause") && !lower.includes("process") && !lower.includes("checklist")) {
        return {
          category: "GENERAL_DEFINITION",
          primarySource: "GENERAL_DEFINITION",
          needsHandbookRetrieval: false,
          matchedTermKey: "loa"
        };
      }
    }
    if (lower.includes("eoa") || lower.includes("extension of approval")) {
      return {
        category: "GENERAL_DEFINITION",
        primarySource: "GENERAL_DEFINITION",
        needsHandbookRetrieval: false,
        matchedTermKey: "eoa"
      };
    }
    if (lower.includes("lod") || lower.includes("eod") || lower.includes("letter of deficiency") || lower.includes("deficiency notice")) {
      return {
        category: "GENERAL_DEFINITION",
        primarySource: "PORTAL_GUIDE",
        needsHandbookRetrieval: false,
        matchedTermKey: "lod_eod"
      };
    }
  }

  // 5. PAGE AND BUTTON EXPLANATIONS (Category C)
  // e.g. "What does Generate Maturity Letter do?", "What does this button do?", "What is this page for?"
  if (
    lower.includes("generate maturity letter") ||
    lower.includes("maturity letter button") ||
    (lower.includes("button") && lower.includes("maturity"))
  ) {
    return {
      category: "PAGE_BUTTON_EXPLANATION",
      primarySource: "PORTAL_GUIDE",
      needsHandbookRetrieval: false,
      matchedTermKey: "maturity_letter"
    };
  }

  if (
    lower.includes("what does this button do") ||
    lower.includes("what is this button for") ||
    lower.includes("what happens if i click") ||
    lower.includes("what is this page for") ||
    lower.includes("explain this page")
  ) {
    return {
      category: "PAGE_BUTTON_EXPLANATION",
      primarySource: "PORTAL_GUIDE",
      needsHandbookRetrieval: false
    };
  }

  // 6. PORTAL NAVIGATION (Category B)
  // e.g. "Where can I see deposit details?", "Where is the FDR page?", "How do I open my notifications?", "Where can I track a complaint?"
  const isNavQuery =
    lower.includes("where can i") ||
    lower.includes("where is the") ||
    lower.includes("where to find") ||
    lower.includes("how do i open") ||
    lower.includes("how to access") ||
    lower.includes("where do i see") ||
    lower.includes("where can i track") ||
    lower.includes("where to track") ||
    lower.includes("where to upload") ||
    lower.includes("where should i upload");

  if (isNavQuery) {
    return {
      category: "PORTAL_NAVIGATION",
      primarySource: "PORTAL_GUIDE",
      needsHandbookRetrieval: false
    };
  }

  // 7. LIVE RECORD & STATUS QUESTIONS (Category G)
  // e.g. "Why is my release request pending?", "What is the status of my application?", "Has my FDR been verified?", "Why was my application returned for correction?"
  if (
    lower.includes("why is my release request pending") ||
    lower.includes("why is my release pending") ||
    lower.includes("why was my release blocked") ||
    lower.includes("release request pending") ||
    lower.includes("status of my application") ||
    lower.includes("application status") ||
    lower.includes("why was my application returned") ||
    lower.includes("why my application was returned") ||
    lower.includes("has my fdr been verified") ||
    lower.includes("what happened to this complaint") ||
    lower.includes("pending applications count") ||
    lower.includes("pending queue") ||
    lower.includes("college c-") ||
    (lower.includes("why") && lower.includes("returned") && lower.includes("application")) ||
    (lower.includes("why") && lower.includes("pending") && (lower.includes("release") || lower.includes("application")))
  ) {
    return {
      category: "LIVE_RECORD_STATUS",
      primarySource: "LIVE_CONTEXT",
      needsHandbookRetrieval: false
    };
  }

  // 8. HOW-TO & WORKFLOW QUESTIONS (Category D)
  // e.g. "How do I submit an application?", "How do I verify an FDR?", "What should I do after receiving LoA?", "What should I do after this application is returned for correction?"
  if (
    lower.includes("how do i submit") ||
    lower.includes("how to submit") ||
    lower.includes("how do i verify") ||
    lower.includes("how to verify") ||
    lower.includes("what should i do after") ||
    lower.includes("what to do after") ||
    lower.includes("what happens next") ||
    lower.includes("returned for correction") ||
    lower.includes("application is returned") ||
    lower.includes("how do i track") ||
    lower.includes("how to track")
  ) {
    return {
      category: "HOWTO_WORKFLOW",
      primarySource: "PORTAL_GUIDE",
      needsHandbookRetrieval: false
    };
  }

  // 9. OFFICIAL AICTE REGULATORY QUESTIONS (Category F)
  // e.g. "What does the 2024–27 handbook require for FDR release?", "Clause 6.46 requirements", "statutory norm", "minimum land"
  if (
    lower.includes("clause") ||
    lower.includes("annexure") ||
    lower.includes("appendix") ||
    lower.includes("regulatory requirement") ||
    lower.includes("official requirement") ||
    lower.includes("statutory") ||
    lower.includes("2024-27") ||
    lower.includes("2024–27") ||
    lower.includes("aph") ||
    lower.includes("cadre ratio") ||
    lower.includes("carpet area") ||
    lower.includes("lock-in period") ||
    lower.includes("penal action")
  ) {
    return {
      category: "REGULATORY_HANDBOOK",
      primarySource: "REGULATORY_HANDBOOK",
      needsHandbookRetrieval: true
    };
  }

  // Default fallback for domain questions
  return {
    category: "HOWTO_WORKFLOW",
    primarySource: "PORTAL_GUIDE",
    needsHandbookRetrieval: true
  };
}
