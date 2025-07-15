
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
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Visualizar Checklist</h1>
              <p className="text-muted-foreground">
                {checklist.vehicles?.vehicle_name} - {checklist.vehicles?.plate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={checklist.completed_at ? "default" : "secondary"} className="text-lg px-4 py-2">
              {checklist.completed_at ? 'Concluído' : 'Pendente'}
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checklist Items */}
          <div className="lg:col-span-2">
            {/* Progress Card */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Progresso do Checklist</span>
                  <span className="text-sm text-muted-foreground">
                    {checkedItems}/{totalItems} itens ({Math.round((checkedItems / totalItems) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${(checkedItems / totalItems) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Itens Verificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categories.map(category => (
                  <div key={category} className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Badge variant="outline">{category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        ({groupedItems[category].filter((item: any) => item.checked).length}/
                        {groupedItems[category].length})
                      </span>
                    </h3>
                    
                    <div className="space-y-3">
                      {groupedItems[category].map((item: any) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {item.checked ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-medium ${item.checked ? 'text-green-600' : 'text-red-500'}`}>
                                  {item.item_name}
                                </span>
                                <Badge variant={item.checked ? "default" : "destructive"} className="text-xs">
                                  {item.checked ? 'OK' : 'Não Verificado'}
                                </Badge>
                              </div>
                              {item.observation && (
                                <div className="mt-2 p-2 bg-muted rounded text-sm">
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
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum item encontrado neste checklist.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Info */}
          <div className="space-y-6">
            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Informações do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Veículo</span>
                  <p className="font-semibold">{checklist.vehicles?.vehicle_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Placa</span>
                  <p className="font-semibold">{checklist.vehicles?.plate}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Cliente</span>
                  <p className="font-semibold">{checklist.vehicles?.customer_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Ordem de Serviço</span>
                  <p className="font-semibold">{checklist.vehicles?.service_order}</p>
                </div>
              </CardContent>
            </Card>

            {/* Checklist Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Informações do Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Mecânico
                  </span>
                  <p className="font-semibold">{checklist.profiles?.full_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Data de Criação
                  </span>
                  <p className="font-semibold">
                    {new Date(checklist.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                {checklist.completed_at && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Data de Conclusão
                    </span>
                    <p className="font-semibold">
                      {new Date(checklist.completed_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* General Observations */}
            {checklist.general_observations && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{checklist.general_observations}</p>
                </CardContent>
              </Card>
            )}

            {/* Video */}
            {checklist.video_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Vídeo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={checklist.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
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
