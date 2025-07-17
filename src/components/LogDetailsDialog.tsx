
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SystemLog } from '@/hooks/useSystemLogs';

interface LogDetailsDialogProps {
  log: SystemLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogDetailsDialog({ log, open, onOpenChange }: LogDetailsDialogProps) {
  if (!log) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes do Log
            <Badge className={`${getActionColor(log.action)} text-white`}>
              {getActionText(log.action)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Data e Hora</h3>
              <p className="text-sm">
                {format(new Date(log.created_at), 'dd/MM/yyyy \'às\' HH:mm:ss', { locale: ptBR })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Usuário</h3>
              <p className="text-sm">{log.user_name || 'Sistema'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Tabela</h3>
              <p className="text-sm">{getTableDisplayName(log.table_name)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID do Registro</h3>
              <p className="text-sm font-mono">{log.record_id}</p>
            </div>
          </div>

          <Separator />

          {/* Dados anteriores (para UPDATE e DELETE) */}
          {log.old_data && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Dados Anteriores
              </h3>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(log.old_data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Dados novos (para CREATE e UPDATE) */}
          {log.new_data && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {log.action === 'CREATE' ? 'Dados Criados' : 'Dados Atualizados'}
              </h3>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(log.new_data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Informações técnicas */}
          {(log.ip_address || log.user_agent) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 gap-4">
                {log.ip_address && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Endereço IP</h3>
                    <p className="text-sm font-mono">{String(log.ip_address)}</p>
                  </div>
                )}
                {log.user_agent && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">User Agent</h3>
                    <p className="text-sm font-mono break-all">{log.user_agent}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
