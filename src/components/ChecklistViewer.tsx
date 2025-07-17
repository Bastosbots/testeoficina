
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Car, FileText, CheckCircle, XCircle, Video, Calendar, User } from "lucide-react";
import { useChecklistItems } from "@/hooks/useChecklistItems";

interface ChecklistViewerProps {
  checklist: any;
  onBack: () => void;
}

const ChecklistViewer = ({ checklist, onBack }: ChecklistViewerProps) => {
  const { data: items = [] } = useChecklistItems(checklist.id);

  const groupedItems = items.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedItems);
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
            {/* Progress Card */}
            <Card className="mb-4 lg:mb-6">
              <CardContent className="mobile-card-padding lg:pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="mobile-text-xs lg:text-sm font-medium text-foreground">Progresso do Checklist</span>
                  <span className="mobile-text-xs lg:text-sm text-muted-foreground">
                    {checkedItems}/{totalItems} itens ({totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 lg:h-3">
                  <div 
                    className="bg-primary h-2 lg:h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${totalItems > 0 ? (checkedItems / totalItems) * 100 : 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="mobile-card-padding lg:p-6">
                <CardTitle className="flex items-center gap-1 lg:gap-2 mobile-text-sm lg:text-lg">
                  <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
                  Itens Verificados
                </CardTitle>
              </CardHeader>
              <CardContent className="mobile-card-padding lg:p-6">
                {categories.map(category => (
                  <div key={category} className="mb-4 lg:mb-6">
                    <h3 className="font-semibold text-foreground mb-2 lg:mb-3 flex items-center gap-1 lg:gap-2">
                      <Badge variant="outline" className="mobile-text-xs lg:text-sm">{category}</Badge>
                      <span className="mobile-text-xs lg:text-sm text-muted-foreground">
                        ({groupedItems[category].filter((item: any) => item.checked).length}/
                        {groupedItems[category].length})
                      </span>
                    </h3>
                    
                    <div className="space-y-2 lg:space-y-3">
                      {groupedItems[category].map((item: any) => (
                        <div key={item.id} className="border rounded-lg mobile-card-padding lg:p-4">
                          <div className="flex items-start gap-2 lg:gap-3">
                            <div className="mt-1">
                              {item.checked ? (
                                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1 lg:gap-2 mb-1">
                                <span className={`mobile-text-xs lg:text-sm font-medium ${item.checked ? 'text-green-600' : 'text-red-500'}`}>
                                  {item.item_name}
                                </span>
                                <Badge variant={item.checked ? "default" : "destructive"} className="mobile-text-xs lg:text-xs px-1 lg:px-2 py-0.5">
                                  {item.checked ? 'OK' : 'Não Verificado'}
                                </Badge>
                              </div>
                              {item.observation && (
                                <div className="mt-1 lg:mt-2 p-1 lg:p-2 bg-muted rounded mobile-text-xs lg:text-sm">
                                  <strong>Observação:</strong> {item.observation}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-6 lg:py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 opacity-50" />
                    <p className="mobile-text-xs lg:text-base">Nenhum item encontrado neste checklist.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Info */}
          <div className="space-y-3 lg:space-y-6">
            {/* Vehicle Information */}
            <Card>
              <CardHeader className="mobile-card-padding lg:p-6">
                <CardTitle className="flex items-center gap-1 lg:gap-2 mobile-text-sm lg:text-lg">
                  <Car className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                  Informações do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="mobile-card-padding lg:p-6 space-y-2 lg:space-y-3">
                <div>
                  <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground">Veículo</span>
                  <p className="mobile-text-xs lg:text-sm font-semibold">{checklist.vehicle_name}</p>
                </div>
                <div>
                  <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground">Placa</span>
                  <p className="mobile-text-xs lg:text-sm font-semibold">{checklist.plate}</p>
                </div>
                <div>
                  <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground">Cliente</span>
                  <p className="mobile-text-xs lg:text-sm font-semibold">{checklist.customer_name}</p>
                </div>
                <div>
                  <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground">Ordem de Serviço</span>
                  <p className="mobile-text-xs lg:text-sm font-semibold">{checklist.service_order}</p>
                </div>
                <div>
                  <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground">Prioridade</span>
                  <Badge variant={checklist.priority === 'Alta' ? 'destructive' : 'secondary'} className="mobile-text-xs lg:text-sm px-1 lg:px-2 py-0.5">
                    {checklist.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Checklist Information */}
            <Card>
              <CardHeader className="mobile-card-padding lg:p-6">
                <CardTitle className="flex items-center gap-1 lg:gap-2 mobile-text-sm lg:text-lg">
                  <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                  Informações do Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="mobile-card-padding lg:p-6 space-y-2 lg:space-y-3">
                <div>
                  <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3 lg:h-4 lg:w-4" />
                    Mecânico
                  </span>
                  <p className="mobile-text-xs lg:text-sm font-semibold">{checklist.profiles?.full_name || 'Usuário'}</p>
                </div>
                <div>
                  <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                    Data de Criação
                  </span>
                  <p className="mobile-text-xs lg:text-sm font-semibold">
                    {new Date(checklist.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                {checklist.completed_at && (
                  <div>
                    <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                      Data de Conclusão
                    </span>
                    <p className="mobile-text-xs lg:text-sm font-semibold">
                      {new Date(checklist.completed_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* General Observations */}
            {checklist.general_observations && (
              <Card>
                <CardHeader className="mobile-card-padding lg:p-6">
                  <CardTitle className="mobile-text-sm lg:text-lg">Observações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="mobile-card-padding lg:p-6">
                  <p className="mobile-text-xs lg:text-sm whitespace-pre-wrap">{checklist.general_observations}</p>
                </CardContent>
              </Card>
            )}

            {/* Video */}
            {checklist.video_url && (
              <Card>
                <CardHeader className="mobile-card-padding lg:p-6">
                  <CardTitle className="flex items-center gap-1 lg:gap-2 mobile-text-sm lg:text-lg">
                    <Video className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                    Vídeo
                  </CardTitle>
                </CardHeader>
                <CardContent className="mobile-card-padding lg:p-6">
                  <a
                    href={checklist.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-text-xs lg:text-sm text-primary hover:underline break-all"
                  >
                    {checklist.video_url}
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistViewer;
