
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search, History } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSystemLogs, type SystemLog } from '@/hooks/useSystemLogs';
import { LogDetailsDialog } from '@/components/LogDetailsDialog';

const SystemLogs = () => {
  const { data: logs, isLoading, error } = useSystemLogs();
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-500 text-white border-green-500';
      case 'UPDATE': return 'bg-blue-500 text-white border-blue-500';
      case 'DELETE': return 'bg-red-500 text-white border-red-500';
      default: return 'bg-gray-500 text-white border-gray-500';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'CREATE': return 'Criou';
      case 'UPDATE': return 'Alterou';
      case 'DELETE': return 'Excluiu';
      default: return action;
    }
  };

  const getTableDisplayName = (tableName: string) => {
    const tableNames: Record<string, string> = {
      'checklists': 'Checklist',
      'checklist_items': 'Item do Checklist',
      'budgets': 'Orçamento',
      'budget_items': 'Item do Orçamento',
      'services': 'Serviço',
      'vehicles': 'Veículo',
      'profiles': 'Usuário',
      'system_settings': 'Configuração'
    };
    return tableNames[tableName] || tableName;
  };

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTableDisplayName(log.table_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getActionText(log.action).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesTable = filterTable === 'all' || log.table_name === filterTable;
    
    return matchesSearch && matchesAction && matchesTable;
  });

  const uniqueTables = Array.from(new Set(logs?.map(log => log.table_name) || []));

  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="mobile-card-padding lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-card-padding lg:p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Erro ao carregar histórico: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mobile-card-padding lg:p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center gap-2">
        <History className="h-6 w-6 text-foreground" />
        <h1 className="mobile-text-xl lg:text-2xl font-bold text-foreground">Histórico de Atividades</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Todas as Atividades do Sistema</CardTitle>
          <CardDescription className="text-muted-foreground">
            Veja tudo que foi criado, alterado ou excluído no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, item ou ação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-background text-foreground border-border"
                />
              </div>
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full lg:w-[150px] bg-background text-foreground border-border">
                <SelectValue placeholder="Tipo de ação" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="CREATE">Criações</SelectItem>
                <SelectItem value="UPDATE">Alterações</SelectItem>
                <SelectItem value="DELETE">Exclusões</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTable} onValueChange={setFilterTable}>
              <SelectTrigger className="w-full lg:w-[180px] bg-background text-foreground border-border">
                <SelectValue placeholder="Item" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos os itens</SelectItem>
                {uniqueTables.map(table => (
                  <SelectItem key={table} value={table}>
                    {getTableDisplayName(table)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de logs */}
          <div className="rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Quando</TableHead>
                  <TableHead className="text-muted-foreground">Quem</TableHead>
                  <TableHead className="text-muted-foreground">Fez o quê</TableHead>
                  <TableHead className="text-muted-foreground">Item</TableHead>
                  <TableHead className="text-muted-foreground">Código</TableHead>
                  <TableHead className="text-right text-muted-foreground">Ver Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma atividade encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs?.map((log) => (
                    <TableRow key={log.id} className="border-border">
                      <TableCell className="mobile-text-xs lg:text-sm text-foreground">
                        {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="mobile-text-xs lg:text-sm text-foreground">
                        {log.user_name || 'Sistema'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionColor(log.action)} mobile-text-xs lg:text-xs`}>
                          {getActionText(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="mobile-text-xs lg:text-sm text-foreground">
                        {getTableDisplayName(log.table_name)}
                      </TableCell>
                      <TableCell className="mobile-text-xs lg:text-sm font-mono text-foreground">
                        {log.record_id?.substring(0, 6)}...
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                          className="touch-target bg-background text-foreground border-border"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Estatísticas */}
          <div className="mt-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
            <strong>Total de atividades:</strong> {filteredLogs?.length || 0}
            {searchTerm && ` (de ${logs?.length || 0} no total)`}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalhes */}
      <LogDetailsDialog
        log={selectedLog}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
};

export default SystemLogs;
