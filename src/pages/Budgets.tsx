
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, FileText, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBudgets } from '@/hooks/useBudgets';
import { useAuth } from '@/hooks/useAuth';
import BudgetForm from '@/components/BudgetForm';
import BudgetViewer from '@/components/BudgetViewer';
import BudgetStatus from '@/components/BudgetStatus';

const Budgets = () => {
  const { data: budgets = [], isLoading, refetch } = useBudgets();
  const { profile } = useAuth();
  const [activeView, setActiveView] = useState<'list' | 'new' | 'view'>('list');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBudgets = budgets.filter(budget =>
    budget.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (budget.vehicle_name && budget.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (budget.vehicle_plate && budget.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
    budget.budget_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myBudgets = profile?.role === 'admin' 
    ? filteredBudgets 
    : filteredBudgets.filter(b => b.mechanic_id === profile?.id);

  const totalBudgets = myBudgets.length;
  const pendingBudgets = myBudgets.filter(b => b.status === 'Pendente').length;
  const approvedBudgets = myBudgets.filter(b => b.status === 'Aprovado').length;
  const rejectedBudgets = myBudgets.filter(b => b.status === 'Rejeitado').length;
  const totalValue = myBudgets.reduce((sum, b) => sum + b.final_amount, 0);

  const handleViewBudget = (budget: any) => {
    setSelectedBudget(budget);
    setActiveView('view');
  };

  const handleBackToList = () => {
    setActiveView('list');
    setSelectedBudget(null);
    refetch();
  };

  const handleNewBudget = () => {
    setActiveView('new');
  };

  const handleBudgetComplete = () => {
    setActiveView('list');
    refetch();
  };

  const handleStatusChange = () => {
    refetch();
  };

  if (activeView === 'new') {
    return (
      <BudgetForm
        onBack={handleBackToList}
        onComplete={handleBudgetComplete}
      />
    );
  }

  if (activeView === 'view' && selectedBudget) {
    return (
      <BudgetViewer
        budget={selectedBudget}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Orçamentos</h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
              Gerencie os orçamentos da oficina
            </p>
          </div>
          <Button onClick={handleNewBudget} className="w-full sm:w-auto h-10 sm:h-10 lg:h-10 text-sm">
            <Plus className="h-4 w-4" />
            <span className="ml-2">Novo Orçamento</span>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{totalBudgets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{pendingBudgets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Aprovados</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{approvedBudgets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Rejeitados</CardTitle>
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{rejectedBudgets}</div>
            </CardContent>
          </Card>

          <Card className="col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, veículo, placa ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Budgets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Lista de Orçamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-sm">Carregando orçamentos...</p>
              </div>
            ) : myBudgets.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-base sm:text-lg mb-2">Nenhum orçamento encontrado</p>
                <p className="text-xs sm:text-sm">
                  {searchTerm ? 'Tente ajustar os filtros de busca' : 'Crie seu primeiro orçamento'}
                </p>
                {!searchTerm && (
                  <Button onClick={handleNewBudget} className="mt-4 text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Orçamento
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {myBudgets.map((budget) => (
                  <div key={budget.id} className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm sm:text-base">#{budget.budget_number}</h3>
                        <BudgetStatus budget={budget} onStatusChange={handleStatusChange} />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBudget(budget)}
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Ver
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium truncate">{budget.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Veículo</p>
                        <p className="font-medium truncate">
                          {budget.vehicle_name && budget.vehicle_plate 
                            ? `${budget.vehicle_name} - ${budget.vehicle_plate}`
                            : budget.vehicle_name || budget.vehicle_plate || 'Não informado'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data</p>
                        <p className="font-medium">
                          {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor</p>
                        <p className="font-medium text-primary">R$ {budget.final_amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Budgets;
