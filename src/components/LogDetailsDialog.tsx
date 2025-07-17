
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
      case 'CREATE': return 'bg-green-500 text-white border-green-500';
      case 'UPDATE': return 'bg-blue-500 text-white border-blue-500';
      case 'DELETE': return 'bg-red-500 text-white border-red-500';
      default: return 'bg-gray-500 text-white border-gray-500';
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

  const getFieldDisplayName = (field: string, tableName: string) => {
    const fieldNames: Record<string, Record<string, string>> = {
      'checklists': {
        'customer_name': 'Nome do Cliente',
        'vehicle_name': 'Veículo',
        'plate': 'Placa',
        'status': 'Status',
        'priority': 'Prioridade',
        'general_observations': 'Observações Gerais'
      },
      'checklist_items': {
        'item_name': 'Nome do Item',
        'category': 'Categoria',
        'checked': 'Verificado',
        'observation': 'Observação'
      },
      'budgets': {
        'customer_name': 'Nome do Cliente',
        'vehicle_name': 'Veículo',
        'vehicle_plate': 'Placa',
        'vehicle_year': 'Ano',
        'status': 'Status',
        'total_amount': 'Valor Total',
        'discount_amount': 'Desconto',
        'final_amount': 'Valor Final',
        'observations': 'Observações',
        'budget_number': 'Número do Orçamento'
      },
      'budget_items': {
        'service_name': 'Nome do Serviço',
        'service_category': 'Categoria',
        'quantity': 'Quantidade',
        'unit_price': 'Preço Unitário',
        'total_price': 'Preço Total'
      },
      'services': {
        'name': 'Nome do Serviço',
        'category': 'Categoria',
        'unit_price': 'Preço Unitário',
        'description': 'Descrição',
        'is_active': 'Ativo'
      },
      'vehicles': {
        'vehicle_name': 'Nome do Veículo',
        'plate': 'Placa',
        'customer_name': 'Nome do Cliente',
        'status': 'Status',
        'priority': 'Prioridade',
        'service_order': 'Ordem de Serviço',
        'scheduled_time': 'Horário Agendado'
      },
      'profiles': {
        'full_name': 'Nome Completo',
        'username': 'Nome de Usuário',
        'role': 'Função'
      },
      'system_settings': {
        'system_name': 'Nome do Sistema',
        'system_description': 'Descrição do Sistema',
        'company_name': 'Nome da Empresa',
        'company_cnpj': 'CNPJ',
        'company_email': 'Email',
        'company_phone': 'Telefone',
        'company_address': 'Endereço',
        'company_website': 'Site'
      }
    };
    
    return fieldNames[tableName]?.[field] || field;
  };

  const formatFieldValue = (value: any, field: string) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (field.includes('amount') || field.includes('price')) {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(value);
    }
    return String(value);
  };

  const formatDataForDisplay = (data: any, tableName: string) => {
    if (!data) return null;
    
    // Campos técnicos que devem ser sempre ocultados
    const fieldsToHide = [
      'id', 
      'created_at', 
      'updated_at', 
      'mechanic_id',
      'user_id',
      'checklist_id',
      'budget_id',
      'service_id'
    ];
    
    const filteredData = Object.entries(data)
      .filter(([key]) => !fieldsToHide.includes(key))
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as any);

    return Object.entries(filteredData).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-medium text-sm text-foreground">{getFieldDisplayName(key, tableName)}: </span>
        <span className="text-sm text-muted-foreground">{formatFieldValue(value, key)}</span>
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-card-foreground">
            <span>Detalhes da Atividade</span>
            <Badge className={getActionColor(log.action)}>
              {getActionText(log.action)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-3 text-foreground">Informações Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Quando aconteceu:</span>
                <p className="text-sm mt-1 text-foreground">
                  {format(new Date(log.created_at), 'dd/MM/yyyy \'às\' HH:mm:ss', { locale: ptBR })}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Quem fez:</span>
                <p className="text-sm mt-1 text-foreground">{log.user_name || 'Sistema automático'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">O que foi alterado:</span>
                <p className="text-sm mt-1 text-foreground">{getTableDisplayName(log.table_name)}</p>
              </div>
            </div>
          </div>

          {/* Dados anteriores (para UPDATE e DELETE) */}
          {log.old_data && (
            <div>
              <h3 className="font-semibold mb-3 text-foreground">
                {log.action === 'DELETE' ? 'Dados que foram excluídos:' : 'Como estava antes:'}
              </h3>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                {formatDataForDisplay(log.old_data, log.table_name)}
              </div>
            </div>
          )}

          {/* Dados novos (para CREATE e UPDATE) */}
          {log.new_data && (
            <div>
              <h3 className="font-semibold mb-3 text-foreground">
                {log.action === 'CREATE' ? 'Dados que foram criados:' : 'Como ficou depois:'}
              </h3>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                {formatDataForDisplay(log.new_data, log.table_name)}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
