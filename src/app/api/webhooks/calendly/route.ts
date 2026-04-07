import { pixelId } from '@/app/utils/constantes';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  console.log('[Calendly Webhook] Evento recibido:', body.event);
  console.log('[Calendly Webhook] Payload:', JSON.stringify(body.payload, null, 2));

  // ── invitee.created → el lead efectivamente agendó una llamada ──────────
  if (body.event === 'invitee.created') {
    const email = body.payload?.email ?? '';
    const name = body.payload?.name
      ?? `${body.payload?.first_name ?? ''} ${body.payload?.last_name ?? ''}`.trim();
    const scheduled = body.payload?.scheduled_event ?? {};
    const startTime = scheduled.start_time ?? undefined;

    // Closer = primer host del event_memberships
    const memberships = (scheduled.event_memberships ?? []) as Array<{ user_email?: string; user_name?: string }>;
    const closerEmail = memberships[0]?.user_email;
    const closerName = memberships[0]?.user_name;

    if (!email) {
      console.warn('[Calendly Webhook] invitee.created sin email — no se puede matchear el lead');
      return NextResponse.json({ ok: true, skipped: 'no_email' });
    }

    const ffaPayload = {
      name,
      email,
      agendo: 'Si',
      startTime,
      ...(closerName && { closer: closerName }),
      ...(closerEmail && { closerEmail }),
    };

    console.log('[Calendly Webhook] Marcando lead como agendado en FFA:', JSON.stringify(ffaPayload, null, 2));

    try {
      const res = await fetch(`${getBaseUrl(req)}/api/analytics/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ffaPayload),
      });
      const text = await res.text();
      console.log('[Calendly Webhook] FFA respuesta (agendo):', res.status, text);
    } catch (err) {
      console.error('[Calendly Webhook] FFA error (agendo):', err);
    }

    return NextResponse.json({ ok: true, action: 'agendo_marked' });
  }

  // ── routing_form_submission.created → el lead completó el form ──────────
  if (body.event !== 'routing_form_submission.created') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const qa = body.payload?.questions_and_answers ?? [];
  const answers: Record<string, string> = {};
  for (const item of qa) {
    answers[item.question] = item.answer;
  }

  const name = answers["Nombre"] ?? "";
  const email = answers["Correo electrónico"] ?? "";
  const phone = answers["Teléfono celular (Número de WhatsApp)"] ?? "";
  const instagram = answers["¿Cuál es tu usuario de Instagram? Ejemplo @emilianoitkin"] ?? "";
  const edad = answers["Edad"] ?? "";
  const ocupacion = answers["Trabajo/Profesión"] ?? "";

  // Compromiso
  const compromisoKey = "¿Cómo describirías tu disposición actual para empezar este proceso de transformación?";
  const compromisoRaw = answers[compromisoKey] ?? "";
  let compromiso = compromisoRaw;
  if (compromisoRaw.includes("decidido")) compromiso = "Alto";
  else if (compromisoRaw.includes("arrancar pronto") || compromisoRaw.includes("dudas")) compromiso = "Medio";
  else if (compromisoRaw.includes("No es una prioridad")) compromiso = "Bajo";

  // Presupuesto (dos versiones del form)
  const presupuestoKey1 = "Este programa incluye el acompañamiento de un equipo integral de 5 profesionales. Para mantener la calidad, trabajamos con cupos limitados y una inversión acorde. ¿En qué situación te encontrás hoy para afrontar este proceso de 3 meses?";
  const presupuestoKey2 = "Este programa incluye el acompañamiento de un equipo integral de 5 profesionales. Para mantener la calidad y los resultados, trabajamos con cupos limitados y una inversión acorde. ¿Cuál de estas opciones describe mejor tu situación para invertir hoy?";
  const presupuestoRaw = answers[presupuestoKey1] ?? answers[presupuestoKey2] ?? "";
  let presupuesto = presupuestoRaw;
  if (presupuestoRaw.includes("Dispongo") || presupuestoRaw.includes("Cuento con la capacidad")) presupuesto = "Alto";
  else if (presupuestoRaw.includes("prioridad") || presupuestoRaw.includes("esfuerzo")) presupuesto = "Medio";
  else if (presupuestoRaw.includes("No estoy")) presupuesto = "Bajo";

  // Enviar Lead CAPI a Meta con email/phone/nombre
  if (email && phone) {
    const leadEventId = `lead-routing-${Date.now()}`;
    const [hashEmail, hashPhone, hashName] = await Promise.all([
      hashSHA256(email),
      hashSHA256(phone),
      hashSHA256(name.split(' ')[0].toLowerCase()),
    ]);
    fetch(
      `https://graph.facebook.com/v22.0/${pixelId}/events?access_token=${process.env.API_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{
            event_id: leadEventId,
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            user_data: {
              em: [hashEmail],
              ph: [hashPhone],
              fn: [hashName],
            },
          }],
        }),
      }
    ).catch((err) => console.error('[Calendly Webhook] Lead CAPI error:', err));
  }

  // Enviar a FFA (lead sin agendo — todavía no agendó)
  const ffaPayload = {
    name,
    email,
    phone,
    variant: "C",
    edad,
    ocupacion,
    compromiso,
    presupuesto,
    instagram,
  };

  console.log('[Calendly Webhook] Enviando lead a FFA:', JSON.stringify(ffaPayload, null, 2));

  try {
    const res = await fetch(`${getBaseUrl(req)}/api/analytics/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ffaPayload),
    });
    const text = await res.text();
    console.log('[Calendly Webhook] FFA respuesta:', res.status, text);
  } catch (err) {
    console.error('[Calendly Webhook] FFA error:', err);
  }

  return NextResponse.json({ ok: true });
}

async function hashSHA256(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getBaseUrl(req: Request): string {
  const host = req.headers.get('host') ?? 'localhost:3000';
  const proto = host.includes('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}
