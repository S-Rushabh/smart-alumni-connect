import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Networking from './pages/Networking';
import Jobs from './pages/Jobs';
import Events from './pages/Events';
import Donations from './pages/Donations';
import Gamification from './pages/Gamification';
import Chat from './pages/Chat';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes wrapped in Layout */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="networking" element={<Networking />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="events" element={<Events />} />
            <Route path="donations" element={<Donations />} />
            <Route path="gamification" element={<Gamification />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
