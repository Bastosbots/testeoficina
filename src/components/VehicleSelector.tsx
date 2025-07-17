
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Car } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Vehicle {
  id: string;
  customer_name: string;
  vehicle_name: string;
  plate: string;
}

interface VehicleSelectorProps {
  onVehicleSelect: (vehicle: { customer_name: string; vehicle_name: string; plate: string }) => void;
}

const VehicleSelector = ({ onVehicleSelect }: VehicleSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-for-budget'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select('id, customer_name, vehicle_name, plate')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Remove duplicates based on plate
      const uniqueVehicles = data.reduce((acc: Vehicle[], current) => {
        const exists = acc.find(item => item.plate === current.plate);
        if (!exists) {
          acc.push({
            id: current.id,
            customer_name: current.customer_name,
            vehicle_name: current.vehicle_name,
            plate: current.plate
          });
        }
        return acc;
      }, []);

      return uniqueVehicles;
    },
  });

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVehicleSelect = (vehicle: Vehicle) => {
    onVehicleSelect({
      customer_name: vehicle.customer_name,
      vehicle_name: vehicle.vehicle_name,
      plate: vehicle.plate
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <Car className="h-4 w-4 mr-2" />
          Selecionar de Checklist Existente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar Veículo dos Checklists</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, veículo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum veículo encontrado</p>
              </div>
            ) : (
              filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">Cliente</Label>
                      <p className="font-medium">{vehicle.customer_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Veículo</Label>
                      <p className="font-medium">{vehicle.vehicle_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Placa</Label>
                      <p className="font-medium">{vehicle.plate}</p>
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
