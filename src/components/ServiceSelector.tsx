
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Plus, Wrench, AlertCircle } from 'lucide-react';
import { useServices, Service } from '@/hooks/useServices';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ServiceSelectorProps {
  onServiceSelect: (service: Service) => void;
}

const ServiceSelector = ({ onServiceSelect }: ServiceSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: services = [], isLoading, error } = useServices();

  console.log('ServiceSelector - Estado atual:');
  console.log('- services:', services);
  console.log('- isLoading:', isLoading);
  console.log('- error:', error);
  console.log('- Total de serviços:', services.length);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleServiceSelect = (service: Service) => {
    console.log('Serviço selecionado:', service);
    onServiceSelect(service);
    setOpen(false);
    setSearchTerm(''); // Limpar busca ao fechar
  };

  const groupedServices = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="mobile-btn lg:h-10 lg:px-4">
          <Plus className="h-4 w-4" />
          <span className="ml-2">Adicionar Serviço</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Selecionar Serviço</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar serviços por nome, categoria ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando serviços cadastrados...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar serviços: {error.message}
                  <br />
                  <small>Verifique se existem serviços cadastrados e se você tem permissão para visualizá-los.</small>
                </AlertDescription>
              </Alert>
            ) : services.length === 0 ? (
              <Alert>
                <Wrench className="h-4 w-4" />
                <AlertDescription>
                  Nenhum serviço cadastrado foi encontrado.
                  <br />
                  <small>Entre em contato com a administração para cadastrar novos serviços.</small>
                </AlertDescription>
              </Alert>
            ) : Object.keys(groupedServices).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum serviço encontrado</p>
                <p className="text-sm">Tente ajustar o termo de busca</p>
              </div>
            ) : (
              Object.entries(groupedServices).map(([category, categoryServices]) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide border-b pb-1">
                    {category} ({categoryServices.length})
                  </h3>
                  <div className="space-y-2">
                    {categoryServices.map((service) => (
                      <div
                        key={service.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleServiceSelect(service)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{service.name}</h4>
                              <Badge variant="secondary">{service.category}</Badge>
                            </div>
                            {service.description && (
                              <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">R$ {service.unit_price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {!isLoading && services.length > 0 && (
            <div className="text-xs text-muted-foreground text-center border-t pt-2">
              Total: {services.length} serviços cadastrados
              {searchTerm && ` | Filtrados: ${filteredServices.length}`}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceSelector;
