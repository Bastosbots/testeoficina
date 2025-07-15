
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, FileText, Car, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useVehicles } from "@/hooks/useVehicles";
import { useChecklists } from "@/hooks/useChecklists";
import ChecklistForm from "@/components/ChecklistForm";
import ChecklistViewer from "@/components/ChecklistViewer";

interface MechanicDashboardProps {
  currentUser: string;
  onLogout: () => void;
}

const MechanicDashboard = ({ currentUser, onLogout }: MechanicDashboardProps) => {
  const { signOut, user } = useAuth();
  const { data: vehicles = [] } = useVehicles();
  const { data: checklists = [] } = useChecklists();
  const [activeView, setActiveView] = useState<'dashboard' | 'new-checklist' | 'view-checklist'>('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);

  // Filtrar veículos pendentes
  const pendingVehicles = vehicles.filter(v => v.status === 'Pendente');
  
  // Filtrar checklists do mecânico atual
  const myChecklists = checklists.filter(c => c.mechanic_id === user?.id);
  const completedChecklists = myChecklists.filter(c => c.completed_at);
  const pendingChecklists = myChecklists.filter(c => !c.completed_at);

  const handleStartChecklist = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setActiveView('new-checklist');
    toast.success(`Iniciando checklist para ${vehicle.vehicle_name} - ${vehicle.plate}`);
  };

  const handleViewChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
    setActiveView('view-checklist');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedVehicle(null);
    setSelectedChecklist(null);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
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

  if (activeView === 'view-checklist') {
    return (
      <ChecklistViewer 
        checklist={selectedChecklist}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel do Mecânico</h1>
            <p className="text-muted-foreground">Bem-vindo, {currentUser}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setActiveView('new-checklist')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Checklist
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes Hoje</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{pendingVehicles.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meus Concluídos</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{completedChecklists.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meus Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{pendingChecklists.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Veículos</CardTitle>
              <Car className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{vehicles.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Veículos Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Veículos Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <Car className="h-4 w-4 text-primary" />
                          {vehicle.vehicle_name} - {vehicle.plate}
                        </h3>
                        <p className="text-sm text-muted-foreground">Cliente: {vehicle.customer_name}</p>
                      </div>
                      <Badge variant={vehicle.priority === 'Alta' ? 'destructive' : 'secondary'}>
                        {vehicle.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p><strong>OS:</strong> {vehicle.service_order}</p>
                        {vehicle.scheduled_time && (
                          <p><strong>Horário:</strong> {vehicle.scheduled_time}</p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleStartChecklist(vehicle)}
                      >
                        Iniciar
                      </Button>
                    </div>
                  </div>
                ))}
                
                {pendingVehicles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum veículo pendente no momento.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meus Checklists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Meus Checklists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myChecklists.slice(0, 5).map((checklist) => (
                  <div key={checklist.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        {checklist.vehicles?.vehicle_name} - {checklist.vehicles?.plate}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={checklist.completed_at ? "default" : "secondary"}>
                          {checklist.completed_at ? 'Concluído' : 'Pendente'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewChecklist(checklist)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Data:</strong> {new Date(checklist.created_at).toLocaleDateString('pt-BR')}</p>
                      <p><strong>Cliente:</strong> {checklist.vehicles?.customer_name}</p>
                      {checklist.completed_at && (
                        <p><strong>Concluído em:</strong> {new Date(checklist.completed_at).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {myChecklists.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum checklist criado ainda.</p>
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
