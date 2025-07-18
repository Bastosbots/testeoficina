
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users, 
  FileText, 
  DollarSign, 
  Eye,
  Calendar,
  UserCog
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfiles } from "@/hooks/useProfiles";
import { useChecklists, useUpdateChecklist } from "@/hooks/useChecklists";
import { useBudgets } from "@/hooks/useBudgets";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import BudgetStatus from "./BudgetStatus";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: profiles = [] } = useProfiles();
  const { data: checklists = [], refetch: refetchChecklists } = useChecklists();
  const { data: budgets = [], refetch: refetchBudgets } = useBudgets();
  const updateChecklistMutation = useUpdateChecklist();

  // Calculate statistics
  const totalUsers = profiles.length;
  const totalChecklists = checklists.length;
  const pendingChecklists = checklists.filter(c => c.status === 'Pendente').length;
  const completedChecklists = checklists.filter(c => c.status === 'Concluído').length;
  const totalBudgets = budgets.length;

  const handleViewChecklist = (checklistId: string) => {
    navigate(`/checklists?view=${checklistId}`);
  };

  const handleViewBudget = (budgetId: string) => {
    navigate(`/budgets?view=${budgetId}`);
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
      await refetchBudgets();
      toast.success('Checklist concluído com sucesso!');
    } catch (error) {
      console.error('Error completing checklist:', error);
      toast.error('Erro ao concluir checklist');
    }
  };

  const handleUserManagement = () => {
    navigate('/user-management');
  };

  return (
    <div className="space-y-6 p-6 relative">
      {/* Botão de gerenciamento de usuários no canto superior direito */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleUserManagement}
        className="absolute top-4 right-4 flex items-center gap-2"
      >
        <UserCog className="h-4 w-4" />
        Usuários
      </Button><br></br>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Checklists
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChecklists}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Checklists Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingChecklists}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Checklists Concluídos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedChecklists}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Orçamentos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudgets}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklists Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Mecânico</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklists.slice(0, 5).map((checklist) => (
                <TableRow key={checklist.id}>
                  <TableCell>
                    <span className="font-medium">
                      {checklist.vehicle_name}
                    </span>
                  </TableCell>
                  <TableCell>{checklist.customer_name}</TableCell>
                  <TableCell>{checklist.mechanic?.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={checklist.status === 'Concluído' ? 'default' : checklist.status === 'Em Andamento' ? 'secondary' : 'outline'}>
                      {checklist.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(checklist.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewChecklist(checklist.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    {checklist.status === 'Em Andamento' && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => handleCompleteChecklist(checklist.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mecânico</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.slice(0, 5).map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">{budget.mechanic?.full_name || 'N/A'}</TableCell>
                  <TableCell>{budget.customer_name}</TableCell>
                  <TableCell>R$ {budget.final_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <BudgetStatus budget={budget} />
                  </TableCell>
                  <TableCell>{format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewBudget(budget.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
