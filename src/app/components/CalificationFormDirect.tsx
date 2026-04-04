'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

type Props = {
  variant: string;
  onClose: () => void;
  onContactReady?: (name: string, email: string, phone: string) => void;
  onCalendly?: () => void;
};
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
  objetivo: string;
  freno: string;
  intentos: string;
  ad: string;
};

// IDs válidos de preguntas de opción única
type SingleId = Extract<
  keyof FormValues,
  'edad' | 'presupuesto' | 'cuerpo' | 'urgencia' | 'ocupacion' | 'compromiso90'
>;

type MultiId = 'freno' | 'intentos';

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

type MultiStep = {
  type: 'multi';
  id: MultiId;
  title: string;
  subtitle?: string;
  options: Opcion[];
  required?: boolean;
};

type TextStep = {
  type: 'text';
  id: 'objetivo';
  title: string;
  subtitle?: string;
  placeholder?: string;
  required?: boolean;
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

// ---- Cookies helpers (para fbp/fbc)
const getCookieValue = (cookieName: string) => {
  if (typeof document === 'undefined') return '';
  const name = cookieName + '=';
  const decodedCookie = decodeURIComponent(document.cookie || '');
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return '';
};

// Crea _fbc si llega fbclid y no existe (clave para que CAPI tenga fbc)
const ensureFbcFromFbclid = () => {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  if (!fbclid) return;

  const existing = getCookieValue('_fbc');
  if (existing) {
    try {
      localStorage.setItem('_fbc', existing);
    } catch { }
    return;
  }

  const fbc = `fb.1.${Date.now()}.${fbclid}`;

  const isLocalhost =
    window.location.hostname.includes('localhost') ||
    window.location.hostname.includes('127.0.0.1');

  // En localhost http no uses Secure/None
  const cookie = isLocalhost
    ? `_fbc=${fbc}; path=/; SameSite=Lax`
    : `_fbc=${fbc}; path=/; SameSite=None; Secure`;

  document.cookie = cookie;

  try {
    localStorage.setItem('_fbc', fbc);
  } catch { }
};

export default function CalificationFormDirect({ variant, onClose, onContactReady, onCalendly }: Props) {
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
      objetivo: '',
      freno: '',
      intentos: '',
      ad: '',
    },
  });

  // Lead ID único por sesión
  const leadIdRef = useRef<string>('');
  useEffect(() => {
    const existing = sessionStorage.getItem('leadId');
    const id = existing ?? `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    leadIdRef.current = id;
    if (!existing) sessionStorage.setItem('leadId', id);
  }, []);

  const [loading, setLoading] = useState(false);
  const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>({ freno: [], intentos: [] });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleMulti = (id: MultiId, value: string) => {
    setMultiSelections((prev) => {
      const current = prev[id] ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      setValue(id as keyof FormValues, next.join(',') as any);
      return { ...prev, [id]: next };
    });
  };

  const steps = useMemo<(ContactStep | SingleStep | MultiStep | TextStep)[]>(
    () => [
      {
        type: 'contact',
        id: 'contact',
        title: 'Completá tus datos para agendar tu consulta gratuita y ver si somos un buen fit',
        subtitle: 'Tus datos son 100% confidenciales. Te tomará menos de 1 minuto.',
      },
      {
        type: 'single',
        id: 'ocupacion',
        required: true,
        title: '¿A qué te dedicas?*',
        subtitle: 'Esto nos ayuda a adaptar tu alimentación y entrenamiento a tu estilo de vida.',
        options: [
          { value: 'negocio-propio', label: 'Soy empresario' },
          {
            value: 'profesional',
            label: 'Soy profesional (Abogado, Médico, Ingeniero, Programador, etc.)',
          },
          { value: 'freelance', label: 'Freelance / Home office' },
          { value: 'trabajador', label: 'Trabajo manual / fisico' },
          { value: 'otro', label: 'Otro' },
        ],
      },
      {
        type: 'single',
        id: 'compromiso90',
        required: true,
        title: '¿Estás listo para comprometerte 90 días con tu cambio?*',
        options: [
          { value: 'si', label: 'Sí, sé que los cambios duraderos no se logran en 2 semanas.' },
          { value: 'no', label: 'No, ahora no puedo comprometerme a 90 días.' },
        ],
      },
      {
        type: 'single',
        id: 'urgencia',
        required: true,
        title: '¿Qué tan urgente es para vos cambiar tu cuerpo ahora mismo?*',
        subtitle: 'Respondé con total sinceridad. Esto nos ayuda a ver cómo ayudarte.',
        options: [
          { value: 'urgencia-baja', label: '(3 de 10) Estoy buscando info. No es prioridad ahora.' },
          { value: 'urgencia-media', label: '(5 de 10) Quiero empezar pronto. Me estoy motivando.' },
          { value: 'urgencia-alta', label: '(7 de 10) Quiero empezar ya. Me frustra cómo me siento y quiero recuperar mi salud y energía.' },
          { value: 'urgencia-muy-alta', label: '(10 de 10) No puedo esperar más. Esto me afecta física y mentalmente. Haré lo que haga falta.' },
        ],
      },
      {
        type: 'single',
        id: 'edad',
        required: true,
        title: '¿En qué rango de edad te encontrás?*',
        options: [
          { value: 'muy-joven', label: '18 - 24 años' },
          { value: 'joven', label: '24 - 35 años' },
          { value: 'adulto', label: '35 - 45 años' },
          { value: 'mayor', label: '+45 años' },
        ],
      },
      {
        type: 'text',
        id: 'objetivo',
        required: true,
        title:
          '¿Cuál es tu objetivo de salud/calidad de vida y cómo querés sentirte en los próximos meses?*',
        subtitle: 'Cuanto más nos cuentes, mejor vamos a poder ayudarte.',
        placeholder:
          'Ej: Tener más energía, dejar de cansarme, sentirme bien con mi cuerpo, mejorar mi salud...',
      },
      {
        type: 'multi',
        id: 'freno',
        required: true,
        title: '¿Qué es lo que más te frena para lograr tu objetivo físico?*',
        subtitle: 'Podés elegir más de una opción.',
        options: [
          { value: 'constancia', label: 'Me falta constancia y disciplina.' },
          { value: 'estructura', label: 'No tengo una estructura clara a seguir.' },
          { value: 'tiempo', label: 'Apenas tengo tiempo libre.' },
          { value: 'alimentacion', label: 'No sé qué comer para ver resultados.' },
          { value: 'lesion', label: 'Tengo una lesión o limitación física.' },
        ],
      },
      {
        type: 'multi',
        id: 'intentos',
        required: true,
        title: '¿Qué has probado antes para mejorar tu físico o tu salud?*',
        subtitle: 'Podés elegir más de una opción.',
        options: [
          { value: 'dietas', label: 'Dietas por mi cuenta, sin resultado duradero.' },
          { value: 'gimnasio', label: 'Gimnasio o entrenamiento sin guía.' },
          { value: 'programa', label: 'Un programa o coach, pero no funcionó.' },
          { value: 'nada', label: 'Casi nada, no sé por dónde empezar.' },
          { value: 'varias', label: 'Varias cosas, pero nada me dio resultados consistentes.' },
        ],
      },
      {
        type: 'single' as const,
        id: 'presupuesto' as const,
        required: true,
        title: '¿Podrías destinar al menos 400 USD al mes para tu proceso de transformación física si vemos que el programa es adecuado para vos? (3 meses)',
        subtitle:
          'Nuestro programa es un acompañamiento profesional completo y requiere una inversión mensual acorde al nivel de soporte del equipo. Para asegurarnos de que la llamada tenga sentido para vos y para nosotros, necesitamos confirmar lo siguiente.',
        options: [
          { value: 'presupuesto-alto', label: 'Sí, quiero asegurar mi cambio.' },
          { value: 'presupuesto-intermedio', label: 'Sí, pero primero necesito ver cómo es el servicio.' },
          { value: 'presupuesto-bajo', label: 'No en este momento.' },
        ],
      }
    ],
    [variant]
  );

  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = steps.length;
  const isLast = stepIndex === totalSteps - 1;

  useEffect(() => {
    ensureFbcFromFbclid();
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

  const canAdvanceFromStep = (s: ContactStep | SingleStep | MultiStep | TextStep) => {
    if (s.type === 'contact') return isContactValid();
    if (s.type === 'single' && s.required === true) return !!values[s.id];
    if (s.type === 'multi' && s.required === true) return (multiSelections[s.id]?.length ?? 0) > 0;
    if (s.type === 'text' && s.required === true) return (values.objetivo ?? '').trim().length > 10;
    return true;
  };

  const back = () => setStepIndex((i) => Math.max(0, i - 1));
  const next = () => setStepIndex((i) => Math.min(totalSteps - 1, i + 1));

  // Atajos teclado (respetan validación)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const step = steps[stepIndex];

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

      if (e.key === 'Enter' || e.key === 'ArrowRight') {
        const s = steps[stepIndex];
        if (canAdvanceFromStep(s)) next();
      }
      if (e.key === 'Escape' || e.key === 'ArrowLeft') back();
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

  const sentContactRef = useRef(false);

  const sendContactToFFA = () => {
    if (sentContactRef.current) return;
    if (!isContactValid()) return;

    sentContactRef.current = true;

    fetch('/api/analytics/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        phone: `${values.codigoPais}${values.telefono}`.replace(/[\s\-().]/g, ''),
        variant,
        ad: values.ad,
      }),
    }).catch(() => {});
  };

  // ------- Submit
  const onSubmit = async (data: FormValues) => {
    const isSingleRequired = (s: ContactStep | SingleStep | MultiStep | TextStep): s is SingleStep =>
      s.type === 'single' && s.required === true;

    const requiredIds = steps.filter(isSingleRequired).map((s) => s.id);

    const missing = requiredIds.find((id) => !data[id]);

    const missingMulti = (['freno', 'intentos'] as MultiId[]).find(
      (id) => (multiSelections[id]?.length ?? 0) === 0
    );
    if (missing) {
      const idx = steps.findIndex((s) => s.type === 'single' && s.id === missing);
      if (idx >= 0) setStepIndex(idx);
      return;
    }

    if (missingMulti) {
      const idx = steps.findIndex((s) => s.type === 'multi' && s.id === missingMulti);
      if (idx >= 0) setStepIndex(idx);
      return;
    }

    try {
      setLoading(true);

      const normalizedPhone = `${data.codigoPais}${data.telefono}`.replace(/[\s\-().]/g, '');

      const isQualified =
        (data.presupuesto === 'presupuesto-intermedio' ||
          data.presupuesto === 'presupuesto-alto' ||
          data.presupuesto === 'presupuesto-muy-alto') &&
        (data.edad === 'joven' || data.edad === 'adulto' || data.edad === 'mayor') &&
        data.compromiso90 === 'si' &&
        (data.urgencia === 'urgencia-alta' || data.urgencia === 'urgencia-muy-alta');

      localStorage.setItem('isQualified', isQualified ? 'true' : 'false');
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', data.email);
      localStorage.setItem('phone', `${data.codigoPais}${data.telefono}`);

      // ✅ fbp/fbc: fuente real = cookies + fallback localStorage
      const fbpCookie = getCookieValue('_fbp');
      const fbcCookie = getCookieValue('_fbc');
      const fbp = fbpCookie || localStorage.getItem('_fbp') || null;
      const fbc = fbcCookie || localStorage.getItem('_fbc') || null;

      fetch('/api/analytics/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: normalizedPhone,
          variant,
          ad: data.ad,
          edad: data.edad,
          ocupacion: data.ocupacion,
          compromiso90: data.compromiso90,
          urgencia: data.urgencia,
          objetivo: data.objetivo,
          freno: data.freno,
          intentos: data.intentos,
          presupuesto: data.presupuesto,
          fbp,
          fbc,
        }),
      }).catch(() => {});

      if (isQualified) {
        const leadEventId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('lead_event_id', leadEventId);
        localStorage.removeItem('lead_fired');

        if (fbp) localStorage.setItem('_fbp', fbp);
        if (fbc) localStorage.setItem('_fbc', fbc);

        await fetch('/api/track/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            phone: `${data.codigoPais}${data.telefono}`,
            fbp,
            fbc,
            eventId: leadEventId,
          }),
        });
      }

      if (
        data.presupuesto === 'presupuesto-intermedio' ||
        data.presupuesto === 'presupuesto-alto' ||
        data.presupuesto === 'presupuesto-muy-alto'
      ) {
        if (onCalendly) {
          onCalendly();
        } else {
          window.location.href = '/pages/calendly';
        }
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
        <span className="inline-flex items-center justify-center min-w-8 h-8 rounded-md bg-[var(--primary)] text-white font-bold">
          {LETTERS[index]}
        </span>
        <span className="text-white/90 leading-snug">{text}</span>
      </div>
    </button>
  );

  const step = steps[stepIndex];

  const progress = useMemo(() => {
    if (totalSteps <= 1) return 0;
    return Math.round(((stepIndex + 1) / totalSteps) * 100);
  }, [stepIndex, totalSteps]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      style={{ zIndex: 10000 }}
    >
      <div
        ref={containerRef}
        className="w-full md:max-w-[720px] max-h-[calc(100vh-80px)] overflow-y-auto rounded-[20px] border border-white/10 bg-[#111] p-6 md:p-10 shadow-2xl"
      >
        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-[12px] text-white/50 mb-2">
            <span>
              {stepIndex + 1} / {totalSteps}
            </span>
            <span>{progress}%</span>
          </div>

          <div className="h-[6px] w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="text-[22px] md:text-[26px] font-semibold text-white leading-tight">
          {step.title}
        </h2>
        {'subtitle' in step && step.subtitle && <p className="text-white/70 mt-2">{step.subtitle}</p>}

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
                {errors.email && <span className="text-red-400 text-xs">{errors.email.message}</span>}
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

                {errors.codigoPais && (
                  <span className="text-red-400 text-xs">{errors.codigoPais.message}</span>
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

          {step.type === 'multi' && (
            <div className="mt-2">
              {step.options.map((op) => {
                const selected = (multiSelections[step.id] ?? []).includes(op.value);
                return (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => toggleMulti(step.id, op.value)}
                    className={`w-full text-left rounded-xl border px-5 py-4 mb-3 bg-[#1a1a1a] hover:bg-[#232323] transition flex items-center gap-3
                      ${selected ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]/60' : 'border-white/15'}`}
                  >
                    <span className={`inline-flex items-center justify-center min-w-5 h-5 rounded border-2 transition
                      ${selected ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-white/40'}`}>
                      {selected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="text-white/90 leading-snug">{op.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step.type === 'text' && (
            <div className="mt-4">
              <textarea
                data-autofocus
                rows={5}
                placeholder={step.placeholder}
                {...register('objetivo', { required: step.required ? 'Este campo es obligatorio' : false })}
                className="w-full rounded-xl bg-white text-[#111] px-4 py-3 outline-none resize-none"
              />
              {errors.objetivo && (
                <span className="text-red-400 text-xs mt-1 block">
                  {errors.objetivo.message as string}
                </span>
              )}
            </div>
          )}

          <input type="hidden" {...register('ad')} />

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (stepIndex === 0) {
                  onClose();
                  return;
                }
                setStepIndex((i) => Math.max(0, i - 1));
              }}
              className="px-4 py-3 rounded-lg border border-white/15 text-white/90 hover:bg-white/10 transition"
              disabled={loading}
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
                onClick={async () => {
                  const s = steps[stepIndex];
                  if (!canAdvanceFromStep(s)) return;

                  if (s.type === 'contact') {
                    sendContactToFFA();
                    onContactReady?.(values.name, values.email, `${values.codigoPais}${values.telefono}`);
                  }

                  setStepIndex((i) => i + 1);
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
                      fill="#FFF"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>

          <p className="text-white/70 text-xs mt-4">
            PD: 100% Calistenia está pensado para hombres ocupados que quieren resultados reales sin vivir en el gimnasio.
          </p>
        </form>
      </div>
    </div>
  );
}
