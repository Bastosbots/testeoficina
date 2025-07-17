
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search, Filter, FileText } from 'lucide-react';
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
      case 'CREATE': return 'bg-green-500';
      case 'UPDATE': return 'bg-blue-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'CREATE': return 'Criação';
      case 'UPDATE': return 'Atualização';
      case 'DELETE': return 'Exclusão';
      default: return action;
    }
  };

  const getTableDisplayName = (tableName: string) => {
    const tableNames: Record<string, string> = {
      'checklists': 'Checklists',
      'checklist_items': 'Itens de Checklist',
      'budgets': 'Orçamentos',
      'budget_items': 'Itens de Orçamento',
      'services': 'Serviços',
      'vehicles': 'Veículos',
      'profiles': 'Perfis de Usuário',
      'system_settings': 'Configurações do Sistema'
    };
    return tableNames[tableName] || tableName;
  };

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            <div className="text-center text-red-600">
              Erro ao carregar logs: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mobile-card-padding lg:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6" />
        <h1 className="mobile-text-xl lg:text-2xl font-bold">Logs do Sistema</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auditoria de Ações</CardTitle>
          <CardDescription>
            Visualize todas as ações realizadas no sistema para controle administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, tabela ou ação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="CREATE">Criação</SelectItem>
                <SelectItem value="UPDATE">Atualização</SelectItem>
                <SelectItem value="DELETE">Exclusão</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTable} onValueChange={setFilterTable}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Tabela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tabelas</SelectItem>
                {uniqueTables.map(table => (
                  <SelectItem key={table} value={table}>
                    {getTableDisplayName(table)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de logs */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>ID do Registro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="mobile-text-xs lg:text-sm">
                        {format(new Date(log.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="mobile-text-xs lg:text-sm">
                        {log.user_name || 'Sistema'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionColor(log.action)} text-white mobile-text-xs lg:text-xs`}>
                          {getActionText(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="mobile-text-xs lg:text-sm">
                        {getTableDisplayName(log.table_name)}
                      </TableCell>
                      <TableCell className="mobile-text-xs lg:text-sm font-mono">
                        {log.record_id?.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                          className="touch-target"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Estatísticas */}
          <div className="mt-4 text-sm text-muted-foreground">
            Total de logs: {filteredLogs?.length || 0}
            {searchTerm && ` (filtrados de ${logs?.length || 0})`}
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
