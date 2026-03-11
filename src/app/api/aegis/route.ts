import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { rules, comment } = await request.json();

        if (!rules || !comment) {
            return NextResponse.json({ error: 'Rules and comment are required' }, { status: 400 });
        }

        // Simulate network/inference latency (400-800ms)
        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));

        const lowerComment = comment.toLowerCase();

        // Simulated Edge Model Logic
        if (lowerComment.includes('fat') || lowerComment.includes('bakery') || lowerComment.includes('whale') || lowerComment.includes('ugly')) {
            return NextResponse.json({
                action: 'Block',
                matchedRule: 'Rule 1: Body Shaming',
                reasoning: 'The model identified semantic cruelty regarding body shape/weight, bypassing exact keyword filters.'
            });
        }

        if (lowerComment.includes('alex') || lowerComment.includes('ex')) {
            return NextResponse.json({
                action: 'Block',
                matchedRule: 'Rule 2: Ex-Boyfriend',
                reasoning: 'Explicit mention or semantic mapping to the restricted individual.'
            });
        }

        if (lowerComment.includes('soundcloud') || lowerComment.includes('slide to my profile') || lowerComment.includes('check out my')) {
            return NextResponse.json({
                action: 'Block',
                matchedRule: 'Rule 3: Self-Promo Spam',
                reasoning: 'Identified as low-effort self-promotional spam attempting to divert traffic.'
            });
        }

        return NextResponse.json({
            action: 'Allow',
            matchedRule: 'None',
            reasoning: 'No policy violations or personal boundary breaches detected.'
        });

    } catch (error: any) {
        console.error('Error in Creator Aegis:', error);
        return NextResponse.json({ error: error.message || 'Failed to process comment' }, { status: 500 });
    }
}
