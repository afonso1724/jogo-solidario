import { HandHeart, Target, Users } from 'lucide-react';

const PILARES = [
  {
    icon: HandHeart,
    title: 'Solidariedade',
    text: 'Cada ingresso vendido reverte directamente para causas sociais na nossa comunidade.',
  },
  {
    icon: Users,
    title: 'Comunidade',
    text: 'Unimos atletas, famílias e apoiantes numa experiência desportiva inesquecível.',
  },
  {
    icon: Target,
    title: 'Transparência',
    text: 'Processo de compra claro, com confirmação imediata e validação segura na portaria.',
  },
];

export default function SobreNos() {
  return (
    <section id="sobre" className="py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl">
          <h2 className="section-title">Sobre Nós</h2>
          <p className="mt-4 text-lg text-brand-gray-650">
            O Jogo Solidário nasceu da vontade de transformar o desporto em instrumento
            de mudança social. Organizamos este evento para angariar fundos que
            apoiam pessoas.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILARES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="card-surface group hover:border-brand-yellow/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-yellow/10 text-brand-yellow transition-colors group-hover:bg-brand-yellow group-hover:text-brand-black">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-brand-gray-650">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
