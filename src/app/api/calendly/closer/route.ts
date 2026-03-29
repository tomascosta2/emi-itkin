import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { eventUri } = await req.json();

  if (!eventUri || typeof eventUri !== 'string') {
    return NextResponse.json({ closer: null }, { status: 400 });
  }

  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) {
    return NextResponse.json({ closer: null }, { status: 500 });
  }

  // Extraemos el UUID de la URI: https://api.calendly.com/scheduled_events/{uuid}
  const uuid = eventUri.split('/').pop();

  const response = await fetch(`https://api.calendly.com/scheduled_events/${uuid}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return NextResponse.json({ closer: null }, { status: 502 });
  }

  const data = await response.json();
  const membership = data?.resource?.event_memberships?.[0];

  return NextResponse.json({
    closer: membership?.user_name ?? null,
    closerEmail: membership?.user_email ?? null,
    startTime: data?.resource?.start_time ?? null,
  });
}
