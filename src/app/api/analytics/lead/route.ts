import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  const payload = {
    clientId: 2,
    clientName: 'Emiliano Itkin',
    lead: {
      nombre: body.name,
      correo: body.email,
      telefono: body.phone,
      campana: body.ad ?? '',
      splitTest: body.variant ?? '',
      ...(body.agendo !== undefined && { agendo: body.agendo }),
      ...(body.closer !== undefined && { closer: body.closer }),
      ...(body.closerEmail !== undefined && { closerEmail: body.closerEmail }),
      ...(body.startTime !== undefined && { startTime: body.startTime }),
      ...(body.timeonpage !== undefined && { startTime: `${body.timeonpage}s` }),
      ...(body.edad !== undefined && { edad: body.edad }),
      ...(body.ocupacion !== undefined && { ocupacion: body.ocupacion }),
      ...(body.objetivo !== undefined && { objetivo: body.objetivo }),
      ...(body.compromiso != null && { compromiso: body.compromiso }),
      ...((body.compromiso == null && body.compromiso90 != null) && { compromiso: body.compromiso90 }),
      ...(body.urgencia !== undefined && { urgencia: body.urgencia }),
      ...(body.freno !== undefined && { freno: body.freno }),
      ...(body.intentos !== undefined && { intentos: body.intentos }),
      ...(body.presupuesto !== undefined && { presupuesto: body.presupuesto }),
      ...(body.instagram !== undefined && { instagram: body.instagram }),
      ...(body.fbc != null && { fbc: body.fbc }),
      ...(body.fbp != null && { fbp: body.fbp }),
    },
  };
  console.log('[FFA] Enviando payload:', JSON.stringify(payload, null, 2));

  const response = await fetch('https://fit-funnels-analytics.vercel.app/api/webhook/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.FFA_API_KEY ?? '',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  console.log('[FFA] Respuesta:', response.status, text);

  if (!response.ok) {
    console.error('[FFA] Error al enviar lead:', response.status, text);
    return NextResponse.json({ success: false, status: response.status, body: text }, { status: 502 });
  }

  return NextResponse.json({ success: true, body: text });
}
