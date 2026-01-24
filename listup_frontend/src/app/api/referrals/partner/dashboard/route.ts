import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        const cookieStore = cookies();
        const cookieHeader = cookieStore.toString();
        const accessToken = cookieStore.get('accessToken')?.value;

        console.log('Proxying Partner Dashboard Request');
        console.log('Cookies present:', cookieStore.getAll().map(c => c.name));
        console.log('Token found:', !!accessToken);

        const headers: Record<string, string> = {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const res = await fetch(`${backendUrl}/api/referrals/partner/dashboard`, {
            headers,
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error('Backend returned error:', res.status, res.statusText);
            const errorText = await res.text();
            console.error('Backend error body:', errorText);
            return NextResponse.json({ success: false, message: 'Failed to fetch data' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Partner Dashboard Proxy Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
