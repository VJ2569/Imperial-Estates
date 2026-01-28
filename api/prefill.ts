
/**
 * API Endpoint: POST /api/calls/prefill
 * Description: Accepts form data from n8n to prefill receptionist records.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

 const { 
  call_session_id,
  name,
  email,
  phone,
  enquiry_type,
  property_interest,
  message
} = req.body;

  if (!call_session_id) {
    return res.status(400).json({ error: 'Missing call_session_id primary key.' });
  }

  // LOGIC: Insert or Upsert into your unified database
  // status should be set to 'pending_call'
  
  const payload = {
    call_session_id,
    status: 'pending_call',
    start_timestamp: Date.now(),
    customer_name,
    customer_email,
    customer_number,
    project_interested,
    budget,
    timeline,
    message
  };

  try {
    // This is where you would perform the database write.
    // Since this is a spec, we return success with the mapped payload.
    console.log('Upserting unified record:', payload);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Record prefilled in Receptionist database.',
      data: payload 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update database.' });
  }
}
