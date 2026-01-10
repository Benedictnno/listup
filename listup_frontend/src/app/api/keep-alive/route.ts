export async function GET() {
  await fetch("https://api.listup.ng/health");
  return new Response("ok", { status: 200 });
}
