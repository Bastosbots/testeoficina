
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface ChecklistProgressProps {
  checkedItems: number;
  totalItems: number;
}

const ChecklistProgress = ({ checkedItems, totalItems }: ChecklistProgressProps) => {
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <Card className="mb-4 lg:mb-6">
      <CardContent className="mobile-card-padding lg:pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="mobile-text-xs lg:text-sm font-medium text-foreground">Progresso do Checklist</span>
          <span className="mobile-text-xs lg:text-sm text-muted-foreground">
            {checkedItems}/{totalItems} itens ({Math.round(progress)}%)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 lg:h-3">
          <div 
            className="bg-primary h-2 lg:h-3 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistProgress;
