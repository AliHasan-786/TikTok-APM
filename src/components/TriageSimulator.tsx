"use client";

import { useState } from "react";
import { processClaim, ModerationResult } from "@/lib/simulator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Server, Search, ArrowRight } from "lucide-react";
import { HumanModeratorDashboard } from "./HumanModeratorDashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DUMMY_CLAIMS = [
    "New legislation outlaws all synthetic media in the EU starting tomorrow. Share so people know!",
    "To cure the new variant, you must drink a cup of hot bleach immediately.",
    "Check out my new unboxing video of these amazing mechanical keyboards! #foryou",
];

export function TriageSimulator() {
    const [claim, setClaim] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<number>(0);
    const [result, setResult] = useState<ModerationResult | null>(null);

    const handleTestClaim = (text: string) => {
        setClaim(text);
    };

    const runSimulation = async () => {
        if (!claim) return;
        setIsProcessing(true);
        setResult(null);
        setStep(1); // Ingesting

        // Simulate pipeline visually
        setTimeout(() => setStep(2), 600); // Retrieving RAG
        setTimeout(() => setStep(3), 1500); // LPP Assessment

        const res = await processClaim(claim);

        setStep(4); // Routing Decision
        setTimeout(() => {
            setResult(res);
            setIsProcessing(false);
        }, 800);
    };

    const getStepStatus = (currentStep: number) => {
        if (step > currentStep) return "bg-tiktok-cyan/20 text-tiktok-cyan border-tiktok-cyan animate-pulse-fast";
        if (step === currentStep) return "bg-tiktok-cyan text-black font-semibold shadow-[0_0_15px_rgba(37,244,238,0.5)]";
        return "bg-black text-muted-foreground border-muted-foreground/30";
    };

    if (result && result.assessment.predictedAction === "Escalate") {
        return <HumanModeratorDashboard data={result} onReset={() => setResult(null)} />;
    }

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8">
            <div className="text-center space-y-4 pt-12 pb-8">
                <div className="inline-flex items-center justify-center p-3 bg-zinc-900 rounded-2xl mb-4 border border-white/10 shadow-xl">
                    <ShieldAlert className="w-8 h-8 text-tiktok-red mr-2" />
                    <h1 className="text-4xl font-extrabold tracking-tight">TrustScore-RAG</h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Agentic Escalation Engine prototype. Mitigating automation bias via cost-aware selective classification.
                </p>
            </div>

            <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <Sparkles className="w-5 h-5 mr-2 text-tiktok-cyan" />
                        Input Pipeline
                    </CardTitle>
                    <CardDescription>
                        Submit a video transcript or claim. The multi-agent pipeline will assess for policy violations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {DUMMY_CLAIMS.map((text, idx) => (
                            <Badge
                                key={idx}
                                variant="outline"
                                className="cursor-pointer hover:bg-white/10 transition-colors"
                                onClick={() => handleTestClaim(text)}
                            >
                                Test Case {idx + 1}
                            </Badge>
                        ))}
                    </div>

                    <textarea
                        value={claim}
                        onChange={(e) => setClaim(e.target.value)}
                        placeholder="Paste transcript or caption here..."
                        className="w-full min-h-[120px] p-4 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-tiktok-cyan/50 resize-none font-mono text-sm leading-relaxed"
                    />

                    <Button
                        onClick={runSimulation}
                        disabled={isProcessing || !claim}
                        className="w-full bg-white text-black hover:bg-gray-200 h-12 text-lg font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    >
                        {isProcessing ? "Processing via Agentic Pipeline..." : "Run Triage Engine"}
                    </Button>

                    {isProcessing && (
                        <div className="pt-8">
                            <div className="flex items-center justify-between mb-4 relative before:absolute before:inset-0 before:top-1/2 before:h-[2px] before:-translate-y-1/2 before:bg-white/10 before:-z-10">
                                <div className={`px-4 py-2 rounded-full border text-sm transition-all duration-500 z-10 ${getStepStatus(1)}`}>
                                    1. Ingest
                                </div>
                                <div className={`px-4 py-2 rounded-full border text-sm transition-all duration-500 z-10 ${getStepStatus(2)}`}>
                                    2. RAG Retrieval
                                </div>
                                <div className={`px-4 py-2 rounded-full border text-sm transition-all duration-500 z-10 ${getStepStatus(3)}`}>
                                    3. LPP Assesment
                                </div>
                                <div className={`px-4 py-2 rounded-full border text-sm transition-all duration-500 z-10 ${getStepStatus(4)}`}>
                                    4. Routing
                                </div>
                            </div>
                            <Progress value={step * 25} className="h-1 bg-zinc-800" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {result && result.assessment.predictedAction !== "Escalate" && (
                <Card className="border-white/10 bg-zinc-900/50 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className={`h-1 w-full ${result.assessment.predictedAction === 'Auto-Takedown' ? 'bg-tiktok-red' : 'bg-tiktok-cyan'}`} />
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            {result.assessment.predictedAction === 'Auto-Takedown' ? (
                                <><AlertCircle className="w-5 h-5 mr-2 text-tiktok-red" /> Auto-Takedown Initiated</>
                            ) : (
                                <><CheckCircle2 className="w-5 h-5 mr-2 text-tiktok-cyan" /> Auto-Approve Executed</>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-black/50 p-4 rounded-lg border border-white/5">
                                <div className="text-sm text-zinc-400 mb-1">Confidence Interval</div>
                                <div className="text-3xl font-bold flex items-baseline">
                                    {(result.assessment.confidenceScore * 100).toFixed(1)}%
                                </div>
                            </div>
                            <div className="bg-black/50 p-4 rounded-lg border border-white/5 md:col-span-2">
                                <div className="text-sm text-zinc-400 mb-1">System Action</div>
                                <div className="text-white font-medium break-words">
                                    Routed via <i>Cost-Aware Selective Classification</i>.
                                    LPP Confidence exceeds threshold (90%). No human intervention required.
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">RAG Evidence Retrieved</h3>
                            {result.retrievedEvidence.map((doc, i) => (
                                <Alert key={i} className="bg-black/40 border-white/10">
                                    <Server className="h-4 w-4 text-zinc-400" />
                                    <AlertTitle className="text-tiktok-cyan font-mono text-xs">{doc.source} (Rel: {doc.relevanceScore.toFixed(2)})</AlertTitle>
                                    <AlertDescription className="text-zinc-300 mt-2 text-sm">{doc.content}</AlertDescription>
                                </Alert>
                            ))}
                        </div>

                        <Button variant="outline" onClick={() => setResult(null)} className="w-full border-white/20">
                            Reset Simulator
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
