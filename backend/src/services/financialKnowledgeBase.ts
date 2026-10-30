// src/services/financialKnowledgeBase.ts
/**
 * Basic Financial & Fixed Deposit (FD / FDR) Knowledge Base
 * 
 * Provides verified, beginner-friendly financial definitions for terms used in banking
 * and AICTE institutional security deposits.
 */

export interface FinancialTermDoc {
  term: string;
  definition: string;
  portalContext?: string;
}

export const FINANCIAL_KNOWLEDGE: Record<string, FinancialTermDoc> = {
  maturity_date: {
    term: "Maturity Date",
    definition: "A maturity date is the specific date when a Fixed Deposit (FD/FDR) completes its agreed tenure or lock-in term, and the principal amount along with any accumulated interest becomes eligible for payment, renewal, or formal release.",
    portalContext: "In the AICTE Portal, security deposit FDRs typically have an 8 to 10-year lock-in period. When the deposit enters its 30-day pre-maturity window, the Finance Division issues a maturity reminder notice, enabling the institution to file Affidavit 6 for release processing."
  },
  fd: {
    term: "Fixed Deposit (FD)",
    definition: "A Fixed Deposit (FD) is a secure financial investment offered by banks where a fixed sum of money is deposited for a predetermined period at a guaranteed interest rate. The money cannot be withdrawn freely without completing the agreed term or incurring premature closure conditions.",
    portalContext: "AICTE requires technical institutions to establish Fixed Deposits pledged in joint name with the Regional Officer, AICTE as a statutory security deposit ensuring institutional financial stability."
  },
  fdr: {
    term: "Fixed Deposit Receipt (FDR)",
    definition: "A Fixed Deposit Receipt (FDR) is the official receipt issued by a scheduled commercial bank certifying that a deposit has been placed for a specified term, interest rate, and amount.",
    portalContext: "Institutions submit their FDR receipt details under Submit → Payment / FDR Submission (/institution/submit/payment) with a bank lien endorsement in favor of AICTE."
  },
  maturity_amount: {
    term: "Maturity Amount",
    definition: "The maturity amount is the total sum payable by the bank upon completion of the deposit term. It comprises the original principal amount deposited plus all accumulated interest earned over the tenure.",
    portalContext: "For AICTE security deposits, the principal amount is pledged under lien to the Regional Officer, AICTE until statutory lock-in completion and council release clearance."
  },
  principal_amount: {
    term: "Principal Amount",
    definition: "The principal amount is the initial baseline sum of money invested or deposited into the Fixed Deposit account, excluding any earned interest.",
    portalContext: "AICTE prescribes statutory FDR principal amounts (e.g., ₹35 Lakhs or as specified in the Approval Process Handbook) depending on the institution category and program."
  },
  interest_and_rate: {
    term: "Interest and Interest Rate",
    definition: "Interest is the additional financial return paid by the bank to the depositor for keeping funds in an FD. The interest rate is the fixed annual percentage agreed upon at the time of deposit creation.",
    portalContext: "FD interest rates are fixed by the issuing Scheduled Commercial Bank. AICTE security deposits accumulate interest or disburse returns according to the joint deposit terms."
  },
  simple_vs_compound_interest: {
    term: "Simple Interest vs Compound Interest",
    definition: "Simple interest is calculated solely on the original principal amount. Compound interest is calculated on the initial principal plus the accumulated interest from preceding compounding intervals (quarterly or annually), enabling faster growth of funds.",
    portalContext: "Most long-term institutional bank FDRs are compounded quarterly by scheduled commercial banks."
  },
  deposit_date_vs_maturity_date: {
    term: "Deposit Date vs Maturity Date",
    definition: "The deposit date is the start date when funds are deposited and the FDR is issued by the bank. The maturity date is the end date when the agreed deposit tenure finishes and funds become eligible for encashment, renewal, or release.",
    portalContext: "In the AICTE Portal, both dates are recorded under Submit → Payment / FDR Submission. The duration between the deposit date and maturity date must satisfy AICTE's mandatory lock-in period (typically 8 to 10 years)."
  },
  tenure: {
    term: "Tenure / Lock-in Period",
    definition: "Tenure is the agreed duration for which money remains invested in a Fixed Deposit before it matures.",
    portalContext: "Under the AICTE Approval Process Handbook, institutional security deposits require a mandatory lock-in tenure (usually 8 to 10 years)."
  },
  premature_withdrawal: {
    term: "Premature Withdrawal and Penalties",
    definition: "Premature withdrawal refers to breaking or encashing a Fixed Deposit before its designated maturity date. Banks may levy a penalty or offer a reduced interest rate for early closure.",
    portalContext: "Unauthorized premature withdrawal or encashment of an AICTE joint FDR without council clearance is strictly prohibited and attracts severe regulatory penalties, including reduction of intake or withdrawal of approval."
  },
  fd_renewal_and_closure: {
    term: "FD Renewal and Closure",
    definition: "FD renewal is the process of extending a matured deposit for an additional tenure, while closure is the formal termination of the deposit where the principal and interest are paid out to the account holder.",
    portalContext: "Upon maturity, technical institutions apply for release and return of FDR under Submit → Release Application (/institution/submit/release) upon receiving PGRC and Vigilance bureau clearances."
  }
};
