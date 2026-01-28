export async function POST(req: Request) {
  const body = await req.json();

  const {
    call_session_id,
    name,
    email,
    phone,
    enquiry_type,
    property_interest,
    message
  } = body;

  if (!call_session_id) {
    return new Response(
      JSON.stringify({ error: "Missing call_session_id" }),
      { status: 400 }
    );
  }

  const payload = {
    call_session_id,
    status: "pending_call",
    created_at: Date.now(),
    name,
    email,
    phone,
    enquiry_type,
    property_interest,
    message
  };

  console.log("Prefill received:", payload);

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200 }
  );
}
