import { ExternalLink, Instagram, Linkedin, Mail } from 'lucide-react';

const SYNERTECH_LINKS = {
  portfolio: '#',
  linkedin: '#',
  instagram: 'https://www.instagram.com/synertech_official',
  email: 'mailto:nexusst4@gmail.com',
};

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-brand-gray-850 bg-brand-black-soft">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <p className="text-sm text-brand-gray-650">
              © {new Date().getFullYear()} Synertech. Todos os direitos reservados.
            </p>
            <p className="mt-2 text-xs text-brand-gray-750">
              Ingressos oficiais — evento beneficente.
            </p>
          </div>

          <div className="text-center relative overflow-hidden rounded-2xl border border-brand-yellow/20 bg-gradient-to-br from-brand-black-card via-brand-black to-brand-black-card p-6 shadow-yellow">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-yellow/10 blur-2xl text-center" />
            <p className="relative text-center text-lg font-semibold text-white md:text-right">
              Desenvolvido 
              por{' '}
              <a
                href={SYNERTECH_LINKS.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-accent bg-clip-text font-bold text-transparent transition-opacity hover:opacity-80"
              >
                Synertech
              </a>
            </p>
            <p className="relative mt-2 text-center text-xs text-brand-gray-650 md:text-right">
              Tecnologia e Branding
            </p>
            <div className="relative mt-4 flex justify-center gap-3 md:justify-end">
              <a
                href={SYNERTECH_LINKS.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-gray-850 text-brand-yellow transition-colors hover:border-brand-yellow hover:bg-brand-yellow/10"
                aria-label="Portfólio SYNERTECH"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={SYNERTECH_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-gray-850 text-brand-yellow transition-colors hover:border-brand-yellow hover:bg-brand-yellow/10"
                aria-label="LinkedIn SYNERTECH"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={SYNERTECH_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-gray-850 text-brand-yellow transition-colors hover:border-brand-yellow hover:bg-brand-yellow/10"
                aria-label="Instagram SYNERTECH"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={SYNERTECH_LINKS.email}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-gray-850 text-brand-yellow transition-colors hover:border-brand-yellow hover:bg-brand-yellow/10"
                aria-label="Email Synertech"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
