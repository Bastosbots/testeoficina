
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, FileText, Clock, Eye, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useChecklists } from "@/hooks/useChecklists";
import CreateChecklistForm from "@/components/CreateChecklistForm";
import ChecklistViewer from "@/components/ChecklistViewer";
import EditChecklistForm from "@/components/EditChecklistForm";

interface MechanicDashboardProps {
  currentUser: string;
  onLogout: () => void;
}

const MechanicDashboard = ({ currentUser, onLogout }: MechanicDashboardProps) => {
  const { signOut, user } = useAuth();
  const { data: checklists = [] } = useChecklists();
  const [activeView, setActiveView] = useState<'dashboard' | 'new-checklist' | 'view-checklist' | 'edit-checklist'>('dashboard');
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);

  // Filtrar checklists do mecânico atual
  const myChecklists = checklists.filter(c => c.mechanic_id === user?.id);
  const completedChecklists = myChecklists.filter(c => c.completed_at);
  const pendingChecklists = myChecklists.filter(c => !c.completed_at);

  const handleViewChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
    setActiveView('view-checklist');
  };

  const handleEditChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
    setActiveView('edit-checklist');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedChecklist(null);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
  };

  if (activeView === 'new-checklist') {
    return (
      <CreateChecklistForm 
        onBack={handleBackToDashboard}
        onComplete={() => {
          handleBackToDashboard();
          toast.success('Checklist criado com sucesso!');
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

  if (activeView === 'edit-checklist') {
    return (
      <EditChecklistForm 
        checklist={selectedChecklist}
        onBack={handleBackToDashboard}
        onSave={() => {
          handleBackToDashboard();
          toast.success('Checklist atualizado com sucesso!');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mobile-text-2xl lg:text-2xl font-bold text-foreground">Painel do Mecânico</h1>
            <p className="mobile-text-sm lg:text-base text-muted-foreground">Bem-vindo, {currentUser}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setActiveView('new-checklist')}
              className="mobile-btn lg:flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Checklist
            </Button>
            <Button variant="outline" onClick={handleLogout} className="mobile-btn lg:flex items-center gap-2">
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
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{pendingChecklists.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{myChecklists.length}</div>
            </CardContent>
          </Card>
        </div>

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
              {myChecklists.map((checklist) => (
                <div key={checklist.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="mobile-text-base lg:text-lg font-semibold text-foreground">
                      {checklist.vehicle_name} - {checklist.plate}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={checklist.priority === 'Alta' ? 'destructive' : 'secondary'}>
                        {checklist.priority}
                      </Badge>
                      <Badge variant={checklist.completed_at ? "default" : "secondary"}>
                        {checklist.completed_at ? 'Concluído' : 'Pendente'}
                      </Badge>
                      
                      {/* Desktop: Botões completos */}
                      <div className="hidden md:flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewChecklist(checklist)}
                          className="mobile-btn-sm lg:flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span className="hidden lg:inline">Ver</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChecklist(checklist)}
                          className="mobile-btn-sm lg:flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span className="hidden lg:inline">Editar</span>
                        </Button>
                      </div>
                      
                      {/* Mobile: Botões compactos */}
                      <div className="md:hidden flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewChecklist(checklist)}
                          className="mobile-btn-sm"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChecklist(checklist)}
                          className="mobile-btn-sm"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop: Informações completas */}
                  <div className="hidden md:block text-sm text-muted-foreground grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>Cliente:</strong> {checklist.customer_name}</p>
                      <p><strong>OS:</strong> {checklist.service_order}</p>
                    </div>
                    <div>
                      <p><strong>Data:</strong> {new Date(checklist.created_at).toLocaleDateString('pt-BR')}</p>
                      {checklist.completed_at && (
                        <p><strong>Concluído:</strong> {new Date(checklist.completed_at).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>

                  {/* Mobile: Apenas informações essenciais */}
                  <div className="md:hidden space-y-1 mobile-text-sm text-muted-foreground">
                    <p><strong>Cliente:</strong> {checklist.customer_name}</p>
                    <p><strong>Data:</strong> {new Date(checklist.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))}
              
              {myChecklists.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum checklist criado ainda.</p>
                  <Button 
                    onClick={() => setActiveView('new-checklist')}
                    className="mt-4"
                  >
                    Criar Primeiro Checklist
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MechanicDashboard;
