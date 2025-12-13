import { useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

// Layout Components
import ConfigWarning from './components/common/ConfigWarning';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import TabContent from './components/common/TabContent';
import MainLayout from './components/layout/MainLayout';

// Page Components
import DocumentationRedirect from './components/DocumentationRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/Login.tsx';

// AI Components
import AIDashboard from './components/ai/AIDashboard';
import AIDemo from './components/ai/AIDemo';
import EnhancedAIDashboard from './components/ai/EnhancedAIDashboard';

// Custom Hooks
import { useConfigValidation } from './hooks/useConfigValidation';

// Documentation routes configuration
const DOC_ROUTES = [
  { path: '/README.md', redirectPath: 'README.md' },
  { path: '/QUICK_SETUP.md', redirectPath: 'docs/setup/QUICK_SETUP.md' },
  {
    path: '/PROJECT_SUMMARY.md',
    redirectPath: 'docs/project/PROJECT_SUMMARY.md',
  },
  {
    path: '/PROJECT_COMPLETE.md',
    redirectPath: 'docs/project/PROJECT_COMPLETE.md',
  },
  { path: '/DEPLOYMENT.md', redirectPath: 'docs/guides/DEPLOYMENT.md' },
  { path: '/docs/README.md', redirectPath: 'docs/README.md' },
  { path: '/docs/setup/*', redirectPath: 'docs/setup/QUICK_SETUP.md' },
  { path: '/docs/guides/*', redirectPath: 'docs/guides/DEPLOYMENT.md' },
  { path: '/docs/project/*', redirectPath: 'docs/project/PROJECT_SUMMARY.md' },
];

// Main App Component (Sidebar-based interface)
const MainApp = () => {
  const [activeTab, setActiveTab] = useState('sheets');
  const { configValid, isLoading } = useConfigValidation();

  if (isLoading) {
    return <LoadingSpinner message="Checking configuration..." />;
  }

  return (
    <ErrorBoundary>
      <MainLayout activeTab={activeTab} setActiveTab={setActiveTab} configValid={configValid}>
        {!configValid && <ConfigWarning />}
        <TabContent activeTab={activeTab} />
      </MainLayout>
    </ErrorBoundary>
  );
};

// Main App Component with Router
const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Documentation routes - redirect to GitHub */}
          {DOC_ROUTES.map(({ path, redirectPath }) => (
            <Route key={path} path={path} element={<DocumentationRedirect path={redirectPath} />} />
          ))}

          {/* Authentication routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* AI Dashboard routes */}
          <Route
            path="/ai-dashboard"
            element={
              <ProtectedRoute>
                <AIDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-enhanced"
            element={
              <ProtectedRoute>
                <EnhancedAIDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-demo"
            element={
              <ProtectedRoute>
                <AIDemo />
              </ProtectedRoute>
            }
          />

          {/* Legacy main app route (redirects to dashboard if authenticated) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback for old routes */}
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
