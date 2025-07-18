
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, ClipboardCheck, Calculator, Settings, Shield, Clock, AlertCircle, Eye, Edit } from "lucide-react";
import { useProfiles } from "@/hooks/useProfiles";
import { useChecklists } from "@/hooks/useChecklists";
import { useBudgets } from "@/hooks/useBudgets";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import UserManagement from "./UserManagement";
import SecurityAuditLog from "./SecurityAuditLog";
import BudgetStatus from "./BudgetStatus";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: profiles = [] } = useProfiles();
  const { data: checklists = [] } = useChecklists();
  const { data: budgets = [] } = useBudgets();

  const totalMechanics = profiles.filter(p => p.role === 'mechanic').length;
  const completedChecklists = checklists.filter(c => c.status === 'Concluído').length;
  const inProgressChecklists = checklists.filter(c => c.status === 'Em Andamento');
  const totalBudgets = budgets.length;
  const pendingBudgets = budgets.filter(b => b.status === 'Pendente');

  const handleViewChecklist = (checklistId: string) => {
    console.log('Viewing checklist:', checklistId);
    navigate(`/all-checklists?view=${checklistId}`);
  };

  const handleEditChecklist = (checklistId: string) => {
    console.log('Editing checklist:', checklistId);
    navigate(`/all-checklists?edit=${checklistId}`);
  };

  const handleViewBudget = (budgetId: string) => {
    console.log('Viewing budget:', budgetId);
    navigate(`/budgets?view=${budgetId}`);
  };

  const handleEditBudget = (budgetId: string) => {
    console.log('Editing budget:', budgetId);
    navigate(`/budgets?edit=${budgetId}`);
  };

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
            <div className="text-2xl font-bold text-orange-700">{inProgressChecklists.length}</div>
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
            <div className="text-2xl font-bold text-red-700">{pendingBudgets.length}</div>
            <p className="text-xs text-red-600">
              Orçamentos aguardando aprovação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Checklists Em Andamento */}
      {inProgressChecklists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Checklists Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Mecânico</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inProgressChecklists.map((checklist) => (
                  <TableRow key={checklist.id}>
                    <TableCell className="font-medium">{checklist.customer_name}</TableCell>
                    <TableCell>{checklist.vehicle_name}</TableCell>
                    <TableCell>{checklist.plate}</TableCell>
                    <TableCell>{checklist.profiles?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      {format(new Date(checklist.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewChecklist(checklist.id)}
                          title="Visualizar checklist"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditChecklist(checklist.id)}
                          title="Editar checklist"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Orçamentos Pendentes */}
      {pendingBudgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Orçamentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBudgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.budget_number}</TableCell>
                    <TableCell>{budget.customer_name}</TableCell>
                    <TableCell>{budget.vehicle_name || 'N/A'}</TableCell>
                    <TableCell>R$ {budget.final_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <BudgetStatus budget={budget} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewBudget(budget.id)}
                          title="Visualizar orçamento"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditBudget(budget.id)}
                          title="Editar orçamento"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* User Management */}
      <UserManagement />

      {/* Security Audit Log */}
      <SecurityAuditLog />
    </div>
  );
};

export default AdminDashboard;
