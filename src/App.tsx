import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './lib/i18n';
import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider } from './components/Toast';
import { Shell } from './components/Shell';
import Settings from './pages/Settings';
import Dictionaries from './pages/Dictionaries';
import InboundLeases from './pages/InboundLeases';
import OutboundLeases from './pages/OutboundLeases';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Login from './pages/Login';
import AICopilot from './pages/AICopilot';
import Analytics from './pages/Analytics';
import Matchmaker from './pages/Matchmaker';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Shell />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginGuard />} />
              <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/outbound" element={<OutboundLeases />} />
                <Route path="/inbound" element={<InboundLeases />} />
                <Route path="/dictionaries" element={<Dictionaries />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/ai-copilot" element={<AICopilot />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/matchmaker" element={<Matchmaker />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function LoginGuard() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Login />;
}
