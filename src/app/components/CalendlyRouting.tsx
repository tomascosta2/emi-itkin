"use client";

import { CALL_SHEDULED, waNumber } from "@/app/utils/constantes";
import { useEffect, useState } from "react";

// ---- Cookies helpers (para fbp/fbc)
const getCookieValue = (cookieName: string) => {
  if (typeof document === "undefined") return "";
  const name = cookieName + "=";
  const decodedCookie = decodeURIComponent(document.cookie || "");
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return "";
};

const ensureFbcFromFbclid = () => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  if (!fbclid) return;
  const existing = getCookieValue("_fbc");
  if (existing) {
    try { localStorage.setItem("_fbc", existing); } catch {}
    return;
  }
  const fbc = `fb.1.${Date.now()}.${fbclid}`;
  const isLocalhost =
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("127.0.0.1");
  const cookie = isLocalhost
    ? `_fbc=${fbc}; path=/; SameSite=Lax`
    : `_fbc=${fbc}; path=/; SameSite=None; Secure`;
  document.cookie = cookie;
  try { localStorage.setItem("_fbc", fbc); } catch {}
};

const fireFbq = (
  eventName: string,
  eventId: string,
  payload: Record<string, unknown> = {},
  onSuccess?: () => void
) => {
  let attempts = 0;
  const tryFire = () => {
    attempts += 1;
    const fbq = (window as any)?.fbq;
    if (typeof fbq === "function") {
      try {
        fbq("track", eventName, payload, { eventID: eventId });
        onSuccess?.();
      } catch {}
      return;
    }
    if (attempts < 10) setTimeout(tryFire, 200);
  };
  tryFire();
};

const CALENDLY_ROUTING_URL = "https://calendly.com/d/ct4w-qdx-fbb?primary_color=7ab200&background_color=ffffff&text_color=000000";

export default function CalendlyRouting() {
  const [frameLoaded, setFrameLoaded] = useState(false);

  // Cargar widget.js de Calendly para recibir postMessages
  useEffect(() => {
    if (document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.head.appendChild(script);
    console.log("[CalendlyRouting] widget.js cargado");
  }, []);

  useEffect(() => {
    ensureFbcFromFbclid();
    try {
      const fbp = getCookieValue("_fbp");
      const fbc = getCookieValue("_fbc");
      if (fbp) localStorage.setItem("_fbp", fbp);
      if (fbc) localStorage.setItem("_fbc", fbc);
    } catch {}
  }, []);

  // Listener de eventos de Calendly
  useEffect(() => {
    console.log("[CalendlyRouting] 🟢 Listener montado, escuchando postMessages...");

    const handleCalendlyEvent = (e: MessageEvent) => {
      // Log ALL messages para debug
      if (e.data?.event) {
        console.log("[CalendlyRouting] postMessage:", { origin: e.origin, event: e.data.event, payload: e.data.payload });
      }

      const origin = (e.origin || "").toLowerCase();
      if (!origin.endsWith("calendly.com")) return;

      // ─── PASO 1: Form completado → el usuario eligió fecha (form ya llenado) ───
      if (e.data?.event === "calendly.date_and_time_selected") {
        console.log("[CalendlyRouting] 📋 Form completado + fecha seleccionada");

        // Disparar Lead pixel
        const fbpCookie = getCookieValue("_fbp");
        const fbcCookie = getCookieValue("_fbc");
        const fbp = fbpCookie || localStorage.getItem("_fbp") || null;
        const fbc = fbcCookie || localStorage.getItem("_fbc") || null;

        const leadAlreadyFired = localStorage.getItem("lead_fired_routing");
        console.log("[CalendlyRouting] Lead already fired?", leadAlreadyFired);
        if (!leadAlreadyFired) {
          const leadEventId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          console.log("[CalendlyRouting] Disparando Lead pixel, eventId:", leadEventId);
          fireFbq("Lead", leadEventId, {}, () => {
            localStorage.setItem("lead_fired_routing", leadEventId);
            console.log("[CalendlyRouting] Lead pixel OK");
          });

          console.log("[CalendlyRouting] Enviando Lead CAPI...");
          fetch("/api/track/lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventName: "Lead", fbp, fbc, eventId: leadEventId }),
          })
            .then((res) => console.log("[CalendlyRouting] Lead CAPI respuesta:", res.status))
            .catch((err) => console.error("[CalendlyRouting] Lead CAPI error:", err));
        }
      }

      // ─── PASO 2: Evento confirmado → fetch datos completos y enviar a FFA + N8N ───
      if (e.data?.event === "calendly.event_scheduled") {
        console.log("[CalendlyRouting] ✅ Evento confirmado (scheduled)");
        console.log("[CalendlyRouting] Payload:", JSON.stringify(e.data.payload, null, 2));

        const eventUri = e.data.payload?.event?.uri ?? null;
        const inviteeUri = e.data.payload?.invitee?.uri ?? null;
        console.log("[CalendlyRouting] eventUri:", eventUri);
        console.log("[CalendlyRouting] inviteeUri:", inviteeUri);

        (async () => {
          let closer: string | null = null;
          let closerEmail: string | null = null;
          let startTime: string | null = null;
          let inviteeEmail: string | null = null;
          let inviteeName: string | null = null;
          let inviteePhone: string | null = null;
          let formAnswers: Record<string, string> = {};
          let routingAnswers: Record<string, string> = {};

          // Fetch closer
          if (eventUri) {
            console.log("[CalendlyRouting] Fetching closer...");
            try {
              const res = await fetch("/api/calendly/closer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventUri }),
              });
              const json = await res.json();
              closer = json.closer ?? null;
              closerEmail = json.closerEmail ?? null;
              startTime = json.startTime ?? null;
              console.log("[CalendlyRouting] Closer:", { closer, closerEmail, startTime });
            } catch (err) {
              console.error("[CalendlyRouting] Error closer:", err);
            }
          }

          // Fetch invitee + form answers
          if (inviteeUri) {
            console.log("[CalendlyRouting] Fetching invitee + form answers...");
            try {
              const res = await fetch("/api/calendly/invitee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteeUri }),
              });
              const json = await res.json();
              inviteeEmail = json.email ?? null;
              inviteeName = json.name ?? null;
              inviteePhone = json.phone ?? null;
              formAnswers = json.formAnswers ?? {};
              routingAnswers = json.routingAnswers ?? {};
              console.log("[CalendlyRouting] Invitee:", { inviteeEmail, inviteeName, inviteePhone });
              console.log("[CalendlyRouting] Form answers (event type):", formAnswers);
              console.log("[CalendlyRouting] Routing form answers:", routingAnswers);
            } catch (err) {
              console.error("[CalendlyRouting] Error invitee:", err);
            }
          }

          // Enviar a N8N
          const n8nPayload = {
            email: inviteeEmail,
            name: inviteeName,
            phone: inviteePhone,
            closer,
            closerEmail,
            calendlyEventUri: eventUri,
            startTime,
            formAnswers,
            routingAnswers,
            source: "clase-calendario",
            variant: "C",
          };
          console.log("[CalendlyRouting] Enviando a N8N:", JSON.stringify(n8nPayload, null, 2));
          fetch(CALL_SHEDULED, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(n8nPayload),
          })
            .then((res) => console.log("[CalendlyRouting] N8N respuesta:", res.status))
            .catch((err) => console.error("[CalendlyRouting] N8N error:", err));

          // Enviar a FFA con datos completos del form + agendo
          const allAnswers = { ...formAnswers, ...routingAnswers };
          const phone = allAnswers["Teléfono celular (Número de WhatsApp)"] ?? inviteePhone ?? "";
          // Mapear presupuesto a categoría corta (hay dos versiones del routing form)
          const presupuestoKey1 = "Este programa incluye el acompañamiento de un equipo integral de 5 profesionales. Para mantener la calidad, trabajamos con cupos limitados y una inversión acorde. ¿En qué situación te encontrás hoy para afrontar este proceso de 3 meses?";
          const presupuestoKey2 = "Este programa incluye el acompañamiento de un equipo integral de 5 profesionales. Para mantener la calidad y los resultados, trabajamos con cupos limitados y una inversión acorde. ¿Cuál de estas opciones describe mejor tu situación para invertir hoy?";
          const presupuestoRaw = allAnswers[presupuestoKey1] ?? allAnswers[presupuestoKey2] ?? "";
          let presupuesto = presupuestoRaw;
          if (presupuestoRaw.includes("Dispongo") || presupuestoRaw.includes("Cuento con la capacidad")) presupuesto = "Alto";
          else if (presupuestoRaw.includes("prioridad") || presupuestoRaw.includes("esfuerzo")) presupuesto = "Medio";
          else if (presupuestoRaw.includes("No estoy")) presupuesto = "Bajo";

          // Mapear compromiso a categoría corta
          const compromisoRaw = allAnswers["¿Cómo describirías tu disposición actual para empezar este proceso de transformación?"] ?? "";
          let compromiso = compromisoRaw;
          if (compromisoRaw.includes("decidido")) compromiso = "Alto";
          else if (compromisoRaw.includes("arrancar pronto") || compromisoRaw.includes("dudas")) compromiso = "Medio";
          else if (compromisoRaw.includes("No es una prioridad")) compromiso = "Bajo";

          const ffaPayload = {
            name: inviteeName,
            email: inviteeEmail,
            phone,
            variant: "C",
            agendo: "Si",
            closer,
            closerEmail,
            startTime,
            edad: allAnswers["Edad"] ?? "",
            ocupacion: allAnswers["Trabajo/Profesión"] ?? "",
            presupuesto,
            compromiso,
            instagram: allAnswers["¿Cuál es tu usuario de Instagram? Ejemplo @emilianoitkin"] ?? "",
          };
          console.log("[CalendlyRouting] Enviando a FFA:", JSON.stringify(ffaPayload, null, 2));
          fetch("/api/analytics/lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ffaPayload),
          })
            .then(async (res) => {
              const text = await res.text();
              console.log("[CalendlyRouting] FFA respuesta:", res.status, text);
            })
            .catch((err) => console.error("[CalendlyRouting] FFA error:", err));
        })();

        // Schedule pixel
        const fbpCookie = getCookieValue("_fbp");
        const fbcCookie = getCookieValue("_fbc");
        const fbp = fbpCookie || localStorage.getItem("_fbp") || null;
        const fbc = fbcCookie || localStorage.getItem("_fbc") || null;

        const scheduleAlreadyFired = localStorage.getItem("schedule_fired_routing");
        console.log("[CalendlyRouting] Schedule already fired?", scheduleAlreadyFired);
        if (!scheduleAlreadyFired) {
          const scheduleEventId = `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          console.log("[CalendlyRouting] Disparando Schedule pixel, eventId:", scheduleEventId);
          fireFbq("Schedule", scheduleEventId, {}, () => {
            localStorage.setItem("schedule_fired_routing", scheduleEventId);
            console.log("[CalendlyRouting] Schedule pixel OK");
          });

          console.log("[CalendlyRouting] Enviando Schedule CAPI...");
          fetch("/api/track/qualified-shedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventName: "Schedule", fbp, fbc, eventId: scheduleEventId }),
          })
            .then((res) => console.log("[CalendlyRouting] Schedule CAPI respuesta:", res.status))
            .catch((err) => console.error("[CalendlyRouting] Schedule CAPI error:", err));
        }

        console.log("[CalendlyRouting] Redirigiendo a /pages/thankyou en 2000ms...");
        setTimeout(() => {
          window.location.href = "/pages/thankyou";
        }, 2000);
      }
    };

    window.addEventListener("message", handleCalendlyEvent);
    return () => window.removeEventListener("message", handleCalendlyEvent);
  }, []);

  const calendlyUrl = `${CALENDLY_ROUTING_URL}&hide_gdpr_banner=1&hide_landing_page_details=1`;

  return (
    <section id="calendly" className="pt-2 pb-[80px]">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-[24px] md:text-[32px] font-bold leading-[120%] max-w-[800px] mb-8 mx-auto text-center">
          <span className="text-[var(--primary)]">Agendá tu sesión</span> y empezá
          hoy mismo tu transformación
        </h2>

        <div>
          <div
            className="calendly-inline-widget w-full rounded-[16px] overflow-clip"
            data-url={calendlyUrl}
            style={{ minWidth: "320px", height: "1000px" }}
          />

          <p className="text-center text-sm text-gray-600 mt-4">
            En caso de no encontrar horarios disponibles escribime por WhatsApp al{" "}
            <a
              className="underline text-blue-500"
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
            >
              +{waNumber}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
