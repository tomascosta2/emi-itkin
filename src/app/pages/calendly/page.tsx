"use client";

import {
  ALT_IMG_GENERIC,
  CALENDLY_SPAN,
  CALENDLY_TITLE_PART1,
  CALENDLY_TITLE_PART2,
  calendlyBaseUrl,
  CALL_SHEDULED,
  TESTIMONIALS,
  waNumber,
} from "@/app/utils/constantes";
import { useEffect, useMemo, useRef, useState } from "react";

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

// Crea _fbc si llega fbclid y no existe (clave para test y para que CAPI tenga fbc)
const ensureFbcFromFbclid = () => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  if (!fbclid) return;

  const existing = getCookieValue("_fbc");
  if (existing) {
    try {
      localStorage.setItem("_fbc", existing);
    } catch {}
    return;
  }

  const fbc = `fb.1.${Date.now()}.${fbclid}`;

  const isLocalhost =
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("127.0.0.1");

  // En localhost http no uses Secure/None
  const cookie = isLocalhost
    ? `_fbc=${fbc}; path=/; SameSite=Lax`
    : `_fbc=${fbc}; path=/; SameSite=None; Secure`;

  document.cookie = cookie;

  try {
    localStorage.setItem("_fbc", fbc);
  } catch {}
};

// FBQ helper (evita que falle si el pixel tarda)
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

export default function CalendlyFast() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [frameLoaded, setFrameLoaded] = useState(false);

  // refs para evitar “stale state” dentro del listener
  const emailRef = useRef("");
  const phoneRef = useRef("");

  // Cargar prefill desde localStorage + asegurar fbc si viene fbclid
  useEffect(() => {
    ensureFbcFromFbclid();

    const n = localStorage.getItem("name") || "";
    const e = localStorage.getItem("email") || "";
    const p = localStorage.getItem("phone") || "";

    setName(n);
    setEmail(e);
    setPhone(p);

    emailRef.current = e;
    phoneRef.current = p;

    // guardar cookies a localStorage (solo por consistencia/debug)
    try {
      const fbp = getCookieValue("_fbp");
      const fbc = getCookieValue("_fbc");
      if (fbp) localStorage.setItem("_fbp", fbp);
      if (fbc) localStorage.setItem("_fbc", fbc);
    } catch {}
  }, []);

  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  useEffect(() => {
    phoneRef.current = phone;
  }, [phone]);

  // Lead Pixel (dedup con CAPI) al entrar si es calificado
  useEffect(() => {
    try {
      const isQualified = localStorage.getItem("isQualified");
      if (isQualified !== "true") return;

      const pendingLeadEventId = localStorage.getItem("lead_event_id");
      const alreadyFired = localStorage.getItem("lead_fired");

      // Si ya se disparó exactamente este evento, no repetir.
      if (alreadyFired && pendingLeadEventId && alreadyFired === pendingLeadEventId) return;
      // Si no hay evento pendiente y ya hubo uno disparado antes, no crear uno nuevo acá.
      if (alreadyFired && !pendingLeadEventId) return;

      const leadEventId =
        pendingLeadEventId ||
        `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      fireFbq("Lead", leadEventId, {}, () => {
        localStorage.setItem("lead_fired", leadEventId);
        localStorage.removeItem("lead_event_id");
      });
    } catch {}
  }, []);

  // Listener de eventos de Calendly (funciona igual con iframe)
  useEffect(() => {
    const handleCalendlyEvent = (e: MessageEvent) => {
      // Calendly puede emitir desde calendly.com y subdominios
      const origin = (e.origin || "").toLowerCase();
      if (!origin.endsWith("calendly.com")) return;

      if (e.data?.event === "calendly.event_scheduled") {
        const currentEmail = emailRef.current;
        const currentPhone = phoneRef.current;

        fetch(CALL_SHEDULED, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentEmail }),
        }).catch((err) => console.error("Tracking error:", err));

        const isQualified = localStorage.getItem("isQualified");

        // ✅ fbp/fbc: fuente real = cookies + fallback localStorage
        const fbpCookie = getCookieValue("_fbp");
        const fbcCookie = getCookieValue("_fbc");
        const fbp = fbpCookie || localStorage.getItem("_fbp") || null;
        const fbc = fbcCookie || localStorage.getItem("_fbc") || null;

        if (isQualified === "true") {
          const eventId = `schedule-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

          localStorage.setItem("schedule_event_id", eventId);

          // Pixel Schedule (dedup con CAPI)
          const scheduleAlreadyFired = localStorage.getItem("schedule_fired");
          if (!scheduleAlreadyFired) {
            fireFbq("Schedule", eventId, {}, () => {
              localStorage.setItem("schedule_fired", eventId);
            });
          }

          fetch("/api/track/qualified-shedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventName: "Schedule",
              email: currentEmail,
              phone: currentPhone,
              fbp,
              fbc,
              eventId,
            }),
          }).catch((err) => console.error("Qualified schedule error:", err));
        }

        setTimeout(() => {
          window.location.href = "/pages/thankyou";
        }, 600);
      }
    };

    window.addEventListener("message", handleCalendlyEvent);
    return () => window.removeEventListener("message", handleCalendlyEvent);
  }, []);

  // Construir la URL de Calendly sin widget.js
  const calendlyUrl = useMemo(() => {
    const params = new URLSearchParams({
      hide_gdpr_banner: "1",
      embed_type: "InlineWidget",
      embed_domain: typeof window !== "undefined" ? window.location.hostname : "",
      name,
      email,
    });
    return `${calendlyBaseUrl}?${params.toString()}`;
  }, [name, email]);

  return (
    <main>
      <section className="pt-8 pb-[80px]">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-[24px] md:text-[32px] font-bold leading-[120%] max-w-[800px] mb-8 mx-auto text-center">
            <span className="text-[var(--primary)]">¡Último paso!</span> Elegí
            una fecha y hora que te queden cómodas y empezá hoy mismo!
          </h1>

          <div className="gap-8">

            <div className="bg-white w-full min-h-[600px] rounded-lg overflow-clip relative">
              {!frameLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gray-100">
                  <div className="h-10 w-3/4 mx-auto mt-6 rounded bg-gray-200" />
                  <div className="h-6 w-1/2 mx-auto mt-4 rounded bg-gray-200" />
                  <div className="h-[560px] mt-6 mx-4 rounded-lg bg-gray-200" />
                </div>
              )}

              <iframe
                key={calendlyUrl}
                title="Calendly Inline"
                src={calendlyUrl}
                loading="eager"
                width="100%"
                height="800"
                className="w-full h-[800px] border-0"
                onLoad={() => setFrameLoaded(true)}
                referrerPolicy="no-referrer-when-downgrade"
                allow="clipboard-write; geolocation; microphone; camera"
              />
            </div>

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

      {/* Social proof – sin cambios */}
      {/* <section className="py-[40px] px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {TESTIMONIALS.map((t, i) => (
              <div className="rounded-[14px] w-full md:w-[32%] bg-[var(--primary)] p-1 overflow-hidden">
                <p className="text-center py-2 bg-[var(--primary)] text-[#111] font-semibold">
                  {t.weight}
                </p>
                <img
                  className="w-full aspect-square rounded-[10px] md:h-[290px] max-h-full object-cover"
                  src={`${t.img}`}
                  alt={`${ALT_IMG_GENERIC} cambio ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </main>
  );
}
