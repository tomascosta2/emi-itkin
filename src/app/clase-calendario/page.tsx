"use client";

import { useEffect, useState } from "react";
import CalendlyRouting from "../components/CalendlyRouting";
import {
  ALT_IMG_GENERIC,
  coachName,
  idVsl,
  MORE_CHANGES_IMG,
  srcVsl,
  TESTIMONIALS,
  TESTIMONIALS_VIDEO_PAGE,
} from "../utils/constantes";

export default function ClaseCalendario() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsUnlocked(true);
    }, 0 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  const heroTitle =
    "Bajá entre 8 y 12 kg de grasa, recupera tu energía y tonificá en 90 días desde casa y de forma natural";
  const subtitle =
    "De forma 100% natural y con entrenamientos simples, diseñados para profesionales que pasan la mayor parte del día sentados.";

  const scrollToCalendly = () => {
    const el = document.getElementById("calendly");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
      <div className="bg-[var(--primary)] size-[600px] rounded-full left-1/2 transform hidden md:block -translate-x-1/2 absolute -z-50 blur-[800px] -top-[400px] [transform:translateZ(0)] isolate opacity-100"></div>

      <img
        src="/images/LOGO-100_CALISTENIA.webp"
        className="h-[40px] object-contain mx-auto"
        alt="Logo"
      />
      <header className="bg-linear-0 from-[#0E0E0E] to-[#1C1B1B] max-w-[85%] mt-6 md:mt-12 w-[500px] rounded-full mx-auto border border-[var(--primary)]/30 z-50">
        <div className="cf-container">
          <h3 className="text-center uppercase text-[var(--text-primary)]/80 tracking-widest text-[12px] py-3 leading-[130%]">
            <span>Programa #1 para hombres sedentarios en LATAM</span>
          </h3>
        </div>
      </header>

      {/* Sección VSL */}
      <section className="mt-6 pb-[60px] md:pb-[100px] border-b border-[var(--primary)] rounded-b-[45px] md:rounded-b-[60px] relative overflow-clip">
        <div className="cf-container">
          <h1 className="text-center text-[20px] md:text-[38px] font-bold leading-[140%] md:px-4">
            <span>{heroTitle}</span>
          </h1>
          <p className="text-[var(--primary)] text-center mt-2">{subtitle}</p>
          <section className="relative">
            <div className="bg-[#131313] p-1 pt-0 border-1 border-[var(--primary)] overflow-clip rounded-[12px] md:rounded-[16px] border-[var(--primary)] mt-6 max-w-[750px] mx-auto">
              <div className="p-2 text-center text-[12px] uppercase text-[var(--text-primary)] tracking-widest bg-[#131313]">
                <span>Paso 1 de 2:</span> Mirá este video completo
              </div>
              <div className="bg-[#131313] aspect-video rounded-[8px] md:rounded-[12px] overflow-clip">
                <iframe
                  className="w-full aspect-video"
                  id={`${idVsl}`}
                  src={`${srcVsl}`}
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                ></iframe>
              </div>
            </div>
          </section>

          <div className="mt-6">
            <button
              className="cf-btn disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!isUnlocked}
              onClick={() => {
                if (!isUnlocked) return;
                scrollToCalendly();
              }}
            >
              ¡AGENDAR MI SESIÓN DE DIAGNÓSTICO!
            </button>
            <div className="h-[1px] relative overflow-clip max-w-[212px] mx-auto mt-4">
              <div className="bg-radial from-white to-black/0 size-[200px]"></div>
            </div>
            <p className="text-center mt-4 leading-[90%] text-white/40 mx-auto max-w-[350px] text-[14px] flex items-center justify-center gap-2">
              {isUnlocked ? "+50 clientes activos" : ""}
              <img src="/images/Estrella.svg" alt="Estrellas" />
            </p>
          </div>
        </div>

        <div className="bg-[var(--primary)] size-[600px] rounded-full left-[-400px] absolute -z-50 blur-[200px] -bottom-[300px] [transform:translateZ(0)] isolate opacity-100"></div>
        <div className="bg-[var(--primary)] size-[600px] rounded-full right-[-400px] absolute -z-50 blur-[200px] -bottom-[300px] [transform:translateZ(0)] isolate opacity-100"></div>
      </section>

      {/* Calendly Routing - siempre visible debajo del VSL */}
      <p className="pt-[60px] md:pt-[80px] mb-0 text-center text-[14px] mx-auto max-w-[350px]">
        <strong className="uppercase tracking-widest">Paso 2 de 2:</strong>
      </p>
      <CalendlyRouting />

      {isUnlocked && (
        <section className="py-[100px] bg-[#0E0E0E] border-b border-[#282828] relative z-20">
          <div className="cf-container">
            <h2 className="text-[36px] md:text-[44px] font-bold text-white text-center max-w-[500px] leading-[130%] mx-auto">
              Ellos Ya Lo Lograron ¿Y Vos Qué Esperas?
            </h2>
            <div className="my-8 md:my-12 max-w-[900px] mx-auto space-y-6">
              {TESTIMONIALS_VIDEO_PAGE.map((testimonial) => (
                <div
                  className="shadow-[0_4px_90px_0_#7AB20070] rounded-[25px]"
                  key={testimonial.video}
                >
                  <div>
                    <div
                      className="p-1 md:p-2 rounded-[24px] relative overflow-clip z-50 bg-[var(--background)]"
                    >
                      <div className="h-[2px] absolute top-0 overflow-clip w-full">
                        <div
                          className="pointer-events-none absolute
                            size-[100px] md:size-[300px]
                            -top-[50px] md:-top-[150px]
                            left-1/2 -translate-x-1/2
                            rounded-full bg-white
                            blur-[30px] md:blur-[100px]
                            opacity-100
                            z-50
                            [transform:translateZ(0)]"
                        />
                      </div>
                      <div
                        className="pointer-events-none absolute -right-[450px] top-[-450px]
                                  size-[850px] rounded-full bg-[var(--primary)]
                                  blur-[150px] opacity-100 -z-10
                                  [transform:translateZ(0)]
                                  isolate"
                      ></div>
                      <div
                        className="pointer-events-none absolute -left-[450px] bottom-[-450px]
                                  size-[850px] rounded-full bg-[var(--primary)]
                                  blur-[150px] opacity-100 -z-10
                                  [transform:translateZ(0)]
                                  isolate"
                      ></div>
                      <div className="relative bg-[#171717] z-50 p-4 md:p-[50px] rounded-[20px] flex md:flex-row flex-col gap-4 md:gap-8">
                        <div className="w-full max-w-[400px] aspect-video rounded-[10px] overflow-hidden">
                          <iframe
                            className="w-full h-full"
                            src={testimonial.video}
                            title={testimonial.titulo}
                            allow="autoplay; fullscreen"
                            loading="lazy"
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
              ))}
            </div>
            <button className="cf-btn" onClick={scrollToCalendly}>
              ¡AGENDAR MI SESIÓN DE DIAGNÓSTICO!
            </button>
            <div className="h-[1px] relative overflow-clip max-w-[212px] mx-auto mt-4">
              <div className="bg-radial from-white to-black/0 size-[200px]"></div>
            </div>
            <p className="text-center mt-4 text-white/40 mx-auto max-w-[350px] text-[14px]">
              Solo 15 cupos nuevos por mes
            </p>
          </div>
        </section>
      )}

      <section className="w-full bg-[#000] relative pt-[80px] md:pt-[160px]">
        <div className="h-[2px] top-0 absolute overflow-clip w-full z-50 hidden md:block">
          <div className="size-[400px] blur-[200px] left-[calc(50%-200px)] -top-[200px] absolute bg-[var(--primary)]"></div>
        </div>
        <img
          src="/images/img_background_testimonials.webp"
          className="absolute md:top-0 top-[180px] w-full object-contain"
          alt="Fit Funnels"
        />
        <div className="cf-container relative">
          <div className="mx-auto w-full max-w-[1200px] text-center">
            <h2 className="text-[32px] md:text-[50px] max-w-[750px] mx-auto font-bold text-white leading-[130%]">
              Estos Resultados podes Obtener Si Agendas Hoy
            </h2>
            <p className="mt-4 text-white/80 text-[18px] max-w-[500px] mx-auto">
              +300 Hombres Sedentarios ya mejoraron su Fisico, Energia y Salud. Si
              ellos pudieron, Vos También Podés.
            </p>
            <div className="grid md:grid-cols-3 mt-[140px] md:mt-[192px] gap-4">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="
                    rounded-[14px]
                    w-full
                    h-[350px] flex flex-col
                    bg-linear-150 from-[var(--primary)]/20 via-[var(--primary)] to-[var(--primary)]/20
                    p-1
                    overflow-clip
                  "
                >
                  <p className="text-center py-2 tracking-wider text-[#f5f5f5]">
                    {t.weight}
                  </p>
                  <div className="relative flex-1 max-h-[302px] overflow-clip rounded-[10px]">
                    <div className="absolute inset-0 rounded-[10px] bg-gradient-to-t from-black/90 from-5% to-transparent to-65%" />
                    <img
                      className="w-full h-full object-cover rounded-[10px]"
                      src={t.img}
                      loading="lazy"
                      alt={`${ALT_IMG_GENERIC} cambio ${i + 1}`}
                    />
                  </div>
                </div>
              ))}
              <div
                className="
                  rounded-[14px]
                  w-full
                  bg-linear-150 from-[var(--primary)]/20 via-[var(--primary)] to-[var(--primary)]/20
                  p-1
                  overflow-clip
                  flex
                  flex-col
                  h-[350px]
                "
              >
                <p className="text-center py-2 tracking-wider text-[#f5f5f5]">
                  TU PRÓXIMO CAMBIO
                </p>
                <div className="relative flex-1 overflow-clip rounded-[10px]">
                  <div className="absolute flex items-center justify-center inset-0 rounded-[10px] bg-black/80">
                    <p className="text-white text-center font-semibold text-[18px] px-4">
                      +300 cambios de hombres ocupados. Vos podes ser el proximo
                    </p>
                  </div>
                  <img
                    className="w-full h-full object-cover rounded-[10px]"
                    src={`${MORE_CHANGES_IMG}`}
                    alt={`${ALT_IMG_GENERIC}`}
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 md:mt-12">
              <button
                className="cf-btn disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!isUnlocked}
                onClick={() => {
                  if (!isUnlocked) return;
                  scrollToCalendly();
                }}
              >
                ¡AGENDAR MI SESIÓN DE DIAGNÓSTICO!
              </button>
              <div className="h-[1px] relative overflow-clip max-w-[212px] mx-auto mt-4">
                <div className="bg-radial from-white to-black/0 size-[200px]"></div>
              </div>
              <p className="text-center my-4 text-white/40 mx-auto max-w-[350px] text-[14px]">
                {isUnlocked ? "Solo 15 cupos nuevos por mes" : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <p className="pb-6 pt-8 text-[14px] text-center px-4 text-white/60">
        © {coachName} 2026 100% Calistenia. Todos los derechos reservados.
        <br />
        <span className="mt-2 block max-w-[500px] mx-auto text-[12px] text-white/40">
          Este sitio no forma parte ni está avalado por Meta™ (Facebook™ o
          Instagram™). Facebook™ e Instagram™ son marcas registradas de Meta
          Platforms, Inc. Al utilizar este sitio aceptás nuestra{" "}
          <a href="/pages/politicas-de-privacidad">Política de Privacidad</a> y{" "}
          <a href="/pages/terminos-y-condiciones">Términos y Condiciones</a>.
        </span>
      </p>
      <div className="bg-[var(--primary)] size-[600px] md:size-[700px] blur-[100px] md:blur-[200px] opacity-100 rounded-full absolute left-[calc(50%-300px)] md:-left-[300px] -bottom-[300px] md:block hidden -z-50 [transform:translateZ(0)] isolate"></div>
      <div className="bg-[var(--primary)] size-[600px] md:size-[700px] blur-[100px] md:blur-[200px] opacity-100 rounded-full absolute right-[calc(50%-300px)] md:-right-[300px] -bottom-[300px] md:block hidden -z-50 [transform:translateZ(0)] isolate"></div>
    </div>
  );
}
