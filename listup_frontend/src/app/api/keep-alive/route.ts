import { NextResponse } from 'next/server';

export async function GET() {
  await fetch("https://api.listup.ng/health");
  return NextResponse.json({ message: "ok" });
}
