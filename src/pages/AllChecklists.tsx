import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Eye, Edit, Search, Filter, Calendar, User, Car } from 'lucide-react';
import { useChecklists } from '@/hooks/useChecklists';
import { useAuth } from '@/hooks/useAuth';
import ChecklistViewer from '@/components/ChecklistViewer';
import EditChecklistForm from '@/components/EditChecklistForm';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const AllChecklists = () => {
  const { data: checklists = [] } = useChecklists();
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeView, setActiveView] = useState<'list' | 'view' | 'edit'>('list');
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);

  // Handle URL parameters
  useEffect(() => {
    const viewId = searchParams.get('view');
    const editId = searchParams.get('edit');

    if (viewId) {
      const checklist = checklists.find(c => c.id === viewId);
      if (checklist) {
        setSelectedChecklist(checklist);
        setActiveView('view');
      }
    } else if (editId) {
      const checklist = checklists.find(c => c.id === editId);
      if (checklist) {
        // Verificar se o usuário pode editar
        if (profile?.role !== 'admin' && checklist.mechanic_id !== profile?.id) {
          toast.error('Você só pode editar seus próprios checklists');
          setSearchParams({});
          return;
        }
        setSelectedChecklist(checklist);
        setActiveView('edit');
      }
    }
  }, [searchParams, checklists, profile]);

  // Filtrar checklists baseado na busca e filtros
  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch = 
      checklist.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && checklist.status === 'Concluído') ||
      (statusFilter === 'in-progress' && checklist.status === 'Em Andamento') ||
      (statusFilter === 'cancelled' && checklist.status === 'Cancelado');

    const matchesPriority = priorityFilter === 'all' || checklist.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
    setActiveView('view');
    setSearchParams({ view: checklist.id });
  };

  const handleEditChecklist = (checklist: any) => {
    // Verificar se o usuário pode editar
    if (profile?.role !== 'admin' && checklist.mechanic_id !== profile?.id) {
      toast.error('Você só pode editar seus próprios checklists');
      return;
    }
    setSelectedChecklist(checklist);
    setActiveView('edit');
    setSearchParams({ edit: checklist.id });
  };

  const handleBackToList = () => {
    setActiveView('list');
    setSelectedChecklist(null);
    setSearchParams({});
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'Em Andamento':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
      case 'Cancelado':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variant = priority === 'Alta' ? 'destructive' : 
                   priority === 'Média' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{priority}</Badge>;
  };

  if (activeView === 'view') {
    return (
      <ChecklistViewer 
        checklist={selectedChecklist}
        onBack={handleBackToList}
      />
    );
  }

  if (activeView === 'edit') {
    return (
      <EditChecklistForm 
        checklist={selectedChecklist}
        onBack={handleBackToList}
        onSave={() => {
          handleBackToList();
          toast.success('Checklist atualizado com sucesso!');
        }}
      />
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Todos os Checklists</h1>
          <p className="text-muted-foreground">Arquivo completo de todos os checklists do sistema</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{filteredChecklists.length} de {checklists.length} checklists</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por veículo, placa, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checklists List */}
      <div className="grid gap-4">
        {filteredChecklists.map((checklist) => (
          <Card key={checklist.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      {checklist.vehicle_name} - {checklist.plate}
                    </h3>
                    <div className="flex gap-2">
                      {getStatusBadge(checklist.status)}
                      {getPriorityBadge(checklist.priority)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span><strong>Cliente:</strong> {checklist.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span><strong>Data:</strong> {new Date(checklist.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  {checklist.profiles && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Mecânico:</strong> {checklist.profiles.full_name}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 lg:flex-col lg:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewChecklist(checklist)}
                    className="flex items-center gap-1 flex-1 lg:flex-none"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="lg:hidden">Ver</span>
                    <span className="hidden lg:inline">Visualizar</span>
                  </Button>
                  
                  {(profile?.role === 'admin' || checklist.mechanic_id === profile?.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditChecklist(checklist)}
                      className="flex items-center gap-1 flex-1 lg:flex-none"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="lg:hidden">Editar</span>
                      <span className="hidden lg:inline">Editar</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredChecklists.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum checklist encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Tente ajustar os filtros para encontrar o que procura.'
                  : 'Ainda não há checklists cadastrados no sistema.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AllChecklists;
