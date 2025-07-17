import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LogOut, 
  FileText, 
  Users, 
  Eye,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useChecklists } from '@/hooks/useChecklists';
import ChecklistViewer from './ChecklistViewer';
import BudgetViewer from './BudgetViewer';
import UserManagement from './UserManagement';
import InviteTokenManager from './InviteTokenManager';
import { useBudgets } from '@/hooks/useBudgets';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { data: checklists, isLoading: checklistsLoading } = useChecklists();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { signOut } = useAuth();
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showInviteTokens, setShowInviteTokens] = useState(false);
  const [checklistViewerOpen, setChecklistViewerOpen] = useState(false);
  const [budgetViewerOpen, setBudgetViewerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeView, setActiveView] = useState<'checklists' | 'budgets'>('checklists');

  if (checklistsLoading || budgetsLoading) {
    return (
      <div className="lg:zoom-90 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    totalChecklists: checklists?.length || 0,
    completed: checklists?.filter(c => (c as any).status === 'Concluído').length || 0,
    inProgress: checklists?.filter(c => (c as any).status === 'Em Andamento').length || 0,
    cancelled: checklists?.filter(c => (c as any).status === 'Cancelado').length || 0
  };

  const handleViewChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
    setChecklistViewerOpen(true);
  };

  const handleViewBudget = (budget: any) => {
    setSelectedBudget(budget);
    setBudgetViewerOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-500 text-white border-green-500';
      case 'Em Andamento':
        return 'bg-blue-500 text-white border-blue-500';
      case 'Pendente':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'Cancelado':
        return 'bg-red-500 text-white border-red-500';
      default:
        return 'bg-gray-500 text-white border-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredChecklists = checklists?.filter(checklist => {
    const matchesSearch = searchTerm === '' || 
      (checklist as any).customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (checklist as any).vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (checklist as any).plate?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || (checklist as any).status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredBudgets = budgets?.filter(budget => {
    const matchesSearch = searchTerm === '' || 
      budget.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.vehicle_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.budget_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || budget.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (showUserManagement) {
    return <UserManagement onBack={() => setShowUserManagement(false)} />;
  }

  if (showInviteTokens) {
    return <InviteTokenManager onBack={() => setShowInviteTokens(false)} />;
  }

  return (
    <div className="lg:zoom-90 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-sm text-gray-600">Visão geral completa do sistema</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInviteTokens(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Tokens de Convite
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserManagement(true)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Usuários
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Checklists</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalChecklists}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <FileText className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <Button
              variant={activeView === 'checklists' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('checklists')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Checklists
            </Button>
            <Button
              variant={activeView === 'budgets' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('budgets')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Orçamentos
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {activeView === 'checklists' ? 'Todos os Checklists' : 'Todos os Orçamentos'}
            </CardTitle>
            <CardDescription>
              {activeView === 'checklists' 
                ? 'Visualize e gerencie todos os checklists do sistema'
                : 'Visualize e gerencie todos os orçamentos do sistema'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder={activeView === 'checklists' 
                    ? "Buscar por cliente, veículo ou placa..." 
                    : "Buscar por cliente, veículo, placa ou número do orçamento..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Status</TableHead>
                    {activeView === 'checklists' && <TableHead>Prioridade</TableHead>}
                    {activeView === 'budgets' && <TableHead>Número</TableHead>}
                    {activeView === 'budgets' && <TableHead>Valor Final</TableHead>}
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeView === 'checklists' ? (
                    filteredChecklists?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Nenhum checklist encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredChecklists?.map((checklist: any) => (
                        <TableRow key={checklist.id}>
                          <TableCell className="font-medium">{checklist.customer_name}</TableCell>
                          <TableCell>{checklist.vehicle_name}</TableCell>
                          <TableCell className="font-mono">{checklist.plate}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(checklist.status)}>
                              {checklist.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityColor(checklist.priority)}>
                              {checklist.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(checklist.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewChecklist(checklist)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Visualizar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  ) : (
                    filteredBudgets?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          Nenhum orçamento encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBudgets?.map((budget) => (
                        <TableRow key={budget.id}>
                          <TableCell className="font-medium">{budget.customer_name}</TableCell>
                          <TableCell>{budget.vehicle_name || '-'}</TableCell>
                          <TableCell className="font-mono">{budget.vehicle_plate || '-'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(budget.status)}>
                              {budget.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">{budget.budget_number}</TableCell>
                          <TableCell className="font-medium">
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(budget.final_amount)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewBudget(budget)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Visualizar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        {checklistViewerOpen && selectedChecklist && (
          <ChecklistViewer
            checklist={selectedChecklist}
            onBack={() => setChecklistViewerOpen(false)}
          />
        )}

        {budgetViewerOpen && selectedBudget && (
          <BudgetViewer
            budget={selectedBudget}
            onBack={() => setBudgetViewerOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
