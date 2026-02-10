import { useState, useEffect } from 'react';
import { THEME } from './theme/constants';
import { fetchPlatformData } from './services/api';

import AuthScreen from './components/auth/AuthScreen';
import Sidebar from './components/layout/Sidebar';
import MobileHeader from './components/layout/MobileHeader';
import DashboardView from './components/dashboard/DashboardView';
import CasesView from './components/cases/CasesView';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [platformData, setPlatformData] = useState({ tasks: [], consultas: [], procesos: [] });

  useEffect(() => {
    if (!user?.username || !user?.password) return;

    setLoading(true);
    fetchPlatformData(user.username, user.password)
      .then((data) => setPlatformData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      setUser(null);
      setPlatformData({ tasks: [], consultas: [], procesos: [] });
    }
  };

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
          <DashboardView user={user} data={platformData} loading={loading} />
        )}

        {activeTab === 'cases' && (
          <CasesView data={platformData} loading={loading} />
        )}
      </main>
    </div>
  );
}
