
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/AdminDashboard';
import MechanicDashboard from '@/components/MechanicDashboard';

const Dashboard = () => {
  const { profile } = useAuth();

  const handleLogout = async () => {
    // This will be handled by the auth context through the sidebar
  };

  return profile?.role === 'admin' ? (
    <AdminDashboard 
      currentUser={profile.full_name || 'Admin'} 
      onLogout={handleLogout}
    />
  ) : (
    <MechanicDashboard 
      currentUser={profile.full_name || 'Mecânico'} 
      onLogout={handleLogout}
    />
  );
};

export default Dashboard;
