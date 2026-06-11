import { useState } from 'react';
import { Menu, X, Ticket } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'Sobre Nós' },
  { id: 'tickets', label: 'Compra / Reserva' },
];

export default function Header({ activeTab, onTabChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id) => {
    onTabChange(id);
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-brand-gray-850 bg-brand-black/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <button
          type="button"
          onClick={() => handleNav('inicio')}
          className="flex items-center gap-2 group"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow text-brand-black transition-transform group-hover:scale-105">
            <Ticket className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <div className="text-left">
            <span className="block text-sm font-bold uppercase tracking-wider text-brand-yellow">
              Jogo Solidário
            </span>
            <span className="block text-xs text-brand-gray-650">Ingressos Oficiais</span>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-brand-yellow text-brand-black'
                  : 'text-gray-300 hover:bg-brand-black-card hover:text-brand-yellow'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-brand-yellow md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-brand-gray-850 bg-brand-black-soft px-4 py-3 md:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={`block w-full rounded-lg px-4 py-3 text-left text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-brand-yellow text-brand-black'
                  : 'text-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
