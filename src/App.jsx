import { useState } from 'react';
import { THEME } from './theme/constants';
import useCases from './hooks/useCases';

import AuthScreen from './components/auth/AuthScreen';
import Sidebar from './components/layout/Sidebar';
import MobileHeader from './components/layout/MobileHeader';
import DashboardView from './components/dashboard/DashboardView';
import CasesView from './components/cases/CasesView';
import CaseForm from './components/cases/CaseForm';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cases, addCase, clearCases } = useCases();

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      setUser(null);
      clearCases();
    }
  };

  const handleAddCase = (caseData) => {
    addCase(caseData);
    setIsModalOpen(false);
  };

  const openModal = () => setIsModalOpen(true);

  return (
    <div className={`flex min-h-screen ${THEME.bg} font-sans text-dark`}>
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto w-full">
        <MobileHeader onLogout={handleLogout} />

        {activeTab === 'dashboard' && (
          <DashboardView user={user} cases={cases} onOpenModal={openModal} />
        )}

        {activeTab === 'cases' && (
          <CasesView cases={cases} onOpenModal={openModal} />
        )}
      </main>

      <CaseForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCase}
      />
    </div>
  );
}
