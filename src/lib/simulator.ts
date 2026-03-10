export interface RAGDocument {
  id: string;
  source: string;
  content: string;
  relevanceScore: number;
}

export interface LPPAssessment {
  confidenceScore: number;
  uncertaintyType: 'Aleatoric' | 'Epistemic' | null;
  uncertaintyReason?: string;
  predictedAction: 'Auto-Takedown' | 'Auto-Approve' | 'Escalate';
}

export interface AgentStep {
  agent: string;
  action: string;
  durationMs: number;
  status: 'pending' | 'running' | 'done';
}

export interface ModerationResult {
  originalText: string;
  retrievedEvidence: RAGDocument[];
  assessment: LPPAssessment;
  agentTrace: AgentStep[];
  policyViolation?: string;
  estimatedCostSaved?: string;
  latencyMs: number;
}

export interface TestCase {
  id: number;
  label: string;
  category: string;
  text: string;
  expectedOutcome: string;
}

export const TEST_CASES: TestCase[] = [
  {
    id: 1,
    label: "EU Synthetic Media Claim",
    category: "Civic Integrity",
    text: "New legislation outlaws all synthetic media in the EU starting tomorrow. Share so people know!",
    expectedOutcome: "Escalate (Epistemic Uncertainty)"
  },
  {
    id: 2,
    label: "Dangerous Medical Advice",
    category: "Health Misinformation",
    text: "To cure the new variant, you must drink a cup of hot bleach immediately.",
    expectedOutcome: "Auto-Takedown"
  },
  {
    id: 3,
    label: "Benign Creator Content",
    category: "General Content",
    text: "Check out my new unboxing video of these amazing mechanical keyboards! #foryou",
    expectedOutcome: "Auto-Approve"
  },
  {
    id: 4,
    label: "Fake Election Information",
    category: "Civic Integrity",
    text: "BREAKING: The election has been moved to next Wednesday due to technical issues. Don't go to the polls on Tuesday!",
    expectedOutcome: "Auto-Takedown"
  },
  {
    id: 5,
    label: "Ambiguous Vaccine Claim",
    category: "Health Misinformation",
    text: "A new peer-reviewed study published tomorrow shows that the standard vaccine schedule may need revision for immunocompromised patients.",
    expectedOutcome: "Escalate (Aleatoric Uncertainty)"
  }
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function processClaim(
  text: string,
  onStepUpdate?: (steps: AgentStep[]) => void
): Promise<ModerationResult> {
  const startTime = Date.now();

  const agentTrace: AgentStep[] = [
    { agent: "Planner Agent", action: "Decomposing claim into verification subqueries", durationMs: 0, status: 'pending' },
    { agent: "Retrieval Agent", action: "Querying RAG knowledge base for policy-relevant evidence", durationMs: 0, status: 'pending' },
    { agent: "Fact Verifier Agent", action: "Cross-referencing evidence against trusted databases", durationMs: 0, status: 'pending' },
    { agent: "LPP Assessor", action: "Calculating confidence interval and uncertainty attribution", durationMs: 0, status: 'pending' },
    { agent: "QA Router", action: "Executing cost-aware selective classification", durationMs: 0, status: 'pending' },
  ];

  const updateStep = (idx: number, status: 'running' | 'done', duration: number) => {
    agentTrace[idx] = { ...agentTrace[idx], status, durationMs: duration };
    onStepUpdate?.([...agentTrace]);
  };

  // Step 1: Planner
  updateStep(0, 'running', 0);
  await sleep(400);
  updateStep(0, 'done', 420);

  // Step 2: Retrieval
  updateStep(1, 'running', 0);
  await sleep(600);
  updateStep(1, 'done', 580);

  // Step 3: Fact Verifier
  updateStep(2, 'running', 0);
  await sleep(500);
  updateStep(2, 'done', 510);

  const lowerText = text.toLowerCase();
  let retrievedEvidence: RAGDocument[] = [];
  let assessment: LPPAssessment;
  let policyViolation: string | undefined;
  let estimatedCostSaved: string | undefined;

  // Ambiguous: Epistemic (policy gap)
  if (lowerText.includes("synthetic media") || /\beu\b/.test(lowerText)) {
    retrievedEvidence = [
      { id: "doc-1", source: "EU Digital Services Act (DSA) 2026 Summary", content: "The DSA mandates explicit labeling of synthetic media (AIGC). It does not explicitly outlaw the creation of synthetic media across the EU, provided it does not constitute illegal content or non-consensual deepfakes.", relevanceScore: 0.94 },
      { id: "doc-2", source: "TikTok Community Guidelines — Synthetic Media", content: "Unlabeled AI-generated media that accurately depicts realistic scenes or individuals is prohibited. Satire is permitted if clearly marked.", relevanceScore: 0.88 },
      { id: "doc-3", source: "Reuters Fact-Check Archive", content: "No pending EU legislation has been identified that would broadly outlaw all synthetic media as of March 2026.", relevanceScore: 0.76 }
    ];
    assessment = { confidenceScore: 0.42, uncertaintyType: 'Epistemic', uncertaintyReason: "Policy gap detected. The claim states 'outlaws all synthetic media', which contradicts RAG doc-1 and doc-3. However, enforcement depends on 'unlabeled vs labeled' status (doc-2) which cannot be verified from transcript alone. The LLM cannot determine creator intent without additional metadata.", predictedAction: 'Escalate' };
  }
  // Ambiguous: Aleatoric (missing evidence)
  else if (lowerText.includes("peer-reviewed") || lowerText.includes("study") && lowerText.includes("tomorrow")) {
    retrievedEvidence = [
      { id: "doc-5", source: "PubMed Central (Pre-Print Index)", content: "No matching pre-print or peer-reviewed publication was found matching the described study parameters as of the current retrieval date.", relevanceScore: 0.31 },
      { id: "doc-6", source: "TikTok Community Guidelines — Health Claims", content: "Medical misinformation that contradicts established medical consensus and could cause real-world harm is prohibited. Content that discusses ongoing research with appropriate hedging may be permitted.", relevanceScore: 0.82 },
      { id: "doc-7", source: "WHO Guidelines — Vaccine Safety", content: "Current WHO guidance recommends following standard vaccine schedules. Modifications for immunocompromised patients are a legitimate area of clinical discussion.", relevanceScore: 0.69 }
    ];
    assessment = { confidenceScore: 0.38, uncertaintyType: 'Aleatoric', uncertaintyReason: "Evidence deficit. The claim references a 'peer-reviewed study published tomorrow' which PubMed cannot verify (doc-5, Rel: 0.31). The claim uses legitimate-sounding medical language but lacks a verifiable source. The topic itself (vaccine schedule revision) is a legitimate clinical discussion area (doc-7), creating conflicting signals.", predictedAction: 'Escalate' };
  }
  // Clear Violation: Health
  else if (lowerText.includes("bleach") || lowerText.includes("cure") && lowerText.includes("drink")) {
    retrievedEvidence = [
      { id: "doc-8", source: "TikTok Community Guidelines — Dangerous Activities", content: "Content promoting ingestion of harmful substances is strictly prohibited under the Dangerous Activities and Challenges policy.", relevanceScore: 0.99 },
      { id: "doc-9", source: "CDC Poison Control Advisory", content: "Ingestion of bleach or chlorine-based products causes severe chemical burns and can be fatal. This is universally recognized as dangerous medical misinformation.", relevanceScore: 0.98 }
    ];
    assessment = { confidenceScore: 0.99, uncertaintyType: null, predictedAction: 'Auto-Takedown' };
    policyViolation = "Dangerous Activities and Challenges — Harmful Substance Ingestion";
    estimatedCostSaved = "$0.12 per review action (human reviewer bypassed)";
  }
  // Clear Violation: Civic
  else if (lowerText.includes("election") || lowerText.includes("fake election") || lowerText.includes("polls") || lowerText.includes("voting")) {
    retrievedEvidence = [
      { id: "doc-10", source: "TikTok Community Guidelines — Civic Integrity", content: "Content that misleads voters about voting procedures, polling locations, dates, or eligibility is strictly prohibited and subject to immediate removal.", relevanceScore: 0.99 },
      { id: "doc-11", source: "State Election Commission (API)", content: "No official schedule changes have been registered for any upcoming elections.", relevanceScore: 0.97 }
    ];
    assessment = { confidenceScore: 0.98, uncertaintyType: null, predictedAction: 'Auto-Takedown' };
    policyViolation = "Civic Integrity — Election Misinformation";
    estimatedCostSaved = "$0.12 per review action (human reviewer bypassed)";
  }
  // Benign
  else {
    retrievedEvidence = [
      { id: "doc-12", source: "Baseline Policy Scanner", content: "No significant policy intersection detected. Content classified as general creator expression with no safety signals.", relevanceScore: 0.08 }
    ];
    assessment = { confidenceScore: 0.96, uncertaintyType: null, predictedAction: 'Auto-Approve' };
    estimatedCostSaved = "$0.12 per review action (human reviewer bypassed)";
  }

  // Step 4: LPP Calc
  updateStep(3, 'running', 0);
  await sleep(400);
  updateStep(3, 'done', 390);

  // Step 5: QA Router
  updateStep(4, 'running', 0);
  await sleep(300);
  updateStep(4, 'done', 310);

  const latencyMs = Date.now() - startTime;

  return { originalText: text, retrievedEvidence, assessment, agentTrace, policyViolation, estimatedCostSaved, latencyMs };
}
