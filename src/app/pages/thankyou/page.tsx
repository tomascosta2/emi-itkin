"use client";

import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { descriptionCalender, titleCalender, waNumber, locationCalender, idVsl, idThankyou, srcThankyou, coachName, TESTIMONIALS_THANKYOU_IMG, ALT_IMG_GENERIC, MORE_CHANGES_IMG, TESTIMONIALS, TESTIMONIALS_VIDEO_PAGE } from "@/app/utils/constantes";

export default function ThankYou() {
  // Opcional: recuperar datos del paso anterior
  const [name, setName] = useState<string>("");
  const [startAt, setStartAt] = useState<string>(""); // ISO e.g. "2025-11-02T14:00:00-03:00"
  const [agreeQuietPlace, setAgreeQuietPlace] = useState(false);
  const [agreeOnTime, setAgreeOnTime] = useState(false);
  const [agreeNoReschedule, setAgreeNoReschedule] = useState(false);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const n = q.get("name") || localStorage.getItem("name") || "";
      const s =
        q.get("startAt") ||
        localStorage.getItem("meeting_startAt") ||
        ""; // ISO date string
      setName(n ?? "");
      setStartAt(s ?? "");
    } catch { }
  }, []);

  useEffect(() => {
    try {
      // @ts-ignore
      window.fbq?.("track", "Schedule");
    } catch { }
  }, []);

  // Countdown
  const countdown = useMemo(() => {
    if (!startAt) return null;
    const target = new Date(startAt).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return "¡Es ahora!";
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    return `${d}d ${h}h ${m}m`;
  }, [startAt]);


  const gcalHref = useMemo(() => {
    if (!startAt) return "#";
    const start = new Date(startAt);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30min
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
    const qs = new URLSearchParams({
      action: "TEMPLATE",
      text: titleCalender,
      details: descriptionCalender,
      locationCalender,
      dates: `${fmt(start)}/${fmt(end)}`
    });
    return `https://www.google.com/calendar/render?${qs.toString()}`;
  }, [startAt]);

  const outlookHref = useMemo(() => {
    if (!startAt) return "#";
    const start = new Date(startAt);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const qs = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      startdt: start.toISOString(),
      enddt: end.toISOString(),
      subject: titleCalender,
      body: descriptionCalender,
      locationCalender
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${qs.toString()}`;
  }, [startAt]);

  const appleIcsData = useMemo(() => {
    if (!startAt) return "#";
    const start = new Date(startAt);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Nano//Attendance//ES",
      "BEGIN:VEVENT",
      `UID:${crypto.randomUUID()}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d{3}/g, "")}`,
      `DTSTART:${start.toISOString().replace(/[-:]|\.\d{3}/g, "")}`,
      `DTEND:${end.toISOString().replace(/[-:]|\.\d{3}/g, "")}`,
      `SUMMARY:${titleCalender}`,
      `DESCRIPTION:${descriptionCalender.replace(/\n/g, "\\n")}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }, [startAt]);

  // WhatsApp confirm

  const confirmMsg = encodeURIComponent(
    `Hola Emi ${name ? `, soy ${name}` : ""}. Confirmo mi asistencia a la reunión ${startAt ? `del ${new Date(startAt).toLocaleString()}` : ""}.`
  );
  const waConfirmHref = `https://wa.me/${waNumber}?text=${confirmMsg}`;

  // Pixel (opcional): enviar evento custom al hacer click en Confirmar
  const trackConfirm = () => {
    try {
      // @ts-ignore
      window.fbq?.("trackCustom", "ConfirmedAttendance", {
        startAt,
        name
      });
    } catch { }
  };

  const confirmEnabled = agreeQuietPlace && agreeOnTime && agreeNoReschedule;

  return (
    <div className="relative overflow-clip pt-8">
      <img
        src="/images/Sombra.webp"
        alt="Sombra"
        className="w-[700px] absolute right-0 top-0 -z-50 hidden md:block"
      />
      <img
        src="/images/Sombra.webp"
        alt="Sombra"
        className="w-[700px] absolute left-0 top-0 scale-x-[-1] -z-50 hidden md:block"
      />
      <div className="bg-[var(--primary)]/80 size-[600px] rounded-full left-1/2 transform hidden md:block -translate-x-1/2 absolute -z-50 blur-[800px] -top-[400px]"></div>
      <img src="/images/LOGO-100_CALISTENIA.webp" className="h-[40px] object-contain mx-auto" alt="Logo" />
      <section className="pb-[60px] md:pb-[100px] border-b border-[var(--primary)] rounded-b-[45px] md:rounded-b-[60px] relative overflow-clip">
        <div className="cf-container">
          <div className="max-w-[760px] mx-auto py-[36px]">
            {/* Aviso destacado */}
            <p className="mb-3 bg-amber-400/15 border border-amber-400/40 flex items-center gap-2 justify-center p-2 rounded-md text-[16px] text-amber-100">
              <svg className="fill-amber-300 size-[22px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.9 536.6 69.6 524.5C62.3 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 232C306.7 232 296 242.7 296 256L296 368C296 381.3 306.7 392 320 392C333.3 392 344 381.3 344 368L344 256C344 242.7 333.3 232 320 232zM346.7 448C347.3 438.1 342.4 428.7 333.9 423.5C325.4 418.4 314.7 418.4 306.2 423.5C297.7 428.7 292.8 438.1 293.4 448C292.8 457.9 297.7 467.3 306.2 472.5C314.7 477.6 325.4 477.6 333.9 472.5C342.4 467.3 347.3 457.9 346.7 448z" /></svg>
              <span><strong>¡Ultimo paso!</strong> Confirma para no perder tu cupo.</span>
            </p>

            <iframe
              className="w-full aspect-video my-4 bg-[#131313] rounded-[12px] overflow-clip border border-[var(--primary)]/30"
              id={`${idThankyou}`}
              src={`${srcThankyou}`}
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
            ></iframe>

            {/* Título + countdown */}
            <h1 className="text-[26px] text-white font-bold leading-[115%] my-8">
              {name ? `¡${name},` : "¡Genial,"} ya casi estamos! Solo falta confirmar.
            </h1>
            {startAt && (
              <p className="text-[16px] text-white/80 mb-4">
                Tu reunión está programada para:{" "}
                <strong>{new Date(startAt).toLocaleString()}</strong>{" "}
                {countdown && <span className="ml-2 px-2 py-1 bg-white text-black rounded">Comienza en {countdown}</span>}
              </p>
            )}

            {/* Checklist de compromiso */}
            <div className="rounded-xl border border-[#2a2a2a] p-4 bg-[#121212] mb-4">
              <p className="font-semibold text-[18px] mb-2 text-white">
                Checklist (2 minutos) — marca para habilitar la confirmacion:
              </p>
              <label className="flex items-start gap-3 text-[16px] text-white/80 mb-2">
                <input type="checkbox" className="mt-1 accent-[var(--primary)]" checked={agreeQuietPlace} onChange={e => setAgreeQuietPlace(e.target.checked)} />
                <span>Voy a estar en un lugar tranquilo, sin interrupciones.</span>
              </label>
              <label className="flex items-start gap-3 text-[16px] text-white/80 mb-2">
                <input type="checkbox" className="mt-1 accent-[var(--primary)]" checked={agreeOnTime} onChange={e => setAgreeOnTime(e.target.checked)} />
                <span>Me comprometo a llegar a tiempo (respeto el cupo y la agenda).</span>
              </label>
              <label className="flex items-start gap-3 text-[16px] text-white/80">
                <input type="checkbox" className="mt-1 accent-[var(--primary)]" checked={agreeNoReschedule} onChange={e => setAgreeNoReschedule(e.target.checked)} />
                <span>Si no puedo asistir, reprogramo con anticipacion para liberar el lugar.</span>
              </label>
            </div>

            {/* CTA principal */}
            <a
              className={`cf-btn ${confirmEnabled ? "" : "opacity-60 pointer-events-none"}`}
              target="_blank"
              onClick={confirmEnabled ? trackConfirm : undefined}
              href={confirmEnabled ? waConfirmHref : undefined}
              aria-disabled={!confirmEnabled}
            >
              Confirmar mi asistencia por WhatsApp
            </a>
            <p className="text-red-400 text-[14px] text-center mt-2">En caso de no confirmar, tu llamada va a ser cancelada</p>

            <section className="pt-[100px]">
              <div>
                <h2 className="text-[28px] md:text-[36px] font-bold text-white text-center max-w-[500px] leading-[130%] mx-auto">
                  Ellos Ya Pasaron Por Acá
                </h2>
                <div className="my-8 md:my-12 max-w-[900px] mx-auto space-y-6">
                  {TESTIMONIALS_VIDEO_PAGE.map((testimonial) => {
                    return (
                      <div
                        className="shadow-[0_4px_90px_0_#7AB20070] rounded-[25px]"
                        key={testimonial.video}
                      >
                        <div>
                          <div
                            key={testimonial.video}
                            className="p-1 md:p-2 rounded-[24px] relative overflow-clip z-50 bg-[var(--background)]"
                          >
                            <div className="h-[2px] absolute top-0 overflow-clip w-full">
                              <div className="bg-white size-[80px] md:size-[300px] -top-[40px] md:top-[-150px] blur-[20px] md:blur-[100px] opacity-[100%] rounded-full absolute left-[calc(50%-40px)] md:left-[calc(50%-150px)] -z-50"></div>
                            </div>
                            <div className="bg-[var(--primary)] size-[900px] top-[-450px] blur-[150px] opacity-[70%] rounded-full absolute -right-[450px] -z-40"></div>
                            <div className="bg-[var(--primary)] size-[900px] bottom-[-450px] blur-[150px] opacity-[70%] rounded-full absolute -left-[450px] -z-40"></div>
                            <div className="relative bg-[#171717] z-50 p-4 md:p-[50px] rounded-[20px] flex md:flex-row flex-col gap-4 md:gap-8">
                              <div className="w-full max-w-[400px] aspect-video rounded-[10px] overflow-hidden">
                                <iframe
                                  className="w-full h-full"
                                  src={testimonial.video}
                                  title={testimonial.titulo}
                                  allow="autoplay; fullscreen"
                                ></iframe>
                              </div>
                              <div className="py-4 flex flex-col justify-between">
                                <div>
                                  <h3 className="text-[24px] leading-[120%] font-bold">
                                    {testimonial.titulo}
                                  </h3>
                                  <p className="text-white/80 mt-4">
                                    {testimonial.story}
                                  </p>
                                </div>
                                <div className="mt-4">
                                  <p>{testimonial.nombre}</p>
                                  <p className="text-white/80 mt-2 text-[14px]">
                                    {testimonial.dato}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* FAQ (desplazada hacia abajo) */}
            <section className="pb-[40px] pt-[100px]">
              <h3 className="text-center text-white text-[28px] mb-4 leading-[115%] font-bold">
                Preguntas frecuentes
              </h3>
              <Accordion type="single" collapsible className="w-full text-white">
                <AccordionItem value="q1">
                  <AccordionTrigger className="text-[18px] font-bold leading-[120%]">
                    ¿Cuanto tiempo necesito para ver cambios?
                  </AccordionTrigger>
                  <AccordionContent className="text-[16px] text-white/80">
                    El 90% ve el cambio mas notorio en las primeras dos semanas; depende del punto de partida. Medimos con fotos, medidas y fuerza.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger className="text-[18px] font-bold leading-[120%]">
                    ¿Tengo que dejar de comer lo que me gusta?
                  </AccordionTrigger>
                  <AccordionContent className="text-[16px] text-white/80">
                    No. Te enseñamos a incluir tus comidas favoritas sin sabotear tu progreso.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger className="text-[18px] font-bold leading-[120%]">
                    No tengo tiempo todos los dias, ¿igual puedo?
                  </AccordionTrigger>
                  <AccordionContent className="text-[16px] text-white/80">
                    Si. Planes efectivos de 3 sesiones siples/semana, 100% adaptados a tu agenda.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Social proof compacto arriba del fold */}
            <section className="pt-[60px]">
              <h2 className="text-[24px] text-center font-bold text-white mb-8">
                +300 Hombres Ocupados ya mejoraron su Fisico, Energia y Salud con 100% Calistenia.
              </h2>
              <div className="grid md:grid-cols-2 md:mt-[192px] gap-4">
                {TESTIMONIALS.map((t, i) => (
                  <div
                    className="
                            rounded-[14px]
                            w-full
                            h-[350px] flex flex-col
                            bg-linear-150 from-[var(--primary)]/20 via-[var(--primary)] to-[var(--primary)]/20
                            p-1
                            overflow-clip
                          "
                    key={`${t.img}-${i}`}
                  >
                    <p className="text-center py-2 tracking-wider text-[#f5f5f5]">
                      {t.weight}
                    </p>

                    <div className="relative flex-1 max-h-[302px] overflow-clip rounded-[10px]">
                      <div className="absolute inset-0 rounded-[10px] bg-gradient-to-t from-black/90 from-5% to-transparent to-65%" />

                      <img
                        className="w-full h-full object-cover rounded-[10px]"
                        src={t.img}
                        alt={`${ALT_IMG_GENERIC} cambio ${i + 1}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Checklist de compromiso */}
            <div className="rounded-xl border border-[#2a2a2a] p-4 bg-[#121212] mt-8">
              <p className="font-semibold text-[18px] mb-2 text-white">
                Checklist (2 minutos) — marca para habilitar la confirmacion:
              </p>
              <label className="flex items-start gap-3 text-[16px] text-white/80 mb-2">
                <input type="checkbox" className="mt-1 accent-[var(--primary)]" checked={agreeQuietPlace} onChange={e => setAgreeQuietPlace(e.target.checked)} />
                <span>Voy a estar en un lugar tranquilo, sin interrupciones.</span>
              </label>
              <label className="flex items-start gap-3 text-[16px] text-white/80 mb-2">
                <input type="checkbox" className="mt-1 accent-[var(--primary)]" checked={agreeOnTime} onChange={e => setAgreeOnTime(e.target.checked)} />
                <span>Me comprometo a llegar a tiempo (respeto el cupo y la agenda).</span>
              </label>
              <label className="flex items-start gap-3 text-[16px] text-white/80">
                <input type="checkbox" className="mt-1 accent-[var(--primary)]" checked={agreeNoReschedule} onChange={e => setAgreeNoReschedule(e.target.checked)} />
                <span>Si no puedo asistir, reprogramo con anticipacion para liberar el lugar.</span>
              </label>
            </div>

            {/* CTA repetido al final */}
            <a
              className={`cf-btn mt-4 ${confirmEnabled ? "" : "opacity-60 pointer-events-none"}`}
              target="_blank"
              onClick={confirmEnabled ? trackConfirm : undefined}
              href={confirmEnabled ? waConfirmHref : undefined}
              aria-disabled={!confirmEnabled}
            >
              Confirmar mi asistencia por WhatsApp
            </a>

            {/* Nota de escasez real */}
            <p className="text-center text-[14px] text-red-400 mt-2">
              Cupos limitados: si no confirmas, el sistema libera tu lugar automaticamente.
            </p>
          </div>
        </div>
        <div className="bg-[var(--primary)]/80 size-[600px] rounded-full left-[-400px] absolute -z-50 blur-[200px] -bottom-[300px]"></div>
        <div className="bg-[var(--primary)]/80 size-[600px] rounded-full right-[-400px] absolute -z-50 blur-[200px] -bottom-[300px]"></div>
      </section>
    </div>
  );
}
