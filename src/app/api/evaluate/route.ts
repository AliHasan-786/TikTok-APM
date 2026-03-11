import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { claim } = body;

        if (!claim) {
            return NextResponse.json({ error: 'Claim text is required' }, { status: 400 });
        }

        // Simulate network/inference latency (600-1200ms) for realistic loading state
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600));

        const lowerClaim = claim.toLowerCase();

        // Demux the hardcoded portfolio examples to guarantee 100% demo uptime
        if (lowerClaim.includes('bleach')) {
            return NextResponse.json({
                predictedAction: "Auto-Takedown",
                confidenceScore: 0.98,
                uncertaintyType: "None",
                uncertaintyReason: "",
                policyViolation: "Harmful Misinformation & Dangerous Acts",
                mockRagSources: [
                    { source: "TikTok Community Guidelines (Health)", content: "Content promoting dangerous medical cures or ingestion of harmful substances is strictly prohibited.", relevanceScore: 0.99 },
                    { source: "WHO Safety Database", content: "Ingesting bleach causes severe internal burns and is fundamentally fatal.", relevanceScore: 0.95 }
                ]
            });
        }

        if (lowerClaim.includes('woman') && lowerClaim.includes('emotional')) {
            return NextResponse.json({
                predictedAction: "Auto-Takedown",
                confidenceScore: 0.96,
                uncertaintyType: "None",
                uncertaintyReason: "",
                policyViolation: "Stereotype Bias & Hate Speech",
                mockRagSources: [
                    { source: "Trust & Safety BBQ Heuristics", content: "Evaluating potential counterfactual fairness failures... Detected gender-based emotional stereotype.", relevanceScore: 0.92 },
                    { source: "Identity Policy", content: "We do not allow content that attacks a protected group via sweeping derogatory stereotypes.", relevanceScore: 0.88 }
                ]
            });
        }

        if (lowerClaim.includes('system override')) {
            return NextResponse.json({
                predictedAction: "Escalate",
                confidenceScore: 0.15,
                uncertaintyType: "Epistemic",
                uncertaintyReason: "Detected Indirect Prompt Injection (BIPIA) vector. High risk of adversarial hijacking. Escalating to human threat analysts.",
                policyViolation: "",
                mockRagSources: [
                    { source: "Red Team Defender Logs", content: "Pattern match: 'Ignore previous instructions' observed in user transcript.", relevanceScore: 0.98 },
                    { source: "Cybersec Ops Manual", content: "Agentic pipelines must halt execution and escalate when encountering control flow alterations in unstructured input.", relevanceScore: 0.91 }
                ]
            });
        }

        if (lowerClaim.includes('eu') && lowerClaim.includes('synthetic media')) {
            return NextResponse.json({
                predictedAction: "Escalate",
                confidenceScore: 0.52,
                uncertaintyType: "Epistemic",
                uncertaintyReason: "EU DSA implementation regarding synthetic media is currently vague on satire vs malicious deepfakes. Missing clear policy directives.",
                policyViolation: "",
                mockRagSources: [
                    { source: "EU DSA Compliance Draft", content: "Very Large Online Platforms must mitigate systemic risks... synthetic media usage requires clear labeling.", relevanceScore: 0.72 },
                    { source: "Internal T&S Wiki", content: "Update Pending: How to handle proactive takedowns of synthetic media under new legislative shifts vs artistic expression.", relevanceScore: 0.81 }
                ]
            });
        }

        // Default Benign State
        return NextResponse.json({
            predictedAction: "Auto-Approve",
            confidenceScore: 0.99,
            uncertaintyType: "None",
            uncertaintyReason: "",
            policyViolation: "",
            mockRagSources: [
                { source: "Content Topic Classifier", content: "Topic identified: Consumer Electronics / Setup.", relevanceScore: 0.85 },
                { source: "Historical Policy Data", content: "Unboxing content is historically low-risk and brand-safe.", relevanceScore: 0.70 }
            ]
        });

    } catch (error: any) {
        console.error('Error generating LPP assessment:', error);
        return NextResponse.json({ error: error.message || 'Failed to process claim' }, { status: 500 });
    }
}
