import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus, Edit, Search, Filter, X, DollarSign } from "lucide-react";
import { useServices, useCreateService, useUpdateService } from "@/hooks/useServices";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ServiceFormData {
  name: string;
  category: string;
  unit_price: number;
  description: string;
  is_active: boolean;
}

const ServicesTable = () => {
  const { data: services = [], isLoading } = useServices();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const { profile } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    category: '',
    unit_price: 0,
    description: '',
    is_active: true
  });

  const isAdmin = profile?.role === 'admin';
  const isMechanic = profile?.role === 'mechanic';

  // Filter services based on search and filters
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = searchTerm === '' || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
      const matchesActive = activeFilter === 'all' || 
        (activeFilter === 'active' && service.is_active) ||
        (activeFilter === 'inactive' && !service.is_active);

      return matchesSearch && matchesCategory && matchesActive;
    });
  }, [services, searchTerm, categoryFilter, activeFilter]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(services.map(service => service.category))];
    return uniqueCategories.sort();
  }, [services]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setActiveFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'all' || activeFilter !== 'all';

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      unit_price: 0,
      description: '',
      is_active: true
    });
    setEditingService(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: any) => {
    setFormData({
      name: service.name,
      category: service.category,
      unit_price: service.unit_price,
      description: service.description || '',
      is_active: service.is_active
    });
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        await updateServiceMutation.mutateAsync({
          id: editingService.id,
          ...formData
        });
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await createServiceMutation.mutateAsync(formData);
        toast.success('Serviço criado com sucesso!');
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(editingService ? 'Erro ao atualizar serviço' : 'Erro ao criar serviço');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isAdmin ? 'lg:zoom-90' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className={`font-bold ${isAdmin ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl'}`}>
            Tabela de Serviços
          </h1>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className={isAdmin ? 'text-sm' : 'text-base'}>
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className={isAdmin ? 'text-xs' : 'text-sm'}>
                    Nome do Serviço
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Troca de óleo"
                    required
                    className={isAdmin ? 'h-8 text-xs' : 'h-10'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className={isAdmin ? 'text-xs' : 'text-sm'}>
                    Categoria
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Manutenção"
                    required
                    className={isAdmin ? 'h-8 text-xs' : 'h-10'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit_price" className={isAdmin ? 'text-xs' : 'text-sm'}>
                    Preço Unitário (R$)
                  </Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                    className={isAdmin ? 'h-8 text-xs' : 'h-10'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className={isAdmin ? 'text-xs' : 'text-sm'}>
                    Descrição (opcional)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição detalhada do serviço"
                    rows={3}
                    className={isAdmin ? 'text-xs' : ''}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active" className={isAdmin ? 'text-xs' : 'text-sm'}>
                    Serviço ativo
                  </Label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className={`flex-1 ${isAdmin ? 'h-8 text-xs' : 'h-10'}`}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                    className={`flex-1 ${isAdmin ? 'h-8 text-xs' : 'h-10'}`}
                  >
                    {(createServiceMutation.isPending || updateServiceMutation.isPending) ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center gap-2 ${isAdmin ? 'text-sm' : 'text-base'}`}>
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className={`ml-auto text-muted-foreground hover:text-foreground ${isAdmin ? 'text-xs' : 'text-sm'}`}
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 ${isAdmin ? 'h-8 text-xs' : 'h-10'}`}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className={isAdmin ? 'h-8 text-xs' : 'h-10'}>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isAdmin && (
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className={isAdmin ? 'h-8 text-xs' : 'h-10'}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className={`flex items-center gap-2 text-muted-foreground ${isAdmin ? 'text-xs' : 'text-sm'}`}>
        <span>
          Mostrando {filteredServices.length} de {services.length} serviços
        </span>
        {hasActiveFilters && (
          <span className="text-primary">
            (com filtros aplicados)
          </span>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Nome</TableHead>
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Categoria</TableHead>
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Preço</TableHead>
                {isAdmin && (
                  <>
                    <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Descrição</TableHead>
                    <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Status</TableHead>
                    <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Ações</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 3} className={`text-center py-8 text-muted-foreground ${isAdmin ? 'text-xs' : 'text-sm'}`}>
                    {hasActiveFilters ? 'Nenhum serviço encontrado com os filtros aplicados.' : 'Nenhum serviço encontrado.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className={`font-medium ${isAdmin ? 'text-xs py-2' : isMechanic ? 'text-sm py-3' : 'text-sm py-3'}`}>
                      {service.name}
                    </TableCell>
                    <TableCell className={isAdmin ? 'text-xs py-2' : isMechanic ? 'text-sm py-3' : 'text-sm py-3'}>
                      {service.category}
                    </TableCell>
                    <TableCell className={isAdmin ? 'text-xs py-2' : isMechanic ? 'text-sm py-3' : 'text-sm py-3'}>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        {service.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <>
                        <TableCell className={isAdmin ? 'text-xs py-2' : 'text-sm py-3'}>
                          <div className="max-w-xs truncate" title={service.description}>
                            {service.description || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className={isAdmin ? 'py-2' : 'py-3'}>
                          <Badge 
                            variant={service.is_active ? 'default' : 'secondary'}
                            className={isAdmin ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'}
                          >
                            {service.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className={isAdmin ? 'py-2' : 'py-3'}>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditDialog(service)}
                            title="Editar serviço"
                            className={isAdmin ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
                          >
                            <Edit className={isAdmin ? 'h-3 w-3' : 'h-4 w-4'} />
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesTable;
