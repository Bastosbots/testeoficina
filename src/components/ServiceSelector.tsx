
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Wrench } from 'lucide-react';
import { useServices, Service } from '@/hooks/useServices';
import { Badge } from '@/components/ui/badge';

interface ServiceSelectorProps {
  onServiceSelect: (service: Service) => void;
}

const ServiceSelector = ({ onServiceSelect }: ServiceSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: services = [], isLoading } = useServices();

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceSelect = (service: Service) => {
    onServiceSelect(service);
    setOpen(false);
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
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando serviços...</p>
              </div>
            ) : Object.keys(groupedServices).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum serviço encontrado</p>
              </div>
            ) : (
              Object.entries(groupedServices).map(([category, categoryServices]) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {category}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceSelector;
