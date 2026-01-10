import { NextResponse } from 'next/server';

export async function GET() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.listup.ng";

    try {
        await fetch(`${apiUrl}/health`, {
            signal: AbortSignal.timeout(5000) // 5s timeout to avoid hanging
        });
    } catch (error) {
        // Log error but don't crash the route
        console.warn(`Keep-alive ping failed for ${apiUrl}:`, error instanceof Error ? error.message : error);
    }

    return NextResponse.json({ message: "ok" });
}
