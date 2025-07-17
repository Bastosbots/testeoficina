
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/AdminDashboard';
import MechanicDashboard from '@/components/MechanicDashboard';

const Dashboard = () => {
  const { profile } = useAuth();

  return profile?.role === 'admin' ? (
    <AdminDashboard />
  ) : (
    <MechanicDashboard />
  );
};

export default Dashboard;
