'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

type Props = { variant: string };
type Opcion = { value: string; label: string };

type FormValues = {
  name: string;
  email: string;
  codigoPais: string;
  telefono: string;
  edad: string;
  presupuesto: string;
  cuerpo: string;
  urgencia: string;
  ocupacion: string;
  compromiso90: string;
  estadoActual: string; // ✅ NUEVO (texto)
  ad: string;
};

// IDs válidos de preguntas de opción única
type SingleId = Extract<
  keyof FormValues,
  'edad' | 'presupuesto' | 'cuerpo' | 'urgencia' | 'ocupacion' | 'compromiso90'
>;

type ContactStep = {
  type: 'contact';
  id: 'contact';
  title: string;
  subtitle?: string;
};

type SingleStep = {
  type: 'single';
  id: SingleId;
  title: string;
  subtitle?: string;
  options: Opcion[];
  required?: boolean;
};

// ✅ NUEVO: step de texto
type TextId = Extract<keyof FormValues, 'estadoActual'>;

type TextStep = {
  type: 'text';
  id: TextId;
  title: string;
  subtitle?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  minLength?: number; // ✅ recomendación: mínimo para evitar respuestas tipo "bien"
};

const PAISES = [
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+34', name: 'España', flag: '🇪🇸' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', name: 'Panamá', flag: '🇵🇦' },
  { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+504', name: 'Honduras', flag: '🇭🇳' },
  { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
  { code: '+1-809', name: 'República Dominicana', flag: '🇩🇴' },
  { code: '+1', name: 'Estados Unidos / Canadá', flag: '🇺🇸' },
];

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function CalificationFormDirect({ variant }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      codigoPais: '',
      telefono: '',
      edad: '',
      presupuesto: '',
      cuerpo: '',
      urgencia: '',
      ocupacion: '',
      compromiso90: '',
      estadoActual: '', // ✅ NUEVO
      ad: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const steps = useMemo<(ContactStep | SingleStep | TextStep)[]>(
    () => [
      {
        type: 'contact',
        id: 'contact',
        title:
          'Completá tus datos para agendar tu consulta gratuita y ver si somos un buen fit',
        subtitle:
          'Tus datos son 100% confidenciales. Te tomará menos de 1 minuto.',
      },  
      {
        type: 'text',
        id: 'estadoActual',
        required: true,
        title: '¿Estado de salud/físico/calidad de vida actual?*',
        subtitle: 'Describe tu situación actual para que podamos ayudarte mejor.',
        // ✅ recomendación: ejemplos para guiar mejores respuestas
        placeholder:
          'Ej: “Me falta energía a la tarde, duermo mal, me duele la espalda por estar sentado, me canso subiendo escaleras, me cuesta ser constante, tengo estrés alto, etc.”',
        maxLength: 600,
        // ✅ recomendación clave: mínimo para evitar “bien / normal”
        minLength: 25,
      },

      {
        type: 'single',
        id: 'urgencia',
        required: true,
        title: '¿Qué tan urgente es para vos cambiar tu cuerpo y mejorar tu salud ahora mismo?*',
        subtitle:
          'Responde con total sinceridad. Esto nos ayuda a ver cómo ayudarte.',
        options: [
          { value: '3', label: '(3 de 10) Estoy buscando info. No es prioridad ahora.' },
          { value: '5', label: '(5 de 10) Quiero empezar pronto. Me estoy motivando.' },
          {
            value: '7',
            label:
              '(7 de 10) Quiero empezar ya. Me frustra cómo me siento y quiero recuperar mi salud, autoestima y bienestar.',
          },
          {
            value: '10',
            label:
              '(10 de 10) No puedo esperar más. Esto me afecta física y mentalmente.',
          },
        ],
      },
      {
        type: 'single',
        id: 'ocupacion',
        required: true,
        title: '¿A qué te dedicas?*',
        subtitle:
          'Esto nos ayuda a adaptar tu alimentación y entrenamiento a tu estilo de vida.',
        options: [
          { value: 'negocio-propio', label: 'Tengo mi propio negocio con empleados' },
          { value: 'profesional', label: 'Soy profesional (Abogado, Médico, etc.)' },
          { value: 'freelance', label: 'Freelance / Home office' },
          { value: 'trabajador', label: 'Trabajo manual / fisico' },
          { value: 'otro', label: 'Otro' },
        ],
      },
      {
        type: 'single',
        id: 'compromiso90',
        required: true,
        title: '¿Estás listo/a para comprometerte 90 días con tu cambio?*',
        options: [
          { value: 'si', label: 'Sí, sé que los cambios duraderos no se logran en 2 semanas.' },
          { value: 'no', label: 'No, ahora no puedo comprometerme a 90 días.' },
        ],
      },
      {
        type: 'single',
        id: 'edad',
        required: true,
        title: '¿En qué rango de edad te encontrás?*',
        options: [
          { value: 'joven', label: '18 - 24 años' },
          { value: 'adulto', label: '24 - 44 años' },
          { value: 'mayor', label: '+44 años' },
        ],
      },
      {
        type: 'single',
        id: 'presupuesto',
        required: true,
        title: 'En caso de ser aceptado ¿Cuanto dinero dispones para invertir en vos y ser acompañado por todo un equipo integral de profesionales que te ayudaran a lograr tus objetivos de forma garantizada? *',
        options: [
          {
            value: 'presupuesto-bajo',
            label:
              'Entre 200 a 300 USD/mes',
          },
          {
            value: 'presupuesto-intermedio',
            label:
              'Entre 300 a 400 USD/mes',
          },
          {
            value: 'presupuesto-alto',
            label:
              'Entre 400 a 500 USD/mes',
          },
          {
            value: 'sin-presupuesto',
            label:
              'No tengo dinero para invertir en mi calidad de vida, imagen ni salud',
          },
        ],
      },
    ],
    []
  );

  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = steps.length;
  const isLast = stepIndex === totalSteps - 1;

  useEffect(() => {
    containerRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  const values = watch();

  // Validaciones
  const isContactValid = () => {
    const isNameValid = values.name.trim().length > 1;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
    const isPhoneValid = values.telefono.trim().length > 5 && !!values.codigoPais;
    return isNameValid && isEmailValid && isPhoneValid;
  };

  const canAdvanceFromStep = (s: ContactStep | SingleStep | TextStep) => {
    if (s.type === 'contact') return isContactValid();

    if (s.type === 'single' && s.required === true) {
      return !!values[s.id];
    }

    if (s.type === 'text' && s.required === true) {
      const v = (values[s.id] ?? '').trim();
      const min = s.minLength ?? 0;
      return v.length >= min;
    }

    return true;
  };

  const back = () => setStepIndex((i) => Math.max(0, i - 1));
  const next = () => setStepIndex((i) => Math.min(totalSteps - 1, i + 1));

  // Atajos teclado (respetan validación) + NO romper textarea
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const step = steps[stepIndex];

      const target = e.target as HTMLElement | null;
      const isTypingField =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';

      // Back siempre
      if (e.key === 'Escape' || e.key === 'ArrowLeft') {
        back();
        return;
      }

      if (step.type === 'single') {
        const selectByIndex = (idx: number) => {
          const opt = step.options[idx];
          if (!opt) return;
          setValue(step.id, opt.value as FormValues[SingleId], { shouldValidate: true });
          next();
        };

        const key = e.key.toLowerCase();
        if (['1', '2', '3', '4', '5', '6'].includes(key)) selectByIndex(Number(key) - 1);
        if (['a', 'b', 'c', 'd', 'e', 'f'].includes(key))
          selectByIndex(key.charCodeAt(0) - 'a'.charCodeAt(0));
      }

      // Si está escribiendo, no avances con Enter
      if (isTypingField) return;

      if (e.key === 'Enter' || e.key === 'ArrowRight') {
        const s = steps[stepIndex];
        if (canAdvanceFromStep(s)) next();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepIndex, steps, setValue, values]);

  // Query param ad
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const adParam = searchParams.get('ad');
    if (adParam) setValue('ad', adParam);
  }, [setValue]);

  // Bloquear scroll del body
  useEffect(() => {
    const b = document.querySelector('body');
    b?.classList.add('overflow-hidden');
    return () => b?.classList.remove('overflow-hidden');
  }, []);

  // ------- Submit
  const onSubmit = async (data: FormValues) => {
    // ✅ Type guard: single o text requeridos
    const isRequiredStep = (
      s: ContactStep | SingleStep | TextStep
    ): s is (SingleStep | TextStep) =>
      (s.type === 'single' || s.type === 'text') && s.required === true;

    // Doble seguro: si falta algún requerido, volver al primero que falte
    const requiredIds = steps.filter(isRequiredStep).map((s) => s.id);

    const missing = requiredIds.find((id) => !data[id] || String(data[id]).trim() === '');
    if (missing) {
      const idx = steps.findIndex(
        (s) => (s.type === 'single' || s.type === 'text') && s.id === missing
      );
      if (idx >= 0) setStepIndex(idx);
      return;
    }

    try {
      setLoading(true);

      await fetch('https://hook.us2.make.com/25w2sb42t4aeuxm5e8h02nxcvpu115xj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ ...data, variant }]),
      });

      const isQualified =
        (data.presupuesto === 'presupuesto-intermedio' || data.presupuesto === 'presupuesto-alto') &&
        (data.edad === 'adulto' || data.edad === 'mayor') &&
        (data.urgencia === '7' || data.urgencia === '10') &&
        (data.ocupacion === 'negocio-propio' || data.ocupacion === 'profesional');

      localStorage.setItem('isQualified', isQualified ? 'true' : 'false');
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', data.email);
      localStorage.setItem('phone', `${data.codigoPais}${data.telefono}`);

      const fbp =
        document.cookie.split('; ').find((row) => row.startsWith('_fbp='))?.split('=')[1] ||
        null;

      const getCookieValue = (cookieName: string) => {
        const name = cookieName + '=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i].trim();
          if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
        return '';
      };
      const fbc = getCookieValue('_fbc');

      if (isQualified) {
        await fetch('/api/track/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            phone: `${data.codigoPais}${data.telefono}`,
            fbp,
            fbc,
            eventId: `lead-${Date.now()}`,
          }),
        });
      }

      if (data.presupuesto === 'presupuesto-intermedio' || data.presupuesto === 'presupuesto-alto') {
        window.location.href = '/pages/calendly';
      } else {
        window.location.href = '/pages/nothing-for-you-now';
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  // ---- UI
  const CardOption = ({
    index,
    text,
    onClick,
    selected,
  }: {
    index: number;
    text: string;
    onClick: () => void;
    selected: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-xl border border-white/15 px-5 py-4 mb-3 bg-[#1a1a1a] hover:bg-[#232323] transition
        ${selected ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]/60' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center min-w-8 h-8 rounded-md bg-[var(--primary)] text-[var(--text-primary)] font-bold">
          {LETTERS[index]}
        </span>
        <span className="text-white/90 leading-snug">{text}</span>
      </div>
    </button>
  );

  const step = steps[stepIndex];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div
        ref={containerRef}
        className="w-full md:max-w-[720px] max-h-[calc(100vh-80px)] overflow-y-auto rounded-[20px] border border-white/10 bg-[#111] p-6 md:p-10 shadow-2xl"
      >
        <h2 className="text-[22px] md:text-[26px] font-semibold text-white leading-tight">
          {step.title}
        </h2>
        {'subtitle' in step && step.subtitle && (
          <p className="text-white/70 mt-2">{step.subtitle}</p>
        )}

        <form className="mt-6" onSubmit={handleSubmit(onSubmit)} autoComplete="on">
          {step.type === 'contact' && (
            <div className="space-y-5">
              <label className="block">
                <span className="text-white text-sm">Nombre</span>
                <input
                  data-autofocus
                  type="text"
                  placeholder="Tu Nombre Completo"
                  {...register('name', { required: 'Campo requerido' })}
                  className="mt-2 w-full rounded-lg bg-white text-[#111] px-4 py-3 outline-none"
                />
                {errors.name && <span className="text-red-400 text-xs">{errors.name.message}</span>}
              </label>

              <label className="block">
                <span className="text-white text-sm">Correo electrónico</span>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email', { required: 'Campo requerido' })}
                  className="mt-2 w-full rounded-lg bg-white text-[#111] px-4 py-3 outline-none"
                />
                {errors.email && (
                  <span className="text-red-400 text-xs">{errors.email.message}</span>
                )}
              </label>

              <div>
                <span className="text-white text-sm">Número de teléfono</span>
                <div className="mt-2 flex gap-2">
                  <select
                    {...register('codigoPais', { required: 'Campo requerido' })}
                    className="rounded-lg bg-white text-[#111] px-3 py-3 outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      País
                    </option>
                    {PAISES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.flag} {p.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Número"
                    {...register('telefono', {
                      required: 'Campo requerido',
                      pattern: { value: /^[0-9\s\-]+$/, message: 'Formato de teléfono inválido' },
                    })}
                    className="flex-1 bg-white text-[#111]/80 rounded-lg px-4 py-2 outline-none min-w-0"
                  />
                </div>
                {(errors as any).codigoPais && (
                  <span className="text-red-400 text-xs">{(errors as any).codigoPais.message}</span>
                )}
                {errors.telefono && (
                  <span className="text-red-400 text-xs">{errors.telefono.message}</span>
                )}
              </div>
            </div>
          )}

          {step.type === 'single' && (
            <div className="mt-2">
              {step.options.map((op, idx) => (
                <CardOption
                  key={op.value}
                  index={idx}
                  text={op.label}
                  selected={values[step.id] === op.value}
                  onClick={() => {
                    setValue(step.id, op.value as FormValues[SingleId], { shouldValidate: true });
                    setTimeout(() => setStepIndex((i) => Math.min(totalSteps - 1, i + 1)), 120);
                  }}
                />
              ))}
            </div>
          )}

          {/* ✅ NUEVO: step de texto */}
          {step.type === 'text' && (
            <div className="mt-4">
              <textarea
                data-autofocus
                rows={6}
                placeholder={step.placeholder ?? 'Escribí acá...'}
                maxLength={step.maxLength ?? 800}
                {...register(step.id, {
                  required: step.required ? 'Campo requerido' : false,
                  validate: (v) => {
                    const val = (v ?? '').trim();
                    const min = step.minLength ?? 0;
                    if (!step.required) return true;
                    if (val.length >= min) return true;
                    return `Contanos un poco más (mín. ${min} caracteres).`;
                  },
                })}
                className="w-full rounded-lg bg-white text-[#111] px-4 py-3 outline-none"
              />

              {(errors as any)[step.id] && (
                <span className="text-red-400 text-xs">{(errors as any)[step.id].message}</span>
              )}

              <div className="mt-2 text-white/50 text-xs">
                {(watch(step.id) ?? '').length}/{step.maxLength ?? 800}
              </div>

              {/* ✅ recomendación extra (micro-copy) para mejorar calidad */}
              <p className="mt-3 text-white/60 text-xs leading-relaxed">
                Recomendación: contanos <b>síntomas + contexto</b>. Ej: energía, sueño, estrés, dolores,
                y qué es lo que hoy más te limita (tiempo, constancia, ansiedad, etc.).
              </p>
            </div>
          )}

          <input type="hidden" {...register('ad')} />

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              className="px-4 py-3 rounded-lg border border-white/15 text-white/90 hover:bg-white/10 transition"
              disabled={stepIndex === 0 || loading}
            >
              Atrás
            </button>

            {isLast ? (
              <button type="submit" className="cf-btn" disabled={loading || !canAdvanceFromStep(step)}>
                {loading ? 'Cargando...' : 'Aceptar y Agendar'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const s = steps[stepIndex];
                  if (canAdvanceFromStep(s)) setStepIndex((i) => i + 1);
                }}
                className="cf-btn"
                disabled={loading || !canAdvanceFromStep(step)}
              >
                Continuar
                {!loading && (
                  <svg
                    width="13"
                    height="12"
                    viewBox="0 0 13 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 inline-block"
                  >
                    <path
                      d="M6.41318 11.6364L5.09499 10.3296L8.55522 6.86932H0.447266V4.94887H8.55522L5.09499 1.49432L6.41318 0.181824L12.1404 5.9091L6.41318 11.6364Z"
                      fill="var(--text-primary)"
                    ></path>
                  </svg>
                )}
              </button>
            )}
          </div>

          <p className="text-white/70 text-xs mt-4">
            PD: El programa está diseñado para hombres ocupados; no es una rutina de
            influencer que solo puede cumplir un adolescente con tiempo, ni usamos dietas insostenibles, es un proceso 100% natural y personalizado.
          </p>
        </form>
      </div>
    </div>
  );
}
