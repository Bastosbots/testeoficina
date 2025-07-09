
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, FileText, Car, Clock } from "lucide-react";
import { toast } from "sonner";
import ChecklistForm from "@/components/ChecklistForm";

interface MechanicDashboardProps {
  currentUser: string;
  onLogout: () => void;
}

const MechanicDashboard = ({ currentUser, onLogout }: MechanicDashboardProps) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'new-checklist'>('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  // Dados mockados dos checklists pendentes
  const pendingChecklists = [
    {
      id: 1,
      vehicle: 'Honda Civic',
      plate: 'ABC-1234',
      customer: 'Maria Silva',
      serviceOrder: 'OS-001',
      priority: 'Alta',
      scheduledTime: '09:00'
    },
    {
      id: 2,
      vehicle: 'Toyota Corolla',
      plate: 'XYZ-5678',
      customer: 'João Santos',
      serviceOrder: 'OS-002',
      priority: 'Média',
      scheduledTime: '14:30'
    }
  ];

  const recentChecklists = [
    {
      id: 1,
      vehicle: 'Ford Focus - DEF-9012',
      date: '2024-01-13',
      status: 'Concluído',
      items: 5
    },
    {
      id: 2,
      vehicle: 'Chevrolet Onix - GHI-3456',
      date: '2024-01-12',
      status: 'Concluído',
      items: 7
    }
  ];

  const handleStartChecklist = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setActiveView('new-checklist');
    toast.success(`Iniciando checklist para ${vehicle.vehicle} - ${vehicle.plate}`);
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedVehicle(null);
  };

  if (activeView === 'new-checklist') {
    return (
      <ChecklistForm 
        vehicle={selectedVehicle}
        mechanic={currentUser}
        onBack={handleBackToDashboard}
        onComplete={() => {
          handleBackToDashboard();
          toast.success('Checklist salvo com sucesso!');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Painel do Mecânico</h1>
            <p className="text-slate-600">Bem-vindo, {currentUser}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setActiveView('new-checklist')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Novo Checklist
            </Button>
            <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes Hoje</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingChecklists.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{recentChecklists.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
              <Car className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">98%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Checklists Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Checklists Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingChecklists.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                          <Car className="h-4 w-4 text-blue-600" />
                          {item.vehicle} - {item.plate}
                        </h3>
                        <p className="text-sm text-slate-600">Cliente: {item.customer}</p>
                      </div>
                      <Badge 
                        variant={item.priority === 'Alta' ? 'destructive' : 'secondary'}
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        <p><strong>OS:</strong> {item.serviceOrder}</p>
                        <p><strong>Horário:</strong> {item.scheduledTime}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleStartChecklist(item)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Iniciar
                      </Button>
                    </div>
                  </div>
                ))}
                
                {pendingChecklists.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum checklist pendente no momento.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Checklists Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Concluídos Recentemente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentChecklists.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Car className="h-4 w-4 text-blue-600" />
                        {item.vehicle}
                      </h3>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {item.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-slate-600">
                      <p><strong>Data:</strong> {new Date(item.date).toLocaleDateString('pt-BR')}</p>
                      <p><strong>Itens verificados:</strong> {item.items}</p>
                    </div>
                  </div>
                ))}
                
                {recentChecklists.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum checklist concluído ainda.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
