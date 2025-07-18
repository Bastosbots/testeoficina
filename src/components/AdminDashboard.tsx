
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Calculator, Settings, Shield, Clock, AlertCircle } from "lucide-react";
import { useProfiles } from "@/hooks/useProfiles";
import { useChecklists } from "@/hooks/useChecklists";
import { useBudgets } from "@/hooks/useBudgets";
import UserManagement from "./UserManagement";
import SecurityAuditLog from "./SecurityAuditLog";

const AdminDashboard = () => {
  const { data: profiles = [] } = useProfiles();
  const { data: checklists = [] } = useChecklists();
  const { data: budgets = [] } = useBudgets();

  const totalMechanics = profiles.filter(p => p.role === 'mechanic').length;
  const completedChecklists = checklists.filter(c => c.status === 'Concluído').length;
  const inProgressChecklists = checklists.filter(c => c.status === 'Em Andamento').length;
  const totalBudgets = budgets.length;
  const pendingBudgets = budgets.filter(b => b.status === 'Pendente').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Acesso Administrativo
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mecânicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMechanics}</div>
            <p className="text-xs text-muted-foreground">
              +{profiles.length - totalMechanics} admin(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checklists Concluídos</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedChecklists}</div>
            <p className="text-xs text-muted-foreground">
              Total de checklists finalizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudgets}</div>
            <p className="text-xs text-muted-foreground">
              Total de orçamentos criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <p className="text-xs text-muted-foreground">
              Todos os sistemas operacionais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Cards - Em Andamento e Pendente */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Checklists Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{inProgressChecklists}</div>
            <p className="text-xs text-orange-600">
              Checklists que necessitam atenção
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Orçamentos Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{pendingBudgets}</div>
            <p className="text-xs text-red-600">
              Orçamentos aguardando aprovação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <UserManagement />

      {/* Security Audit Log */}
      <SecurityAuditLog />
    </div>
  );
};

export default AdminDashboard;
