
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateBudget } from '@/hooks/useBudgets';
import { toast } from 'sonner';

interface BudgetStatusProps {
  budget: any;
  onStatusChange?: () => void;
}

const BudgetStatus = ({ budget, onStatusChange }: BudgetStatusProps) => {
  const { profile } = useAuth();
  const updateBudget = useUpdateBudget();

  const handleApprove = async () => {
    try {
      await updateBudget.mutateAsync({
        id: budget.id,
        status: 'Aprovado'
      });
      toast.success('Orçamento aprovado com sucesso!');
      onStatusChange?.();
    } catch (error) {
      toast.error('Erro ao aprovar orçamento');
    }
  };

  const handleReject = async () => {
    try {
      await updateBudget.mutateAsync({
        id: budget.id,
        status: 'Rejeitado'
      });
      toast.success('Orçamento rejeitado');
      onStatusChange?.();
    } catch (error) {
      toast.error('Erro ao rejeitar orçamento');
    }
  };

  const canApprove = profile?.role === 'admin' && budget.status === 'Pendente';

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={
          budget.status === 'Aprovado' ? 'default' : 
          budget.status === 'Rejeitado' ? 'destructive' : 
          'secondary'
        }
        className="text-xs"
      >
        {budget.status === 'Aprovado' && <CheckCircle className="h-3 w-3 mr-1" />}
        {budget.status === 'Pendente' && <Clock className="h-3 w-3 mr-1" />}
        {budget.status}
      </Badge>
      
      {canApprove && (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="default"
            onClick={handleApprove}
            disabled={updateBudget.isPending}
            className="h-7 px-2 text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={updateBudget.isPending}
            className="h-7 px-2 text-xs"
          >
            Rejeitar
          </Button>
        </div>
      )}
    </div>
  );
};

export default BudgetStatus;
