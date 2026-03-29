import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { inviteeUri } = await req.json();

  if (!inviteeUri || typeof inviteeUri !== 'string') {
    return NextResponse.json({ email: null, name: null }, { status: 400 });
  }

  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) {
    return NextResponse.json({ email: null, name: null }, { status: 500 });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. Fetch invitee
  const response = await fetch(inviteeUri, { headers });

  if (!response.ok) {
    console.error('[Calendly Invitee] Error:', response.status, await response.text());
    return NextResponse.json({ email: null, name: null }, { status: 502 });
  }

  const data = await response.json();
  const resource = data?.resource;

  // Respuestas de las preguntas del event type (ej: teléfono)
  const questionsAndAnswers = resource?.questions_and_answers ?? [];
  const formAnswers: Record<string, string> = {};
  for (const qa of questionsAndAnswers) {
    formAnswers[qa.question] = qa.answer;
  }

  // 2. Fetch routing form submission (preguntas custom del routing)
  let routingAnswers: Record<string, string> = {};
  const routingFormSubmissionUri = resource?.routing_form_submission;
  if (routingFormSubmissionUri) {
    console.log('[Calendly Invitee] Fetching routing form submission:', routingFormSubmissionUri);
    try {
      const routingRes = await fetch(routingFormSubmissionUri, { headers });
      if (routingRes.ok) {
        const routingData = await routingRes.json();
        const questions = routingData?.resource?.questions_and_answers ?? [];
        for (const qa of questions) {
          routingAnswers[qa.question] = qa.answer;
        }
        console.log('[Calendly Invitee] Routing form answers:', routingAnswers);
      } else {
        console.error('[Calendly Invitee] Routing form error:', routingRes.status);
      }
    } catch (err) {
      console.error('[Calendly Invitee] Routing form fetch error:', err);
    }
  } else {
    console.log('[Calendly Invitee] No routing_form_submission URI found');
  }

  console.log('[Calendly Invitee] Datos completos:', {
    email: resource?.email,
    name: resource?.name,
    phone: resource?.text_reminder_number,
    formAnswers,
    routingAnswers,
  });

  return NextResponse.json({
    email: resource?.email ?? null,
    name: resource?.name ?? null,
    phone: resource?.text_reminder_number ?? null,
    formAnswers,
    routingAnswers,
  });
}
