import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyLeads from './pages/MyLeads';
import LeadDetail from './pages/LeadDetail';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Products from './pages/Products';
import AdminSettings from './pages/AdminSettings';

// --- Loading Skeleton ---
const LoadingSkeleton = () => (
  <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-950">
    <div className="hidden md:block w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-4 space-y-4">
      <div className="h-12 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse mb-8" />
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-10 w-full bg-gray-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
      ))}
    </div>
    <div className="flex-1 p-8 space-y-6">
      <div className="flex justify-between items-center">
         <div className="h-8 w-48 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
         <div className="h-10 w-10 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
           <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
      <div className="h-64 w-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 animate-pulse" />
    </div>
  </div>
);

// --- Protected Route Wrapper ---
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="leads" element={<MyLeads />} />
              <Route path="leads/:id" element={<LeadDetail />} />
              <Route path="products" element={<Products />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="admin" element={<AdminSettings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;