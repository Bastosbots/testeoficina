
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserManagement from '@/components/UserManagement';

const UserManagementPage = () => {
  const { profile } = useAuth();

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;
