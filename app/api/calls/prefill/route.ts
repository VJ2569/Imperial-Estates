
export async function POST(req: Request) {
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200 }
  );
}
