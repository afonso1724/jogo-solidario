import { useEffect, useState } from 'react';
import { Calendar, MapPin, Heart } from 'lucide-react';

const EVENTO_DATA = import.meta.env.VITE_EVENTO_DATA || '2026-07-04T09:00:00Z';

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate) - new Date();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  };
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-brand-gray-850 bg-brand-black-card/80 px-4 py-3 min-w-[4.5rem] md:min-w-[5.5rem]">
      <span className="text-2xl font-bold tabular-nums text-brand-yellow md:text-4xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-brand-gray-650 md:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function Hero({ onCtaClick }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(EVENTO_DATA));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(EVENTO_DATA));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const eventDate = new Date(EVENTO_DATA).toLocaleDateString('pt-AO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-hero-gradient py-16 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(250,204,21,0.08)_0%,_transparent_50%)]" />
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 rounded-full bg-brand-yellow/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-yellow">
              <Heart className="h-3.5 w-3.5" />
              Evento Solidário
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Um jogo pela
              <span className="block bg-yellow-accent bg-clip-text text-transparent">
                comunidade
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-brand-gray-650">
              Participe no nosso jogo solidário. Reserve ou compre o seu ingresso
              em segundos.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-yellow" />
                {eventDate}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-yellow" />
                Complexo Escolar Privado Nossa Senhora da Anunciação Vila-Sede
              </span>
            </div>

            <button type="button" onClick={onCtaClick} className="btn-primary mt-10">
              Garantir o meu ingresso
            </button>
          </div>

          <div className="flex flex-col items-center lg:items-end">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-gray-650">
              Countdown para o jogo
            </p>
            {timeLeft.ended ? (
              <p className="text-2xl font-bold text-brand-yellow">O jogo começou!</p>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                <CountdownUnit value={timeLeft.days} label="Dias" />
                <CountdownUnit value={timeLeft.hours} label="Horas" />
                <CountdownUnit value={timeLeft.minutes} label="Min" />
                <CountdownUnit value={timeLeft.seconds} label="Seg" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
