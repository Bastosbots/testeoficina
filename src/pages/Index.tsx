
import React from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useSystemSettings } from '@/hooks/useSystemSettings';
import AdminDashboard from "@/components/AdminDashboard";
import MechanicDashboard from "@/components/MechanicDashboard";
import Auth from "./Auth";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const { data: settings } = useSystemSettings();

  console.log('Index component - loading:', loading, 'user:', user, 'profile:', profile);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('Redirecting to Auth - no user or profile');
    return <Auth />;
  }

  console.log('User role:', profile.role);

  const handleLogout = async () => {
    // This will be handled by the auth context
  };

  return profile.role === 'admin' ? (
    <AdminDashboard 
      currentUser={profile.full_name || 'Admin'} 
      onLogout={handleLogout}
      systemSettings={settings}
    />
  ) : (
    <MechanicDashboard 
      currentUser={profile.full_name || 'Mecânico'} 
      onLogout={handleLogout}
      systemSettings={settings}
    />
  );
};

export default Index;
