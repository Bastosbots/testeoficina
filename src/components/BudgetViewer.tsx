
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBudgetItems, Budget } from '@/hooks/useBudgets';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/hooks/useAuth';
import BudgetStatus from '@/components/BudgetStatus';
import jsPDF from 'jspdf';

interface BudgetViewerProps {
  budget: Budget;
  onBack: () => void;
}

const BudgetViewer = ({ budget, onBack }: BudgetViewerProps) => {
  const { data: budgetItems = [] } = useBudgetItems(budget.id);
  const { data: settings } = useSystemSettings();
  const { profile } = useAuth();

  const canEdit = profile?.role === 'admin' || 
    (profile?.role === 'mechanic' && budget.mechanic_id === profile.id && budget.status === 'Pendente');

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(settings?.company_name || 'Oficina', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    if (settings?.company_address) {
      doc.text(settings.company_address, margin, yPosition);
      yPosition += 6;
    }
    if (settings?.company_phone) {
      doc.text(`Tel: ${settings.company_phone}`, margin, yPosition);
      yPosition += 6;
    }
    if (settings?.company_email) {
      doc.text(`Email: ${settings.company_email}`, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 10;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ORÇAMENTO', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Budget Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Número: ${budget.budget_number}`, margin, yPosition);
    doc.text(`Data: ${format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}`, pageWidth - margin - 60, yPosition);
    yPosition += 15;

    // Customer Info
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${budget.customer_name}`, margin, yPosition);
    yPosition += 10;

    // Vehicle Info (only if exists)
    if (budget.vehicle_name || budget.vehicle_plate) {
      doc.setFont('helvetica', 'bold');
      doc.text('DADOS DO VEÍCULO', margin, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'normal');
      if (budget.vehicle_name) {
        doc.text(`Veículo: ${budget.vehicle_name}`, margin, yPosition);
        yPosition += 6;
      }
      if (budget.vehicle_plate) {
        doc.text(`Placa: ${budget.vehicle_plate}`, margin, yPosition);
        yPosition += 6;
      }
      if (budget.vehicle_year) {
        doc.text(`Ano: ${budget.vehicle_year}`, margin, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }

    // Services Table Header
    doc.setFont('helvetica', 'bold');
    doc.text('SERVIÇOS', margin, yPosition);
    yPosition += 8;

    // Table headers
    const tableHeaders = ['Serviço', 'Categoria', 'Qtd', 'Valor Unit.', 'Total'];
    const colWidths = [60, 40, 20, 30, 30];
    let xPosition = margin;

    doc.setFontSize(10);
    tableHeaders.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += 6;

    // Table line
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Services data
    doc.setFont('helvetica', 'normal');
    budgetItems.forEach((item) => {
      xPosition = margin;
      
      doc.text(item.service_name.substring(0, 25), xPosition, yPosition);
      xPosition += colWidths[0];
      
      doc.text(item.service_category.substring(0, 15), xPosition, yPosition);
      xPosition += colWidths[1];
      
      doc.text(item.quantity.toString(), xPosition, yPosition);
      xPosition += colWidths[2];
      
      doc.text(`R$ ${item.unit_price.toFixed(2)}`, xPosition, yPosition);
      xPosition += colWidths[3];
      
      doc.text(`R$ ${item.total_price.toFixed(2)}`, xPosition, yPosition);
      
      yPosition += 6;
    });

    yPosition += 10;

    // Totals
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: R$ ${budget.total_amount.toFixed(2)}`, pageWidth - margin - 80, yPosition);
    yPosition += 6;

    if (budget.discount_amount && budget.discount_amount > 0) {
      doc.text(`Desconto: R$ ${budget.discount_amount.toFixed(2)}`, pageWidth - margin - 80, yPosition);
      yPosition += 6;
    }

    doc.setFontSize(14);
    doc.text(`TOTAL: R$ ${budget.final_amount.toFixed(2)}`, pageWidth - margin - 80, yPosition);

    // Observations
    if (budget.observations) {
      yPosition += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES', margin, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      const splitObservations = doc.splitTextToSize(budget.observations, pageWidth - 2 * margin);
      doc.text(splitObservations, margin, yPosition);
    }

    // Save PDF
    doc.save(`orcamento-${budget.budget_number}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    // For now, just show a message that edit functionality needs to be implemented
    alert('Funcionalidade de edição será implementada em breve');
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" onClick={onBack} size="sm" className="sm:h-10 sm:px-4">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Voltar</span>
            </Button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Orçamento {budget.budget_number}</h1>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {canEdit && (
              <Button variant="outline" onClick={handleEdit} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 sm:ml-2">Editar</span>
              </Button>
            )}
            <Button variant="outline" onClick={generatePDF} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="ml-1 sm:ml-2">PDF</span>
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">
              <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="ml-1 sm:ml-2">Imprimir</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 print:space-y-4">
          {/* Header Info */}
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="print:pb-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">{settings?.company_name || 'Oficina'}</CardTitle>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-2">
                    {settings?.company_address && <p>{settings.company_address}</p>}
                    {settings?.company_phone && <p>Tel: {settings.company_phone}</p>}
                    {settings?.company_email && <p>Email: {settings.company_email}</p>}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-sm sm:text-base">Orçamento #{budget.budget_number}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                  <div className="mt-2">
                    <BudgetStatus budget={budget} />
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Customer Info */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="print:pb-2">
              <CardTitle className="text-base sm:text-lg">Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="print:pt-0">
              <div className="space-y-2">
                <p className="text-sm sm:text-base"><strong>Nome:</strong> {budget.customer_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Info - only show if exists */}
          {(budget.vehicle_name || budget.vehicle_plate) && (
            <Card className="print:shadow-none print:border">
              <CardHeader className="print:pb-2">
                <CardTitle className="text-base sm:text-lg">Dados do Veículo</CardTitle>
              </CardHeader>
              <CardContent className="print:pt-0">
                <div className="space-y-2">
                  {budget.vehicle_name && <p className="text-sm sm:text-base"><strong>Veículo:</strong> {budget.vehicle_name}</p>}
                  {budget.vehicle_plate && <p className="text-sm sm:text-base"><strong>Placa:</strong> {budget.vehicle_plate}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="print:pb-2">
              <CardTitle className="text-base sm:text-lg">Serviços</CardTitle>
            </CardHeader>
            <CardContent className="print:pt-0">
              <div className="space-y-3">
                {budgetItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-3 sm:p-4 print:border print:rounded-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                      <div className="sm:col-span-2 lg:col-span-2">
                        <h4 className="font-medium text-sm sm:text-base">{item.service_name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.service_category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Quantidade</p>
                        <p className="font-medium text-sm">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor Unitário</p>
                        <p className="font-medium text-sm">R$ {item.unit_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-medium text-sm">R$ {item.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card className="print:shadow-none print:border">
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal:</span>
                  <span>R$ {budget.total_amount.toFixed(2)}</span>
                </div>
                
                {budget.discount_amount && budget.discount_amount > 0 && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Desconto:</span>
                    <span>- R$ {budget.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-2">
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {budget.final_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          {budget.observations && (
            <Card className="print:shadow-none print:border">
              <CardHeader className="print:pb-2">
                <CardTitle className="text-base sm:text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent className="print:pt-0">
                <p className="whitespace-pre-wrap text-sm sm:text-base">{budget.observations}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetViewer;
