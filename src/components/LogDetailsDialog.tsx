
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
      case 'CREATE': return 'Novo registro criado';
      case 'UPDATE': return 'Registro atualizado';
      case 'DELETE': return 'Registro excluído';
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
      'system_settings': 'Configuração do Sistema'
    };
    return tableNames[tableName] || tableName;
  };

  const formatDataForDisplay = (data: any) => {
    if (!data) return null;
    
    const fieldsToHide = ['id', 'created_at', 'updated_at'];
    const filteredData = Object.entries(data)
      .filter(([key]) => !fieldsToHide.includes(key))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as any);

    return Object.entries(filteredData).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-medium text-sm">{key}: </span>
        <span className="text-sm">{String(value || 'N/A')}</span>
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Detalhes da Atividade</span>
            <Badge className={`${getActionColor(log.action)} text-white`}>
              {getActionText(log.action)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-800">Informações Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Quando aconteceu:</span>
                <p className="text-sm mt-1">
                  {format(new Date(log.created_at), 'dd/MM/yyyy \'às\' HH:mm:ss', { locale: ptBR })}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Quem fez:</span>
                <p className="text-sm mt-1">{log.user_name || 'Sistema automático'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">O que foi alterado:</span>
                <p className="text-sm mt-1">{getTableDisplayName(log.table_name)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Código do registro:</span>
                <p className="text-sm mt-1 font-mono">{log.record_id?.substring(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Dados anteriores (para UPDATE e DELETE) */}
          {log.old_data && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">
                {log.action === 'DELETE' ? 'Dados que foram excluídos:' : 'Como estava antes:'}
              </h3>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                {formatDataForDisplay(log.old_data)}
              </div>
            </div>
          )}

          {/* Dados novos (para CREATE e UPDATE) */}
          {log.new_data && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">
                {log.action === 'CREATE' ? 'Dados que foram criados:' : 'Como ficou depois:'}
              </h3>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                {formatDataForDisplay(log.new_data)}
              </div>
            </div>
          )}

          {/* Informações técnicas */}
          {(log.ip_address || log.user_agent) && (
            <>
              <Separator />
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-800">Informações Técnicas</h3>
                <div className="space-y-3">
                  {log.ip_address && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Endereço IP:</span>
                      <p className="text-sm mt-1 font-mono">{String(log.ip_address)}</p>
                    </div>
                  )}
                  {log.user_agent && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Navegador/Dispositivo:</span>
                      <p className="text-sm mt-1 break-all">{log.user_agent}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
