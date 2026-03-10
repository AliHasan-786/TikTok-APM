export interface RAGDocument {
  id: string;
  source: string;
  content: string;
  relevanceScore: number;
}

export interface LPPAssessment {
  confidenceScore: number;
  uncertaintyType?: 'Aleatoric' | 'Epistemic' | null;
  uncertaintyReason?: string;
  predictedAction: 'Auto-Takedown' | 'Auto-Approve' | 'Escalate';
}

export interface ModerationResult {
  originalText: string;
  retrievedEvidence: RAGDocument[];
  assessment: LPPAssessment;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function processClaim(text: string): Promise<ModerationResult> {
  // Simulate network/Agentic latency (Time to First Token & Inter-Token Latency)
  await sleep(1500);

  let retrievedEvidence: RAGDocument[] = [];
  let assessment: LPPAssessment;

  const lowerText = text.toLowerCase();

  // Edge Case 1: Ambiguous Misinformation (Epistemic/Aleatoric Uncertainty)
  if (lowerText.includes("synthetic media") || lowerText.includes("eu") || lowerText.includes("tomorrow")) {
    retrievedEvidence = [
      {
        id: "doc-1",
        source: "EU Digital Services Act (DSA) 2026 Summary",
        content: "The DSA mandates explicit labeling of synthetic media (AIGC). It does not explicitly outlaw the creation of synthetic media across the EU, provided it does not constitute illegal content or non-consensual deepfakes.",
        relevanceScore: 0.94
      },
      {
        id: "doc-2",
        source: "TikTok Community Guidelines - Synthetic Media",
        content: "Unlabeled AI-generated media that accurately depicts realistic scenes or individuals is prohibited. Satire is permitted if clearly marked.",
        relevanceScore: 0.88
      }
    ];

    assessment = {
      confidenceScore: 0.42,
      uncertaintyType: 'Epistemic',
      uncertaintyReason: "Policy ambiguity. The claim states 'outlaws all synthetic media', which contradicts retrieval doc-1. Furthermore, enforcement relies on unlabeled vs labeled states which cannot be definitively verified from text alone.",
      predictedAction: 'Escalate'
    };
  } 
  // Clear Violation (Auto-Takedown)
  else if (lowerText.includes("violence") || lowerText.includes("harm") || lowerText.includes("fake election")) {
    retrievedEvidence = [
      {
        id: "doc-3",
        source: "TikTok Community Guidelines - Civic Integrity",
        content: "Content that misleads voters or fundamentally interferes with democratic elections is strictly prohibited.",
        relevanceScore: 0.99
      }
    ];
    assessment = {
      confidenceScore: 0.98,
      uncertaintyType: null,
      predictedAction: 'Auto-Takedown'
    };
  }
  // Clear Benign (Auto-Approve)
  else {
    retrievedEvidence = [
      {
        id: "doc-4",
        source: "General Baseline Knowledge",
        content: "No significant policy intersection detected. General conversational intent or benign statement.",
        relevanceScore: 0.12
      }
    ];
    assessment = {
      confidenceScore: 0.95,
      uncertaintyType: null,
      predictedAction: 'Auto-Approve'
    };
  }

  // Simulate QA Assessor Agent time
  await sleep(800);

  return {
    originalText: text,
    retrievedEvidence,
    assessment
  };
}
