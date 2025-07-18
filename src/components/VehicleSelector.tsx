
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Car } from "lucide-react";
import { useChecklists } from "@/hooks/useChecklists";
import { useAuth } from "@/hooks/useAuth";

interface VehicleSelectorProps {
  onVehicleSelect: (vehicle: { customer_name: string; vehicle_name: string; plate: string }) => void;
}

const VehicleSelector = ({ onVehicleSelect }: VehicleSelectorProps) => {
  const { data: checklists = [] } = useChecklists();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  // Filtrar checklists baseado no papel do usuário
  const filteredChecklists = checklists.filter(checklist => {
    // Se for admin, ver todos os checklists
    if (profile?.role === 'admin') {
      return true;
    }
    // Se for mecânico, ver apenas os próprios checklists
    return checklist.mechanic_id === profile?.id;
  }).filter(checklist => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      checklist.customer_name.toLowerCase().includes(searchLower) ||
      checklist.vehicle_name.toLowerCase().includes(searchLower) ||
      checklist.plate.toLowerCase().includes(searchLower)
    );
  });

  const handleVehicleSelect = (checklist: any) => {
    onVehicleSelect({
      customer_name: checklist.customer_name,
      vehicle_name: checklist.vehicle_name,
      plate: checklist.plate
    });
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Car className="h-4 w-4 mr-2" />
          Selecionar Veículo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar Veículo de Checklist</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, veículo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {filteredChecklists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-sm">
                  {profile?.role === 'admin' 
                    ? 'Nenhum checklist encontrado.' 
                    : 'Nenhum checklist criado por você foi encontrado.'
                  }
                </p>
                <p className="text-xs mt-1">
                  {searchTerm 
                    ? 'Tente alterar os termos de busca.' 
                    : 'Crie um checklist primeiro para poder selecionar veículos.'
                  }
                </p>
              </div>
            ) : (
              filteredChecklists.map((checklist) => (
                <div
                  key={checklist.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleVehicleSelect(checklist)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{checklist.customer_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {checklist.vehicle_name} - {checklist.plate}
                      </p>
                      {profile?.role === 'admin' && checklist.mechanic?.full_name && (
                        <p className="text-xs text-muted-foreground">
                          Mecânico: {checklist.mechanic.full_name}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(checklist.created_at).toLocaleDateString('pt-BR')}
                    </div>
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

export default VehicleSelector;
