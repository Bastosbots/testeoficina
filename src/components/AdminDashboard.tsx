import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, ClipboardCheck, Calculator, Settings, Shield, Clock, AlertCircle, Eye, Edit, UserCog, CheckCircle } from "lucide-react";
import { useProfiles } from "@/hooks/useProfiles";
import { useChecklists, useUpdateChecklist } from "@/hooks/useChecklists";
import { useBudgets } from "@/hooks/useBudgets";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import BudgetStatus from "./BudgetStatus";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: profiles = [] } = useProfiles();
  const { data: checklists = [], refetch: refetchChecklists } = useChecklists();
  const { data: budgets = [] } = useBudgets();
  const updateChecklistMutation = useUpdateChecklist();

  const totalMechanics = profiles.filter(p => p.role === 'mechanic').length;
  const completedChecklists = checklists.filter(c => c.status === 'Concluído').length;
  const inProgressChecklists = checklists.filter(c => c.status === 'Em Andamento');
  const totalBudgets = budgets.length;
  const pendingBudgets = budgets.filter(b => b.status === 'Pendente');

  const handleViewChecklist = (checklistId: string) => {
    console.log('Navigating to view checklist:', checklistId);
    navigate(`/checklists?view=${checklistId}`);
  };

  const handleEditChecklist = (checklistId: string) => {
    console.log('Navigating to edit checklist:', checklistId);
    navigate(`/checklists?edit=${checklistId}`);
  };

  const handleCompleteChecklist = async (checklistId: string) => {
    try {
      console.log('Completing checklist:', checklistId);
      await updateChecklistMutation.mutateAsync({
        id: checklistId,
        status: 'Concluído',
        completed_at: new Date().toISOString()
      });
      
      // Force refetch to ensure immediate UI update
      await refetchChecklists();
      toast.success('Checklist concluído com sucesso!');
    } catch (error) {
      console.error('Error completing checklist:', error);
      toast.error('Erro ao concluir checklist');
    }
  };

  const handleViewBudget = (budgetId: string) => {
    console.log('Navigating to view budget:', budgetId);
    navigate(`/budgets?view=${budgetId}`);
  };

  const handleEditBudget = (budgetId: string) => {
    console.log('Navigating to edit budget:', budgetId);
    navigate(`/budgets?edit=${budgetId}`);
  };

  const handleUserManagement = () => {
    navigate('/user-management');
  };

  return (
    <div className="space-y-4 lg:zoom-90">
      <div className="flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl font-bold">Dashboard Administrativo</h1>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleUserManagement}
            className="flex items-center gap-2 transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs"
          >
            <UserCog className="h-3 w-3" />
            Usuários
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Acesso Administrativo
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total de Mecânicos</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg font-bold">{totalMechanics}</div>
            <p className="text-[10px] text-muted-foreground">
              +{profiles.length - totalMechanics} admin(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Checklists Concluídos</CardTitle>
            <ClipboardCheck className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg font-bold">{completedChecklists}</div>
            <p className="text-[10px] text-muted-foreground">
              Total de checklists finalizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total de Orçamentos</CardTitle>
            <Calculator className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg font-bold">{totalBudgets}</div>
            <p className="text-[10px] text-muted-foreground">
              Total de orçamentos criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Sistema</CardTitle>
            <Settings className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg font-bold text-green-600">Ativo</div>
            <p className="text-[10px] text-muted-foreground">
              Todos os sistemas operacionais
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-orange-800">Checklists Em Andamento</CardTitle>
            <Clock className="h-3 w-3 text-orange-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg font-bold text-orange-700">{inProgressChecklists.length}</div>
            <p className="text-[10px] text-orange-600">
              Checklists que necessitam atenção
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-red-800">Orçamentos Pendentes</CardTitle>
            <AlertCircle className="h-3 w-3 text-red-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg font-bold text-red-700">{pendingBudgets.length}</div>
            <p className="text-[10px] text-red-600">
              Orçamentos aguardando aprovação
            </p>
          </CardContent>
        </Card>
      </div>

      {inProgressChecklists.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-600" />
              Checklists Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs h-8">Cliente</TableHead>
                  <TableHead className="text-xs h-8">Veículo</TableHead>
                  <TableHead className="text-xs h-8">Placa</TableHead>
                  <TableHead className="text-xs h-8">Mecânico</TableHead>
                  <TableHead className="text-xs h-8">Data</TableHead>
                  <TableHead className="text-xs h-8">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inProgressChecklists.map((checklist) => (
                  <TableRow key={checklist.id}>
                    <TableCell className="text-xs font-medium py-2">{checklist.customer_name}</TableCell>
                    <TableCell className="text-xs py-2">{checklist.vehicle_name}</TableCell>
                    <TableCell className="text-xs py-2">{checklist.plate}</TableCell>
                    <TableCell className="text-xs py-2">{checklist.mechanic?.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-xs py-2">
                      {format(new Date(checklist.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewChecklist(checklist.id)}
                          title="Visualizar checklist"
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditChecklist(checklist.id)}
                          title="Editar checklist"
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleCompleteChecklist(checklist.id)}
                          title="Concluir checklist"
                          disabled={updateChecklistMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 h-6 w-6 p-0"
                        >
                          <CheckCircle className="h-3 w-3" />
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

      {pendingBudgets.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Orçamentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs h-8">Mecânico</TableHead>
                  <TableHead className="text-xs h-8">Cliente</TableHead>
                  <TableHead className="text-xs h-8">Veículo</TableHead>
                  <TableHead className="text-xs h-8">Valor Total</TableHead>
                  <TableHead className="text-xs h-8">Data</TableHead>
                  <TableHead className="text-xs h-8">Status</TableHead>
                  <TableHead className="text-xs h-8">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBudgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell className="text-xs font-medium py-2">{budget.mechanic?.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-xs py-2">{budget.customer_name}</TableCell>
                    <TableCell className="text-xs py-2">{budget.vehicle_name || 'N/A'}</TableCell>
                    <TableCell className="text-xs py-2">R$ {budget.final_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-xs py-2">
                      {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="py-2">
                      <BudgetStatus budget={budget} />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewBudget(budget.id)}
                          title="Visualizar orçamento"
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditBudget(budget.id)}
                          title="Editar orçamento"
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
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
    </div>
  );
};

export default AdminDashboard;
