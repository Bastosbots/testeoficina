
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, FileText, Clock, Eye, Edit, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useChecklists, useUpdateChecklist } from "@/hooks/useChecklists";
import CreateChecklistForm from "@/components/CreateChecklistForm";
import ChecklistViewer from "@/components/ChecklistViewer";
import EditChecklistForm from "@/components/EditChecklistForm";

const MechanicDashboard = () => {
  const { signOut, user, profile } = useAuth();
  const { data: checklists = [] } = useChecklists();
  const updateChecklistMutation = useUpdateChecklist();
  const [activeView, setActiveView] = useState<'dashboard' | 'new-checklist' | 'view-checklist' | 'edit-checklist'>('dashboard');
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);

  // Filtrar checklists do mecânico atual
  const myChecklists = checklists.filter(c => c.mechanic_id === user?.id);
  const completedChecklists = myChecklists.filter(c => c.status === 'Concluído');
  const pendingChecklists = myChecklists.filter(c => c.status === 'Pendente');

  const handleCompleteChecklist = async (checklist: any) => {
    try {
      await updateChecklistMutation.mutateAsync({
        id: checklist.id,
        updateData: {
          status: 'Concluído',
          completed_at: new Date().toISOString()
        }
      });
      toast.success('Checklist concluído com sucesso!');
    } catch (error) {
      console.error('Error completing checklist:', error);
      toast.error('Erro ao concluir checklist');
    }
  };

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
    <div className="min-h-screen bg-background no-horizontal-scroll">
      {/* Header */}
      <header className="bg-card border-b border-border mobile-card-padding lg:px-6 mobile-header-height lg:py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mobile-text-lg lg:text-2xl font-bold text-foreground">Painel do Mecânico</h1>
            <p className="mobile-text-xs lg:text-base text-muted-foreground">Bem-vindo, {profile?.full_name || user?.email}</p>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <Button 
              onClick={() => setActiveView('new-checklist')}
              className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2"
            >
              <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="mobile-text-xs lg:text-sm">Novo</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2"
            >
              <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="mobile-text-xs lg:text-sm">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mobile-card-padding lg:p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6 mb-4 lg:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 mobile-card-padding lg:pb-2">
              <CardTitle className="mobile-text-xs lg:text-sm font-medium">Meus Concluídos</CardTitle>
              <FileText className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
            </CardHeader>
            <CardContent className="mobile-card-padding">
              <div className="mobile-text-lg lg:text-2xl font-bold text-primary">{completedChecklists.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 mobile-card-padding lg:pb-2">
              <CardTitle className="mobile-text-xs lg:text-sm font-medium">Meus Pendentes</CardTitle>
              <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
            </CardHeader>
            <CardContent className="mobile-card-padding">
              <div className="mobile-text-lg lg:text-2xl font-bold text-primary">{pendingChecklists.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 mobile-card-padding lg:pb-2">
              <CardTitle className="mobile-text-xs lg:text-sm font-medium">Total</CardTitle>
              <FileText className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
            </CardHeader>
            <CardContent className="mobile-card-padding">
              <div className="mobile-text-lg lg:text-2xl font-bold text-primary">{myChecklists.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Meus Checklists */}
        <Card>
          <CardHeader className="mobile-card-padding lg:p-6">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              <span className="mobile-text-sm lg:text-lg">Meus Checklists</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-card-padding lg:p-6">
            <div className="space-y-3 lg:space-y-4">
              {myChecklists.map((checklist) => (
                <div key={checklist.id} className="border rounded-lg mobile-card-padding lg:p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="mobile-text-sm lg:text-lg font-semibold text-foreground truncate flex-1 mr-2">
                      {checklist.vehicle_name} - {checklist.plate}
                    </h3>
                    <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0 flex-wrap">
                      <Badge 
                        variant={checklist.priority === 'Alta' ? 'destructive' : 'secondary'}
                        className="mobile-text-xs lg:text-xs px-1 lg:px-2 py-0.5"
                      >
                        {checklist.priority}
                      </Badge>
                      <Badge 
                        variant={checklist.status === 'Concluído' ? "default" : "secondary"}
                        className="mobile-text-xs lg:text-xs px-1 lg:px-2 py-0.5"
                      >
                        {checklist.status}
                      </Badge>
                      
                      {/* Botões de ação compactos */}
                      <div className="flex items-center gap-1">
                        {checklist.status === 'Pendente' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleCompleteChecklist(checklist)}
                            disabled={updateChecklistMutation.isPending}
                            className="mobile-btn-sm lg:h-8 lg:px-2 flex items-center gap-1 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-3 w-3" />
                            <span className="hidden lg:inline mobile-text-xs">Concluir</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewChecklist(checklist)}
                          className="mobile-btn-sm lg:h-8 lg:px-2 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="hidden lg:inline mobile-text-xs">Ver</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChecklist(checklist)}
                          className="mobile-btn-sm lg:h-8 lg:px-2 flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="hidden lg:inline mobile-text-xs">Editar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informações responsivas */}
                  <div className="space-y-1 mobile-text-xs lg:text-sm text-muted-foreground">
                    {/* Mobile: Layout vertical compacto */}
                    <div className="md:hidden space-y-1">
                      <p><strong>Cliente:</strong> {checklist.customer_name}</p>
                      <p><strong>Data:</strong> {new Date(checklist.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>

                    {/* Desktop: Layout em grid */}
                    <div className="hidden md:block grid grid-cols-2 gap-4">
                      <div>
                        <p><strong>Cliente:</strong> {checklist.customer_name}</p>
                      </div>
                      <div>
                        <p><strong>Data:</strong> {new Date(checklist.created_at).toLocaleDateString('pt-BR')}</p>
                        {checklist.completed_at && (
                          <p><strong>Concluído:</strong> {new Date(checklist.completed_at).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {myChecklists.length === 0 && (
                <div className="text-center py-6 lg:py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 opacity-50" />
                  <p className="mobile-text-sm lg:text-base">Nenhum checklist criado ainda.</p>
                  <Button 
                    onClick={() => setActiveView('new-checklist')}
                    className="mt-3 lg:mt-4 mobile-btn lg:h-10 lg:px-4"
                  >
                    <span className="mobile-text-xs lg:text-sm">Criar Primeiro Checklist</span>
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
