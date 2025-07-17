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

  const isAdmin = profile?.role === 'admin';

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPosition = 20;

    // Logo placeholder (top left)
    doc.setFillColor(255, 255, 0);
    doc.circle(30, 25, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('LOGO', 26, 26);

    // Company header (centered)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const companyName = settings?.company_name || 'Nome da Empresa';
    doc.text(companyName, pageWidth/2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (settings?.company_address) {
      doc.text(settings.company_address, pageWidth/2, 28, { align: 'center' });
    }
    
    // Contact info (right side)
    doc.setFontSize(8);
    if (settings?.company_phone) {
      doc.text(`Telefone: ${settings.company_phone}`, pageWidth - margin, 20, { align: 'right' });
    }
    if (settings?.company_email) {
      doc.text(`Email: ${settings.company_email}`, pageWidth - margin, 26, { align: 'right' });
    }

    yPosition = 45;

    // Title ORÇAMENTO (centered and bold)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ORÇAMENTO', pageWidth/2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Two column layout for client and vehicle info
    const leftColX = margin;
    const rightColX = pageWidth/2 + 10;
    
    // Client section (left)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', leftColX, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${budget.customer_name}`, leftColX, yPosition);
    yPosition += 6;
    
    // Add some spacing for additional client info if needed
    const clientEndY = yPosition + 10;

    // Vehicle section (right) - reset yPosition for right column
    let rightYPosition = yPosition - 14; // Start at same level as "Cliente:"
    
    if (budget.vehicle_name || budget.vehicle_plate) {
      doc.setFont('helvetica', 'bold');
      doc.text('Veículo:', rightColX, rightYPosition);
      rightYPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      if (budget.vehicle_name) {
        doc.text(`Modelo: ${budget.vehicle_name}`, rightColX, rightYPosition);
        rightYPosition += 6;
      }
      if (budget.vehicle_plate) {
        doc.text(`Placa: ${budget.vehicle_plate}`, rightColX, rightYPosition);
        rightYPosition += 6;
      }
      if (budget.vehicle_year) {
        doc.text(`Ano: ${budget.vehicle_year}`, rightColX, rightYPosition);
        rightYPosition += 6;
      }
    }

    // Move to next section after both columns
    yPosition = Math.max(clientEndY, rightYPosition + 10);

    // Services table
    doc.setFont('helvetica', 'bold');
    doc.text('Serviços:', leftColX, yPosition);
    yPosition += 10;

    // Table headers with borders
    const tableY = yPosition;
    const tableHeight = 8;
    const colWidths = [80, 25, 35, 35];
    const colPositions = [leftColX, leftColX + colWidths[0], leftColX + colWidths[0] + colWidths[1], leftColX + colWidths[0] + colWidths[1] + colWidths[2]];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

    // Header background and borders
    doc.setFillColor(240, 240, 240);
    doc.rect(leftColX, tableY, tableWidth, tableHeight, 'F');
    
    // Header borders
    doc.setLineWidth(0.3);
    doc.rect(leftColX, tableY, tableWidth, tableHeight);
    colPositions.slice(1).forEach(pos => {
      doc.line(pos, tableY, pos, tableY + tableHeight);
    });

    // Header text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Serviço', colPositions[0] + 2, tableY + 5);
    doc.text('Quantidade', colPositions[1] + 2, tableY + 5);
    doc.text('Preço Unit.', colPositions[2] + 2, tableY + 5);
    doc.text('Sub-total', colPositions[3] + 2, tableY + 5);

    yPosition = tableY + tableHeight;

    // Service rows
    doc.setFont('helvetica', 'normal');
    budgetItems.forEach((item, index) => {
      const rowY = yPosition;
      
      // Row borders
      doc.rect(leftColX, rowY, tableWidth, tableHeight);
      colPositions.slice(1).forEach(pos => {
        doc.line(pos, rowY, pos, rowY + tableHeight);
      });

      // Row data
      doc.text(item.service_name.substring(0, 35), colPositions[0] + 2, rowY + 5);
      doc.text(item.quantity.toString(), colPositions[1] + 2, rowY + 5);
      doc.text(`R$ ${item.unit_price.toFixed(2)}`, colPositions[2] + 2, rowY + 5);
      doc.text(`R$ ${item.total_price.toFixed(2)}`, colPositions[3] + 2, rowY + 5);
      
      yPosition += tableHeight;
    });

    // Total services row
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Total em Serviços:', leftColX, yPosition);
    doc.text(`R$ ${budget.total_amount.toFixed(2)}`, colPositions[3] + 2, yPosition);

    yPosition += 8;

    // Final total section with border
    const totalBoxY = yPosition;
    const totalBoxHeight = 12;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(leftColX, totalBoxY, tableWidth, totalBoxHeight, 'F');
    doc.rect(leftColX, totalBoxY, tableWidth, totalBoxHeight);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Valor Total:', leftColX + 2, totalBoxY + 8);
    doc.text(`R$ ${budget.final_amount.toFixed(2)}`, colPositions[3] + 2, totalBoxY + 8);

    yPosition += totalBoxHeight + 15;

    // Observations
    if (budget.observations && yPosition < pageHeight - 30) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Observações:', leftColX, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      const splitObservations = doc.splitTextToSize(budget.observations, pageWidth - 2 * margin);
      doc.text(splitObservations, leftColX, yPosition);
    }

    // Footer with date and budget number
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Orçamento: ${budget.budget_number}`, leftColX, pageHeight - 15);
    doc.text(`Data: ${format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}`, pageWidth - margin, pageHeight - 15, { align: 'right' });

    // Save PDF
    doc.save(`orcamento-${budget.budget_number}.pdf`);
  };

  const handlePrint = () => {
    // Create a new window with the standardized print layout
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orçamento ${budget.budget_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 12px; 
              line-height: 1.4;
              padding: 20px;
              background: white;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              position: relative;
            }
            .logo {
              width: 60px;
              height: 60px;
              background: #ffff00;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 10px;
            }
            .company-info {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
              text-align: center;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .company-address {
              font-size: 12px;
              color: #666;
            }
            .contact-info {
              text-align: right;
              font-size: 10px;
              color: #666;
            }
            .title {
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              margin: 20px 0;
            }
            .content {
              display: flex;
              gap: 30px;
              margin-bottom: 20px;
            }
            .column {
              flex: 1;
            }
            .section-title {
              font-weight: bold;
              margin-bottom: 8px;
            }
            .info-item {
              margin-bottom: 4px;
            }
            .services-section {
              margin: 20px 0;
            }
            .services-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            .services-table th,
            .services-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            .services-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .total-section {
              margin: 15px 0;
            }
            .total-box {
              background-color: #f0f0f0;
              border: 1px solid #000;
              padding: 10px;
              text-align: right;
              font-size: 14px;
              font-weight: bold;
            }
            .observations {
              margin: 20px 0;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
              font-size: 10px;
              color: #666;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">LOGO</div>
            <div class="company-info">
              <div class="company-name">${settings?.company_name || 'Nome da Empresa'}</div>
              ${settings?.company_address ? `<div class="company-address">${settings.company_address}</div>` : ''}
            </div>
            <div class="contact-info">
              ${settings?.company_phone ? `<div>Telefone: ${settings.company_phone}</div>` : ''}
              ${settings?.company_email ? `<div>Email: ${settings.company_email}</div>` : ''}
            </div>
          </div>

          <div class="title">ORÇAMENTO</div>

          <div class="content">
            <div class="column">
              <div class="section-title">Cliente:</div>
              <div class="info-item">Nome: ${budget.customer_name}</div>
            </div>
            
            ${budget.vehicle_name || budget.vehicle_plate ? `
            <div class="column">
              <div class="section-title">Veículo:</div>
              ${budget.vehicle_name ? `<div class="info-item">Modelo: ${budget.vehicle_name}</div>` : ''}
              ${budget.vehicle_plate ? `<div class="info-item">Placa: ${budget.vehicle_plate}</div>` : ''}
              ${budget.vehicle_year ? `<div class="info-item">Ano: ${budget.vehicle_year}</div>` : ''}
            </div>
            ` : ''}
          </div>

          <div class="services-section">
            <div class="section-title">Serviços:</div>
            <table class="services-table">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Quantidade</th>
                  <th>Preço Unit.</th>
                  <th>Sub-total</th>
                </tr>
              </thead>
              <tbody>
                ${budgetItems.map(item => `
                  <tr>
                    <td>${item.service_name}</td>
                    <td>${item.quantity}</td>
                    <td>R$ ${item.unit_price.toFixed(2)}</td>
                    <td>R$ ${item.total_price.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="text-align: right; font-weight: bold; margin-bottom: 10px;">
              Total em Serviços: R$ ${budget.total_amount.toFixed(2)}
            </div>
          </div>

          <div class="total-section">
            <div class="total-box">
              Valor Total: R$ ${budget.final_amount.toFixed(2)}
            </div>
          </div>

          ${budget.observations ? `
          <div class="observations">
            <div class="section-title">Observações:</div>
            <div>${budget.observations}</div>
          </div>
          ` : ''}

          <div class="footer">
            <div>Orçamento: ${budget.budget_number}</div>
            <div>Data: ${format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
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
            {isAdmin && (
              <Button variant="outline" onClick={handlePrint} className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm">
                <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 sm:ml-2">Imprimir</span>
              </Button>
            )}
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
