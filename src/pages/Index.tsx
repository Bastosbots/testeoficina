
import React from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdminDashboard from "@/components/AdminDashboard";
import MechanicDashboard from "@/components/MechanicDashboard";
import Auth from "./Auth";

const Index = () => {
  const { user, profile, loading } = useAuth();

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
    return <Auth />;
  }

  const handleLogout = async () => {
    // This will be handled by the auth context
  };

  return profile.role === 'admin' ? (
    <AdminDashboard currentUser={profile.full_name || 'Admin'} onLogout={handleLogout} />
  ) : (
    <MechanicDashboard currentUser={profile.full_name || 'Mecânico'} onLogout={handleLogout} />
  );
};

export default Index;
