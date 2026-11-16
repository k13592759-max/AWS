import React, { useState } from 'react';
import { Navbar, PageId } from './components/Navbar';
import { Footer } from './components/Footer';
import { ArchitectureModal } from './components/ArchitectureModal';
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { QRCodeHubPage } from './pages/QRCodeHubPage';
import { TicketTrackingPage } from './pages/TicketTrackingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { EscalationPage } from './pages/EscalationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { useTickets } from './hooks/useTickets';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [prefilledBuilding, setPrefilledBuilding] = useState<string>('');
  const [prefilledRoom, setPrefilledRoom] = useState<string>('');
  const [archModalOpen, setArchModalOpen] = useState<boolean>(false);

  // Hook for live tickets & polling
  const { tickets, loading, createTicket, updateTicket, systemStatus, refetch } = useTickets();

  const escalatedCount = tickets.filter(t => t.status === 'ESCALATED').length;

  const handleScanLocation = (building: string, room: string) => {
    setPrefilledBuilding(building);
    setPrefilledRoom(room);
    setCurrentPage('report');
  };

  const handleTicketCreated = (newTicket: any) => {
    setSelectedTicketId(newTicket.ticketId);
    refetch();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        systemStatus={systemStatus}
        onOpenArchModal={() => setArchModalOpen(true)}
        escalatedCount={escalatedCount}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            setCurrentPage={setCurrentPage}
            onOpenArchModal={() => setArchModalOpen(true)}
            tickets={tickets}
          />
        )}

        {currentPage === 'student' && (
          <StudentDashboard
            tickets={tickets}
            loading={loading}
            setCurrentPage={setCurrentPage}
            setSelectedTicketId={setSelectedTicketId}
            systemStatus={systemStatus}
          />
        )}

        {currentPage === 'report' && (
          <ReportIssuePage
            prefilledBuilding={prefilledBuilding}
            prefilledRoom={prefilledRoom}
            setCurrentPage={setCurrentPage}
            setSelectedTicketId={setSelectedTicketId}
            onTicketCreated={handleTicketCreated}
          />
        )}

        {currentPage === 'qr' && (
          <QRCodeHubPage
            onScanLocation={handleScanLocation}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'track' && (
          <TicketTrackingPage
            selectedTicketId={selectedTicketId}
            setSelectedTicketId={setSelectedTicketId}
            tickets={tickets}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard
            tickets={tickets}
            onUpdateTicket={updateTicket}
            setSelectedTicketId={setSelectedTicketId}
            setCurrentPage={setCurrentPage}
            systemStatus={systemStatus}
          />
        )}

        {currentPage === 'escalations' && (
          <EscalationPage
            tickets={tickets}
            onUpdateTicket={updateTicket}
            setSelectedTicketId={setSelectedTicketId}
            setCurrentPage={setCurrentPage}
            onOpenArchModal={() => setArchModalOpen(true)}
          />
        )}

        {currentPage === 'analytics' && (
          <AnalyticsPage
            tickets={tickets}
            setSelectedTicketId={setSelectedTicketId}
            setCurrentPage={setCurrentPage}
            systemStatus={systemStatus}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setCurrentPage={setCurrentPage}
        onOpenArchModal={() => setArchModalOpen(true)}
      />

      {/* Interactive AWS Serverless Architecture Modal */}
      <ArchitectureModal
        isOpen={archModalOpen}
        onClose={() => setArchModalOpen(false)}
        systemStatus={systemStatus}
      />
    </div>
  );
}

export default App;
