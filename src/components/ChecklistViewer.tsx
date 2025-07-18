
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import ChecklistProgress from "./checklist/ChecklistProgress";
import ChecklistItems from "./checklist/ChecklistItems";
import ChecklistInfo from "./checklist/ChecklistInfo";

interface ChecklistViewerProps {
  checklist: any;
  onBack: () => void;
}

const ChecklistViewer = ({ checklist, onBack }: ChecklistViewerProps) => {
  const { data: items = [] } = useChecklistItems(checklist.id);

  const totalItems = items.length;
  const checkedItems = items.filter((item: any) => item.checked).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border mobile-card-padding lg:px-6 mobile-header-height lg:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="outline" onClick={onBack} className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="mobile-text-xs lg:text-sm">Voltar</span>
            </Button>
            <div>
              <h1 className="mobile-text-lg lg:text-2xl font-bold text-foreground">Visualizar Checklist</h1>
              <p className="mobile-text-xs lg:text-base text-muted-foreground">
                {checklist.vehicle_name} - {checklist.plate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <Badge variant={checklist.completed_at ? "default" : "secondary"} className="mobile-text-xs lg:text-sm px-2 lg:px-4 py-1 lg:py-2">
              {checklist.completed_at ? 'Concluído' : 'Pendente'}
            </Badge>
          </div>
        </div>
      </header>

      <div className="mobile-card-padding lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
          {/* Checklist Items */}
          <div className="lg:col-span-2">
            <ChecklistProgress checkedItems={checkedItems} totalItems={totalItems} />
            <ChecklistItems items={items} />
          </div>

          {/* Sidebar - Info */}
          <ChecklistInfo checklist={checklist} />
        </div>
      </div>
    </div>
  );
};

export default ChecklistViewer;
