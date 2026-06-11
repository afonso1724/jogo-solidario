import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import SobreNos from './components/SobreNos';
import TicketForm from './components/TicketForm';
import Footer from './components/Footer';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminValidar from './pages/admin/AdminValidar';

function PublicApp() {
  const [activeTab, setActiveTab] = useState('inicio');

  const goToTickets = () => {
    setActiveTab('tickets');
    document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        <Hero onCtaClick={goToTickets} />
        <SobreNos />
        <section id="tickets" className="py-20 bg-brand-black-soft/50">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-12 text-center">
              <h2 className="section-title">Compra / Reserva de Tickets</h2>
              <p className="mt-3 text-brand-gray-650">
                Fluxo rápido — sem login. Escolha reserva ou compra imediata.
              </p>
            </div>
            <TicketForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicApp />} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/validar/:hash" element={<AdminValidar />} />
    </Routes>
  );
}
