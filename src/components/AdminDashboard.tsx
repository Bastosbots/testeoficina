
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LogOut, 
  FileText, 
  Car, 
  Users, 
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useChecklists, useDeleteChecklist } from "@/hooks/useChecklists";
import UserManagement from "@/components/UserManagement";
import InviteTokenManager from "@/components/InviteTokenManager";
import ChecklistViewer from "@/components/ChecklistViewer";
import EditChecklistForm from "@/components/EditChecklistForm";

interface AdminDashboardProps {
  currentUser: string;
  onLogout: () => void;
}

const AdminDashboard = ({ currentUser }: AdminDashboardProps) => {
  const { signOut } = useAuth();
  const { data: checklists = [] } = useChecklists();
  const deleteChecklistMutation = useDeleteChecklist();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMechanic, setFilterMechanic] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'view-checklist' | 'edit-checklist'>('dashboard');

  console.log('AdminDashboard renderizado para:', currentUser);
  console.log('Checklists carregados:', checklists);

  const stats = {
    totalChecklists: checklists.length,
    completed: checklists.filter(c => (c as any).status === 'Concluído').length,
    pending: checklists.filter(c => (c as any).status === 'Pendente' || !(c as any).status).length,
    inProgress: checklists.filter(c => (c as any).status === 'Em Andamento').length,
    totalVehicles: new Set(checklists.map(c => c.plate)).size
  };

  const handleViewChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
    setActiveView('view-checklist');
  };

  const handleEditChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
    setActiveView('edit-checklist');
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este checklist? Esta ação não pode ser desfeita.')) {
      try {
        await deleteChecklistMutation.mutateAsync(checklistId);
      } catch (error) {
        console.error('Error deleting checklist:', error);
      }
    }
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedChecklist(null);
  };

  const handleChecklistSaved = () => {
    handleBackToDashboard();
  };

  const handleGeneratePDF = (checklistId: string) => {
    toast.success(`PDF do checklist gerado com sucesso!`);
    // Implementar geração de PDF
  };

  const handleExportAll = () => {
    toast.success('Exportação de todos os checklists iniciada!');
    // Implementar exportação
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const filteredChecklists = checklists.filter(checklist => {
    const vehicleName = checklist.vehicle_name || '';
    const mechanicName = checklist.profiles?.full_name || '';
    const checklistStatus = (checklist as any).status || 'Pendente';
    const matchesSearch = vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mechanicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || checklist.created_at?.startsWith(filterDate);
    const matchesMechanic = filterMechanic === 'all' || mechanicName === filterMechanic;
    const matchesStatus = filterStatus === 'all' || checklistStatus === filterStatus;
    
    return matchesSearch && matchesDate && matchesMechanic && matchesStatus;
  });

  // Obter mecânicos únicos para o filtro
  const uniqueMechanics = Array.from(new Set(
    checklists.map(c => c.profiles?.full_name).filter(Boolean)
  ));

  // Obter status únicos para o filtro
  const uniqueStatuses = Array.from(new Set(
    checklists.map(c => (c as any).status || 'Pendente').filter(Boolean)
  ));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Concluído': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (activeView === 'view-checklist') {
    return (
      <ChecklistViewer 
        checklist={selectedChecklist}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (activeView === 'edit-checklist') {
    return (
      <EditChecklistForm
        checklist={selectedChecklist}
        onBack={handleBackToDashboard}
        onSave={handleChecklistSaved}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground">Bem-vindo, {currentUser}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleExportAll} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Todos
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Checklists</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChecklists}</div>
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
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veículos Únicos</CardTitle>
              <Car className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalVehicles}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="checklists" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
          </TabsList>
          
          <TabsContent value="checklists" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por veículo, mecânico, placa ou cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full"
                  />
                  
                  <Select value={filterMechanic} onValueChange={setFilterMechanic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por mecânico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os mecânicos</SelectItem>
                      {uniqueMechanics.map((mechanic) => (
                        <SelectItem key={mechanic} value={mechanic}>{mechanic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {uniqueStatuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Checklists Table */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Checklists ({filteredChecklists.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredChecklists.map((checklist) => {
                    const checklistStatus = (checklist as any).status || 'Pendente';
                    return (
                      <div key={checklist.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Car className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold text-foreground">
                                {checklist.vehicle_name} - {checklist.plate}
                              </h3>
                              <Badge variant={checklist.priority === 'Alta' ? 'destructive' : 'secondary'}>
                                {checklist.priority}
                              </Badge>
                              <Badge className={getStatusColor(checklistStatus)}>
                                {checklistStatus}
                              </Badge>
                              {checklist.video_url && (
                                <Badge variant="outline" className="text-primary border-primary/20">
                                  Com Vídeo
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div>
                                <strong>Mecânico:</strong> {checklist.profiles?.full_name || 'Não informado'}
                              </div>
                              <div>
                                <strong>Data:</strong> {new Date(checklist.created_at).toLocaleDateString('pt-BR')}
                              </div>
                              <div>
                                <strong>Cliente:</strong> {checklist.customer_name}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mt-2">
                              <div>
                                <strong>OS:</strong> {checklist.service_order}
                              </div>
                              {checklist.completed_at && (
                                <div>
                                  <strong>Concluído:</strong> {new Date(checklist.completed_at).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                            
                            {checklist.general_observations && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                <strong>Observações:</strong> {checklist.general_observations}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewChecklist(checklist)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Ver
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleEditChecklist(checklist)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGeneratePDF(checklist.id)}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              PDF
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteChecklist(checklist.id)}
                              className="flex items-center gap-1"
                              disabled={deleteChecklistMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              Deletar
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredChecklists.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum checklist encontrado com os filtros aplicados.</p>
                      {checklists.length === 0 && (
                        <p className="mt-2">Nenhum checklist foi criado ainda.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="invites">
            <InviteTokenManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
