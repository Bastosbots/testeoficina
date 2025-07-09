
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LogOut, 
  FileText, 
  Car, 
  Users, 
  Download,
  Filter,
  Search,
  Calendar,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardProps {
  currentUser: string;
  onLogout: () => void;
}

const AdminDashboard = ({ currentUser, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMechanic, setFilterMechanic] = useState('');

  // Dados mockados para demonstração
  const checklists = [
    {
      id: 1,
      vehicle: 'Honda Civic - ABC-1234',
      mechanic: 'João Silva',
      date: '2024-01-15',
      status: 'Concluído',
      items: ['Óleo', 'Freios', 'Pneus'],
      observations: 'Veículo em bom estado geral',
      hasVideo: true
    },
    {
      id: 2,
      vehicle: 'Toyota Corolla - XYZ-5678',
      mechanic: 'Maria Santos',
      date: '2024-01-14',
      status: 'Pendente',
      items: ['Bateria', 'Suspensão'],
      observations: 'Necessita troca de bateria',
      hasVideo: false
    },
    {
      id: 3,
      vehicle: 'Ford Focus - DEF-9012',
      mechanic: 'João Silva',
      date: '2024-01-13',
      status: 'Concluído',
      items: ['Óleo', 'Filtros', 'Velas'],
      observations: 'Manutenção preventiva realizada',
      hasVideo: true
    }
  ];

  const stats = {
    totalChecklists: checklists.length,
    completed: checklists.filter(c => c.status === 'Concluído').length,
    pending: checklists.filter(c => c.status === 'Pendente').length,
    mechanics: 2
  };

  const handleGeneratePDF = (checklistId: number) => {
    toast.success(`PDF do checklist #${checklistId} gerado com sucesso!`);
    // Aqui seria implementada a geração real do PDF
  };

  const handleExportAll = () => {
    toast.success('Exportação de todos os checklists iniciada!');
    // Aqui seria implementada a exportação completa
  };

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch = checklist.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.mechanic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || checklist.date === filterDate;
    const matchesMechanic = !filterMechanic || checklist.mechanic === filterMechanic;
    
    return matchesSearch && matchesDate && matchesMechanic;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Painel Administrativo</h1>
            <p className="text-slate-600">Bem-vindo, {currentUser}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleExportAll} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Todos
            </Button>
            <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mecânicos Ativos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.mechanics}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por veículo ou mecânico..."
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
                  <SelectItem value="">Todos os mecânicos</SelectItem>
                  <SelectItem value="João Silva">João Silva</SelectItem>
                  <SelectItem value="Maria Santos">Maria Santos</SelectItem>
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
              {filteredChecklists.map((checklist) => (
                <div key={checklist.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Car className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800">{checklist.vehicle}</h3>
                        <Badge variant={checklist.status === 'Concluído' ? 'default' : 'secondary'}>
                          {checklist.status}
                        </Badge>
                        {checklist.hasVideo && (
                          <Badge variant="outline" className="text-purple-600 border-purple-200">
                            Com Vídeo
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div>
                          <strong>Mecânico:</strong> {checklist.mechanic}
                        </div>
                        <div>
                          <strong>Data:</strong> {new Date(checklist.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div>
                          <strong>Itens:</strong> {checklist.items.join(', ')}
                        </div>
                      </div>
                      
                      {checklist.observations && (
                        <div className="mt-2 text-sm text-slate-600">
                          <strong>Observações:</strong> {checklist.observations}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info(`Visualizando checklist #${checklist.id}`)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleGeneratePDF(checklist.id)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredChecklists.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum checklist encontrado com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
