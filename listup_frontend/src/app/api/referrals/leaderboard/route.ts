import { NextResponse } from 'next/server';

// Prevent Next.js from statically pre-rendering this no-store proxy route.
export const dynamic = 'force-dynamic';

export async function GET() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    
    // Move dynamic fetch outside of try/catch so Next.js can handle dynamic bailout errors during build
    const res = await fetch(`${backendUrl}/api/referrals/leaderboard`, {
        cache: 'no-store'
    });

    try {
        if (!res.ok) {
            return NextResponse.json({ success: false }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
