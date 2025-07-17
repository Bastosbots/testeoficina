
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, FileText, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBudgets } from '@/hooks/useBudgets';
import { useAuth } from '@/hooks/useAuth';
import BudgetForm from '@/components/BudgetForm';
import BudgetViewer from '@/components/BudgetViewer';

const Budgets = () => {
  const { data: budgets = [], isLoading } = useBudgets();
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
  const totalValue = myBudgets.reduce((sum, b) => sum + b.final_amount, 0);

  const handleViewBudget = (budget: any) => {
    setSelectedBudget(budget);
    setActiveView('view');
  };

  const handleBackToList = () => {
    setActiveView('list');
    setSelectedBudget(null);
  };

  const handleNewBudget = () => {
    setActiveView('new');
  };

  const handleBudgetComplete = () => {
    setActiveView('list');
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
    <div className="min-h-screen bg-background mobile-card-padding lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="mobile-text-lg lg:text-2xl font-bold text-foreground">Orçamentos</h1>
            <p className="mobile-text-xs lg:text-base text-muted-foreground">
              Gerencie os orçamentos da oficina
            </p>
          </div>
          <Button onClick={handleNewBudget} className="mobile-btn lg:h-10 lg:px-4">
            <Plus className="h-4 w-4" />
            <span className="ml-2">Novo Orçamento</span>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBudgets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBudgets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedBudgets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, veículo, placa ou número do orçamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Budgets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lista de Orçamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando orçamentos...</p>
              </div>
            ) : myBudgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Nenhum orçamento encontrado</p>
                <p className="text-sm">
                  {searchTerm ? 'Tente ajustar os filtros de busca' : 'Crie seu primeiro orçamento'}
                </p>
                {!searchTerm && (
                  <Button onClick={handleNewBudget} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Orçamento
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {myBudgets.map((budget) => (
                  <div key={budget.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">#{budget.budget_number}</h3>
                        <Badge variant={budget.status === 'Aprovado' ? 'default' : 'secondary'}>
                          {budget.status}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBudget(budget)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{budget.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Veículo</p>
                        <p className="font-medium">
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
