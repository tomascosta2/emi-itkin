"use client";
import { useState, useEffect, useRef } from "react";
import CalificationFormDirect from "./components/CalificationFormDirect";
import CalendlyInline from "./components/CalendlyInline";
import Faqs from "./components/Faqs";
import {
  ALT_IMG_GENERIC,
  coachName,
  idVsl,
  METHOD_INCLUDES,
  MORE_CHANGES_IMG,
  srcVsl,
  TESTIMONIALS,
  TESTIMONIALS_VIDEO_PAGE,
} from "./utils/constantes";

export default function Home() {
  const [isFormOpened, setIsFormOpened] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [calendlyPrefill, setCalendlyPrefill] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const pageLoadTime = useRef<number>(Date.now());

  const openForm = () => {
    setTimeOnPage(Math.floor((Date.now() - pageLoadTime.current) / 1000));
    setIsFormOpened(true);
  };

  // 🔒 Nuevo: control de bloqueo por 5 minutos
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsUnlocked(true);
    }, 0 * 60 * 1000); // 5 minutos

    return () => clearTimeout(timer);
  }, []);

  const [variant, setVariant] = useState<"A" | "B">("A");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("variant");
    if (p === "A" || p === "B") {
      setVariant(p);
    } else {
      setVariant(Math.random() < 0.5 ? "A" : "B");
    }
  }, []);

  const heroTitle = "Bajá entre 8 y 12 kg de grasa, recupera tu energía y tonificá en 90 días desde casa y de forma natural";
  
  const subtitle = "No entrenas solo: 5 profesionales trabajan con vos 1 a 1 para llevar tu físico al siguiente nivel.";

  return (
    <>
      {/* Precarga oculta del calendly desde que se abre el formulario */}
      {(calendlyPrefill !== null || showCalendly) && (
        <div
          style={{
            opacity: showCalendly ? 1 : 0,
            pointerEvents: showCalendly ? "auto" : "none",
            position: showCalendly ? "relative" : "fixed",
            inset: showCalendly ? "auto" : "0",
            zIndex: showCalendly ? "auto" : 0,
          }}
        >
          <CalendlyInline
            name={calendlyPrefill?.name ?? ""}
            email={calendlyPrefill?.email ?? ""}
            phone={calendlyPrefill?.phone ?? ""}
          />
        </div>
      )}

      {!showCalendly && (
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
      {isFormOpened && (
        <CalificationFormDirect
          variant={variant}
          timeOnPage={timeOnPage}
          onClose={() => setIsFormOpened(false)}
          onContactReady={(name, email, phone) => setCalendlyPrefill({ name, email, phone })}
          onCalendly={() => {
            setIsFormOpened(false);
            setShowCalendly(true);
            window.history.pushState(null, '', '?calendario');
          }}
        />
      )}
      <img src="/images/LOGO-100_CALISTENIA.webp" className="h-[40px] object-contain mx-auto" alt="Logo" />
      <header className="bg-linear-0 from-[#0E0E0E] to-[#1C1B1B] max-w-[85%] mt-6 md:mt-12 w-[500px] rounded-full mx-auto border border-[var(--primary)]/30 z-50">
        <div className="cf-container">
          <h3 className="text-center uppercase text-[var(--text-primary)]/80 tracking-widest text-[12px] py-3 leading-[130%]">
            <span>Exclusivo para hombres entre 30 y 60 años</span>
          </h3>
        </div>
      </header>

      {/* Sección VSL (siempre visible) */}
      <section className="mt-6 pb-[60px] md:pb-[100px] border-b border-[var(--primary)] rounded-b-[45px] md:rounded-b-[60px] relative overflow-clip">
        <div className="cf-container">
          <h1 className="text-center text-[20px] md:text-[38px] font-bold leading-[140%] md:px-4">
            {/* Testear este y 6 a 15 */}
            <span>
              {heroTitle}
            </span>
          </h1>
          <p className="text-[var(--primary)] text-center mt-2">
            {subtitle}
          </p>
          <section className="relative">
            <div className="bg-[#131313] p-1 pt-0 border-1 border-[var(--primary)] overflow-clip rounded-[12px] md:rounded-[16px] border-[var(--primary)] mt-6 max-w-[750px] mx-auto">
              <div className="p-2 text-center text-[12px] uppercase text-[var(--text-primary)] tracking-widest bg-[#131313]">
                <span>Paso 1 de 2:</span> Mirá este video completo
              </div>
              <div className="bg-[#131313] aspect-video rounded-[8px] md:rounded-[12px] overflow-clip">
                <iframe
                  className="w-full aspect-video"
                  id={variant === "A" ? idVsl : "panda-5496ba3b-382b-48d5-a780-d44e9ce787dc"}
                  src={variant === "A" ? srcVsl : "https://player-vz-5c2adb98-6a4.tv.pandavideo.com/embed/?v=5496ba3b-382b-48d5-a780-d44e9ce787dc"}
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                ></iframe>
              </div>
            </div>
          </section>
          <p className="mt-6 text-center text-[14px] mx-auto max-w-[350px]">
            <strong className="uppercase tracking-widest">Paso 2 de 2:</strong>{" "}
            <span className="text-white/80">
              Agenda una Llamada para Asegurar tu Lugar y tu Cambio Fisico.
            </span>
          </p>

          {/* Botón bloqueado 5 minutos */}
          <div className="mt-6">
            <button
              className="cf-btn disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!isUnlocked}
              onClick={() => {
                if (!isUnlocked) return;
                openForm();
              }}
            >
              ¡AGENDAR MI SESIÓN DE DIAGNÓSTICO!
            </button>
            <div className="h-[1px] relative overflow-clip max-w-[212px] mx-auto mt-4">
              <div className="bg-radial from-white to-black/0 size-[200px]"></div>
            </div>
            <p className="text-center mt-4 leading-[90%] text-white/40 mx-auto max-w-[350px] text-[14px] flex items-center justify-center gap-2">
              {isUnlocked
                ? "+50 clientes activos"
                : ""}
              <img src="/images/Estrella.svg" alt="Estrellas" />
            </p>
          </div>
        </div>

        <div className="bg-[var(--primary)] size-[600px] rounded-full left-[-400px] absolute -z-50 blur-[200px] -bottom-[300px] [transform:translateZ(0)] isolate opacity-100"></div>
        <div className="bg-[var(--primary)] size-[600px] rounded-full right-[-400px] absolute -z-50 blur-[200px] -bottom-[300px] [transform:translateZ(0)] isolate opacity-100"></div>
      </section>

      {isUnlocked && (
        <>
          <section className="py-[100px] bg-[#0E0E0E] border-b border-[#282828] relative z-20">
            <div className="cf-container">
              <h2 className="text-[36px] md:text-[44px] font-bold text-white text-center max-w-[500px] leading-[130%] mx-auto">
                Ellos Ya Lo Lograron ¿Y Vos Qué Esperas?
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
                  );
                })}
              </div>
              <button
                className="cf-btn"
                onClick={() => {
                  openForm();
                }}
              >
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
        </>
      )}

      {/* <section className="py-[60px] md:py-[90px] relative overflow-clip">
        <div className="absolute w-full h-full -z-40 top-0 left-0 bg-[url('/images/fondo-cuadritos.webp')] filter saturate-0 bg-black bg-no-repeat bg-top"></div>
        <div className="">
          <div className="cf-container">
            <header className="bg-linear-0 from-[#0E0E0E] to-[#1C1B1B] max-w-[85%] w-fit px-8 rounded-full mx-auto border border-[var(--primary)]/30 z-50">
              <div className="cf-container">
                <h3 className="text-center uppercase text-[var(--text-primary)]/80 tracking-widest text-[12px] py-3 leading-[130%]">
                  <span>Antes de seguir, esto es clave</span>
                </h3>
              </div>
            </header>
            <h2 className="text-[24px] md:text-[40px] mt-6 font-bold text-white text-center uppercase max-w-[780px] leading-[130%] mx-auto">
              Esto no es para cualquiera. Pero si es para vos,{" "}
              <span className="text-[var(--primary)]">
                puede cambiarte la vida en 90 días...
              </span>
            </h2>
            <p className="text-white/80 text-[18px] text-center mx-auto max-w-[550px] mt-4">
              Este método fue diseñado especialmente para profesionales mayores
              de 30 años que buscan un cambio real y sostenible en su salud y
              apariencia física.
            </p>
            <div className="my-8 md:my-12 grid md:grid-cols-2 gap-6 md:gap-12 max-w-[900px] mx-auto">
              <div className="overflow-clip relative p-1 rounded-[20px] bg-linear-[-142deg] from-[#FFF]/5 via-[#B4B4B4]/50 to-[#FFF]/5">
                <div className="bg-linear-0 z-50 border border-[#252525] from-[#070707] to-[#161616] p-8 rounded-[18px] h-full">
                  <h3 className="text-white text-[24px] font-semibold tracking-[-1%]">
                    Para quién NO es esto
                  </h3>
                  <ul className="mt-4 max-w-[600px] mx-auto space-y-4 md:pe-12 list-disc list-inside text-white/60 text-[18px] leading-[24px]">
                    <li className="flex items-start gap-4">
                      <img
                        src="/images/cross.webp"
                        className="mt-[8px] size-[22px]"
                        alt="Es para vos"
                      />
                      Queres cambiar de la noche a la mañana.
                    </li>
                    <li className="flex items-start gap-4">
                      <img
                        src="/images/cross.webp"
                        className="mt-[8px] size-[22px]"
                        alt="Es para vos"
                      />
                      No te dejas ayudar en el proceso.
                    </li>
                    <li className="flex items-start gap-4">
                      <img
                        src="/images/cross.webp"
                        className="mt-[8px] size-[22px]"
                        alt="Es para vos"
                      />
                      No queres cambiar tu situación actual.
                    </li>
                  </ul>
                </div>
              </div>
              <div className="overflow-clip relative p-1 rounded-[20px] bg-linear-[-142deg] from-[#7AB200]/20 via-[#7AB200]/100 to-[#7AB200]/20">
                <div className="absolute w-full top-[5px] left-0 z-50">
                  <div className="h-[2px] relative overflow-clip w-full mx-auto">
                    <div className="bg-linear-90 from-[#7AB200]/0 via-white to-[#7AB200]/0 h-[200px] w-80 left-10 absolute -top-[100px]"></div>
                  </div>
                </div>
                <div className="bg-linear-0 z-40 border relative border-[#252525] from-[#070707] to-[#161616] p-8 rounded-[18px]">
                  <div className="size-[200px] bg-[var(--primary)]/20 blur-[100px] absolute z-10 -top-[100px] -left-[100px]"></div>
                  <h3 className="text-white text-[24px] font-semibold tracking-[-1%] relative z-20">
                    Para quién <span className="text-[var(--primary)]">SÍ</span>{" "}
                    es 100% Calistenia
                  </h3>
                  <ul className="mt-4 max-w-[600px] mx-auto space-y-4 md:pe-12 list-disc list-inside text-white/60 text-[18px] leading-[24px] relative z-20">
                    <li className="flex items-start gap-4">
                      <div className="size-[24px] mt-2 min-w-[24px] rounded-full flex items-center justify-center bg-[var(--primary)]">
                        <img
                          src="/images/white-check.svg"
                          className="size-[10px]"
                          alt="Es para vos"
                        />
                      </div>
                      Tenes 30 años o más y una vida ocupada.
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="size-[24px] mt-2 min-w-[24px] rounded-full flex items-center justify-center bg-[var(--primary)]">
                        <img
                          src="/images/white-check.svg"
                          className="size-[10px]"
                          alt="Es para vos"
                        />
                      </div>
                      Queres resultados sostenibles en el tiempo.
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="size-[24px] mt-2 min-w-[24px] rounded-full flex items-center justify-center bg-[var(--primary)]">
                        <img
                          src="/images/white-check.svg"
                          className="size-[10px]"
                          alt="Es para vos"
                        />
                      </div>
                      No queres perder tiempo improvisando.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              className="cf-btn"
              onClick={() => {
                openForm();
              }}
            >
              ¡AGENDAR MI SESIÓN DE DIAGNÓSTICO!
            </button>
            <div className="h-[1px] relative overflow-clip max-w-[212px] mx-auto mt-4">
              <div className="bg-radial from-white to-black/0 size-[200px]"></div>
            </div>
            <p className="text-center mt-4 text-white/40 mx-auto max-w-[350px] text-[14px]">
              Solo 15 cupos nuevos por mes
            </p>
          </div>
        </div>
      </section> */}

      <div className="bg-black">
        {/* <section
          className="
              relative
              py-[60px]
              md:py-[90px]
              rounded-t-[45px]
              md:rounded-t-[60px]
              overflow-hidden
              border-t border-[var(--primary)]
            "
        >

          <div className="bg-[var(--primary)]/80 size-[900px] rounded-full left-[-400px] absolute  blur-[200px] -top-[600px]"></div>
          <div className="bg-[var(--primary)]/80 size-[900px] rounded-full right-[-400px] absolute  blur-[200px] -top-[600px]"></div>
          <div className="bg-black w-full h-[700px] rounded-[200px] z-10  blur-[150px] absolute left-0 top-[50px]"></div>
          <div className="cf-container z-50 relative">
            <div
              className="
                flex items-center justify-center
                mx-auto w-fit lg:w-[305px]
                h-[41px] px-5
                border border-[var(--primary)]/24
                rounded-full
                text-center
                bg-[linear-gradient(0deg,#1C1B1B_0%,#0E0E0E_100%)]
              "
            >
              <p className="text-[#FFF]/80 text-[11px] leading-[37px] tracking-[0.25em]">
                EL MÉTODO QUE ORDENA TODO
              </p>
            </div>
            <div className="mt-8">
              <h2 className="text-[36px] md:text-[40px] font-bold text-white text-center max-w-[900px] leading-[130%] mx-auto">
                ¿Que incluye 100% Calistenia?
              </h2>
              <p className="text-white/80 text-center mt-4 max-w-[600px] text-[18px] mx-auto">
                FIT90 no es una rutina más: es una estructura simple y probada
                que te dice qué hacer, cuándo hacerlo y cómo mantener los
                resultados sin depender de la motivación.
              </p>
            </div>
            <div className="my-8 md:my-12 grid md:grid-cols-3 gap-[12px] max-w-[900px] mx-auto">
              {METHOD_INCLUDES.map((m, i) => (
                <div
                  key={i}
                  className="
                    relative
                    p-8 rounded-[24px]
                    text-center
                    bg-black
                    border-[2px] border-[var(--primary)]/34
                  "
                >
                  <div className="-top-[2px] absolute z-50 h-[2px] w-[60%] left-[20%] bg-linear bg-linear-90 bg-center from-[(var(--primary))]/0 via-white/70 to-[var(--primary)]/0"></div>
                  <div className="absolute w-full h-full overflow-clip top-0 left-0 rounded-[24px]">
                    <div className="size-[140px] blur-[80px] bg-[var(--primary)]/80 absolute rounded-full -top-[70px] left-[calc(50%-70px)]"></div>
                  </div>
                  <div
                    className="
                      z-50 relative
                      mx-auto mb-5
                      flex p-[25px] items-center justify-center
                      rounded-2xl
                      bg-gradient-to-b from-[#2F5D00] to-[#000]
                      outline-1 outline-[var(--primary)]/60 outline-offset-[4px]  
                      w-fit
                      shadow-[0_4px_30px_0_#7AB20070]
                    "
                  >
                    <img src={m.img} alt={m.title} className="size-[42px]" />
                  </div>

                  <p className="text-white text-[18px] mt-8 font-semibold">{m.title}</p>
                </div>
              ))}
            </div>
            <button
              className="cf-btn"
              onClick={() => {
                openForm();
              }}
            >
              ¡AGENDAR MI SESIÓN DE DIAGNÓSTICO!
            </button>
            <div className="h-[1px] relative overflow-clip max-w-[212px] mx-auto mt-4">
              <div className="bg-radial from-white to-black/0 size-[200px]"></div>
            </div>
            <p className="text-center mt-4 text-white/40 mx-auto max-w-[350px] text-[14px]">
              Solo 15 cupos nuevos por mes
            </p>
          </div>
        </section> */}
      </div>

      <section className="w-full  bg-[#000] relative pt-[80px] md:pt-[160px]">
        <div className="h-[2px] top-0 absolute overflow-clip w-full z-50 hidden md:block">
          <div className="size-[400px] blur-[200px] left-[calc(50%-200px)] -top-[200px] absolute bg-[var(--primary)]"></div>
        </div>
        <img src="/images/img_background_testimonials.webp" className="absolute md:top-0 top-[180px] w-full object-contain" alt="Fit Funnels" />
        <div className="cf-container relative">
          <div className="mx-auto w-full max-w-[1200px] text-center">
            <h2 className="text-[32px] md:text-[50px] max-w-[750px] mx-auto font-bold text-white leading-[130%]">
              Tasa de éxito del 100%
            </h2>
            <p className="mt-4 text-white/80 text-[18px] max-w-[500px] mx-auto">
              +300 Hombres Sedentarios ya mejoraron su Fisico, Energia y Salud. Si ellos pudieron, Vos También Podés.
            </p>
            <div className="grid md:grid-cols-3 mt-[140px] md:mt-[192px] gap-4">
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
                    <p className="text-white text-center font-semibold text-[18px] px-4">+300 cambios de hombres ocupados. Vos podes ser el proximo</p>
                  </div>
                  <img
                    className="w-full h-full object-cover rounded-[10px]"
                    src={`${MORE_CHANGES_IMG}`}
                    alt={`${ALT_IMG_GENERIC}`}
                  />
                </div>
              </div>
            </div>
            <p className="mt-6 text-white/30 text-[11px] max-w-[500px] mx-auto">
              Todos los hombres que aparecen en las fotografías dieron su consentimiento expreso para ser mostrados en este sitio.
            </p>
            <div className="mt-8 md:mt-12">
              <button
                className="cf-btn disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!isUnlocked}
                onClick={() => {
                  if (!isUnlocked) return;
                  openForm();
                }}
              >
                ¡AGENDAR MI SESIÓN DE DIAGNÓSTICO!
              </button>
              <div className="h-[1px] relative overflow-clip max-w-[212px] mx-auto mt-4">
                <div className="bg-radial from-white to-black/0 size-[200px]"></div>
              </div>
              <p className="text-center my-4 text-white/40 mx-auto max-w-[350px] text-[14px] ">
                {isUnlocked
                  ? "Solo 15 cupos nuevos por mes"
                  : ""}
              </p>
            </div>
          </div>
        </div>
        {/* </div> */}
      </section>

      {/* <section className="pt-[120px] pb-[80px]">
        <div className="cf-container">
          <Faqs />
          <div className="mt-8">
            <button
              className="cf-btn disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!isUnlocked}
              onClick={() => {
                if (!isUnlocked) return;
                openForm();
              }}
            >
              ¡AGENDAR MI SESIÓN DE DIAGNÓSTICO!
            </button>
            <div className="h-[1px] relative overflow-clip max-w-[212px] mx-auto mt-4">
              <div className="bg-radial from-white to-black/0 size-[200px]"></div>
            </div>
            <p className="text-center mt-4 text-white/40 mx-auto max-w-[350px] text-[14px]">
              {isUnlocked
                ? "Solo 15 cupos nuevos por mes"
                : ""}
            </p>
          </div>
        </div>
      </section> */}

      {/* <div className="bg-[var(--primary)] overflow-hidden w-full">
  <div className="relative flex w-full">
    
    <div className="flex w-max animate-marquee gap-10 px-6 py-4 text-white tracking-wider font-medium">
      <span>+50 CAMBIOS FÍSICOS LOGRADOS</span>
      <span>CUPOS LIMITADOS POR MES</span>
      <span>+50 CAMBIOS FÍSICOS LOGRADOS</span>
      <span>CUPOS LIMITADOS POR MES</span>
      <span>+50 CAMBIOS FÍSICOS LOGRADOS</span>
    </div>

  </div>
</div> */}


      <p className="pb-6 pt-8 text-[14px] text-center px-4 text-white/60">
        © {coachName} 2026 100% Calistenia. Todos los derechos reservados.
        <br />
        <span className="mt-2 block max-w-[500px] mx-auto text-[12px] text-white/40">
          Este sitio no forma parte ni está avalado por Meta™ (Facebook™ o Instagram™).
          Facebook™ e Instagram™ son marcas registradas de Meta Platforms, Inc.

          Al utilizar este sitio aceptás nuestra <a href="/pages/politicas-de-privacidad">Política de Privacidad</a> y <a href="/pages/terminos-y-condiciones">Términos y Condiciones</a>.
        </span>
      </p>
      <div className="bg-[var(--primary)] size-[600px] md:size-[700px] blur-[100px] md:blur-[200px] opacity-100 rounded-full absolute left-[calc(50%-300px)] md:-left-[300px] -bottom-[300px] md:block hidden -z-50 [transform:translateZ(0)] isolate"></div>
      <div className="bg-[var(--primary)] size-[600px] md:size-[700px] blur-[100px] md:blur-[200px] opacity-100 rounded-full absolute right-[calc(50%-300px)] md:-right-[300px] -bottom-[300px] md:block hidden -z-50 [transform:translateZ(0)] isolate"></div>
    </div>
      )}
    </>
  );
}
