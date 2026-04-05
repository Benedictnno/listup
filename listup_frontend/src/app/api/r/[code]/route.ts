import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    const code = params.code;
    const backendUrl = process.env.API_BASE_URL || "http://localhost:4000/api";
    
    // Redirect to the backend tracking endpoint server-side
    // This keeps the backend URL out of the client JS bundle (if using non-NEXT_PUBLIC env vars)
    return NextResponse.redirect(`${backendUrl}/referrals/r/${code}`);
}
