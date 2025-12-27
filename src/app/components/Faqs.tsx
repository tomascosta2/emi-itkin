// app/components/FAQs.tsx (o donde prefieras)
// Si estás en App Router, esto es un Client Component porque usa useState.
'use client';

import { useState } from 'react';

const faqs = [
  {
    pregunta: "¿La llamada tiene algún costo?",
    respuesta:
      "No. La llamada es 100% gratuita para darte claridad sobre tu situación, entender qué podés hacer en tu caso para lograr tus objetivos y, si veo que puedo ayudarte, ofrecerte mis servicios."
  },
  {
    pregunta: "¿Cuánto dura el asesoramiento?",
    respuesta:
      "La duración del programa es de 12 semanas."
  },
  {
    pregunta: "Si nunca he entrenado calistenia o gimnasio, ¿puedo unirme a tu asesoría?",
    respuesta:
      "Sí. Podés unirte sin problema aunque no tengas experiencia previa, ya que el proceso está adaptado para personas que recién comienzan."
  },
  {
    pregunta: "¿Qué resultados puedo esperar?",
    respuesta:
      "Vas a perder entre 10 y 20 kg de grasa en un proceso de 12 semanas, 100% garantizado o no pagás."
  },
  {
    pregunta: "¿Puedo contratar la nutrición y el entrenamiento por separado?",
    respuesta:
      "No. El plan es completo y se trabaja de forma integral para asegurar los mejores resultados."
  },
  {
    pregunta: "¿El asesoramiento es en línea o presencial?",
    respuesta:
      "El asesoramiento es 100% online. Recibís tu programa y estamos en comunicación constante para optimizar tu progreso."
  },
  {
    pregunta: "¿Puedo unirme si no tengo elementos para entrenar?",
    respuesta:
      "Sí. La calistenia se adapta a cualquier situación y se puede entrenar solo con el peso corporal. Con el tiempo, se recomienda contar al menos con una barra de dominadas para facilitar el progreso."
  },
  {
    pregunta: "¿Tengo que comer todos los días lo mismo?",
    respuesta:
      "No. Vas a aprender un método de alimentación flexible que se adapta a tus gustos, estilo de vida y necesidades, sin dejar de cumplir con tus requerimientos nutricionales."
  }
];


function PlusIcon({ rotated }: { rotated: boolean }) {
	return (
		<div className="rounded-[10px] w-[35px] h-[35px] bg-[var(--primary)]/30 min-w-[35px] flex items-center justify-center">
			<svg
				className={`faq-icon size-[14px] transition-all duration-300 ${rotated ? 'rotate-45' : ''}`}
				fill="#FFF"
				viewBox="0 0 448 512"
			>
				<path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
			</svg>
		</div>
	);
}

export default function Faqs() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	return (
			<div>
				<h2 className="text-white max-w-[300px] md:max-w-[600px] mx-auto text-[32px] md:text-[51px] font-bold text-center leading-[100%] mt-8 drop-shadow-[0_15px_15px_rgba(255,255,255,0.25)]">
					Preguntas más frecuentes
				</h2>

				<div className="max-w-[700px] mx-auto mt-8 grid gap-4" id="faq-container">
					{faqs.map((item, index) => {
						const isOpen = openIndex === index;

						return (
							<div
								key={index}
								className="w-full cursor-pointer p-[20px] bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-[14px]"
								onClick={() => setOpenIndex(isOpen ? null : index)}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') setOpenIndex(isOpen ? null : index);
								}}
								aria-expanded={isOpen}
							>
								<h3 className="font-semibold text-[18px] md:text-[20px] text-white flex justify-between items-center">
									<span className="pe-8">{item.pregunta}</span>
									<PlusIcon rotated={isOpen} />
								</h3>

								<div
									className={[
										'normal-case overflow-hidden transition-all duration-500',
										isOpen ? 'max-h-[2000px]' : 'max-h-0',
									].join(' ')}
								>
									<p className="text-white/80 text-[18px] pt-[10px]">{item.respuesta}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
	);
}
