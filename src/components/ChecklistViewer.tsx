
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Download, Printer } from "lucide-react";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { useUpdateChecklist } from "@/hooks/useChecklists";
import { useAuth } from "@/hooks/useAuth";
import ChecklistProgress from "./checklist/ChecklistProgress";
import ChecklistItems from "./checklist/ChecklistItems";
import ChecklistInfo from "./checklist/ChecklistInfo";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ChecklistViewerProps {
  checklist: any;
  onBack: () => void;
}

const ChecklistViewer = ({ checklist, onBack }: ChecklistViewerProps) => {
  const { data: items = [] } = useChecklistItems(checklist.id);
  const updateChecklistMutation = useUpdateChecklist();
  const { profile } = useAuth();

  const totalItems = items.length;
  const checkedItems = items.filter((item: any) => item.checked).length;
  const isAdmin = profile?.role === 'admin';

  const handleCompleteChecklist = async () => {
    try {
      await updateChecklistMutation.mutateAsync({
        id: checklist.id,
        status: 'Concluído',
        completed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error completing checklist:', error);
    }
  };

  const generatePDF = async (shouldPrint = false) => {
    try {
      // Create a temporary element for PDF generation
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.width = '210mm';
      tempElement.style.backgroundColor = 'white';
      tempElement.style.padding = '20px';
      tempElement.style.fontFamily = 'Arial, sans-serif';
      
      // PDF content
      tempElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; color: #333; margin-bottom: 10px;">Checklist de Veículo</h1>
          <div style="border-bottom: 2px solid #333; margin: 20px 0;"></div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; color: #333; margin-bottom: 15px;">Informações do Veículo</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div><strong>Cliente:</strong> ${checklist.customer_name}</div>
            <div><strong>Veículo:</strong> ${checklist.vehicle_name}</div>
            <div><strong>Placa:</strong> ${checklist.plate}</div>
            <div><strong>Status:</strong> ${checklist.status}</div>
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Data de Criação:</strong> ${new Date(checklist.created_at).toLocaleDateString('pt-BR')}
          </div>
          ${checklist.completed_at ? `<div><strong>Data de Conclusão:</strong> ${new Date(checklist.completed_at).toLocaleDateString('pt-BR')}</div>` : ''}
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; color: #333; margin-bottom: 15px;">Progresso</h2>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <div style="margin-bottom: 10px;"><strong>Itens Verificados:</strong> ${checkedItems} de ${totalItems}</div>
            <div style="background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden;">
              <div style="background: #10b981; height: 100%; width: ${totalItems > 0 ? (checkedItems / totalItems) * 100 : 0}%; transition: width 0.3s;"></div>
            </div>
            <div style="margin-top: 5px; font-size: 14px;">${totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0}% concluído</div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; color: #333; margin-bottom: 15px;">Itens do Checklist</h2>
          ${items.map((item: any) => `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #333; border-radius: 3px; margin-right: 10px; text-align: center; line-height: 12px; background: ${item.checked ? '#10b981' : 'white'}; color: white;">
                  ${item.checked ? '✓' : ''}
                </span>
                <strong>${item.item_name}</strong>
                <span style="margin-left: 10px; padding: 2px 8px; background: #f3f4f6; border-radius: 4px; font-size: 12px;">${item.category}</span>
              </div>
              ${item.observation ? `<div style="margin-left: 26px; color: #666; font-size: 14px;"><strong>Observação:</strong> ${item.observation}</div>` : ''}
            </div>
          `).join('')}
        </div>

        ${checklist.general_observations ? `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 18px; color: #333; margin-bottom: 15px;">Observações Gerais</h2>
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background: #f9fafb;">
              ${checklist.general_observations}
            </div>
          </div>
        ` : ''}

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
        </div>
      `;

      document.body.appendChild(tempElement);

      // Generate canvas from the element
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary element
      document.body.removeChild(tempElement);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

      const fileName = `checklist-${checklist.plate}-${new Date().toISOString().split('T')[0]}.pdf`;

      if (shouldPrint) {
        // Open print dialog
        pdf.autoPrint();
        window.open(pdf.output('bloburl'), '_blank');
      } else {
        // Download PDF
        pdf.save(fileName);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

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
            
            {/* PDF Download Button - Available for all users */}
            <Button 
              onClick={() => generatePDF(false)}
              variant="outline"
              className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2"
            >
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="mobile-text-xs lg:text-sm">Baixar PDF</span>
            </Button>

            {/* PDF Print Button - Only available for admins */}
            {isAdmin && (
              <Button 
                onClick={() => generatePDF(true)}
                variant="outline"
                className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2"
              >
                <Printer className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="mobile-text-xs lg:text-sm">Imprimir</span>
              </Button>
            )}

            {/* Only show complete button for admins and when status is "Em Andamento" */}
            {isAdmin && checklist.status === 'Em Andamento' && (
              <Button 
                onClick={handleCompleteChecklist}
                disabled={updateChecklistMutation.isPending}
                className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="mobile-text-xs lg:text-sm">Concluir</span>
              </Button>
            )}
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
