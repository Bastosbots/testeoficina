
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useInviteTokens, useCreateInviteToken, useDeleteInviteToken } from "@/hooks/useInviteTokens";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const InviteTokenManager = () => {
  const { profile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);

  // Usar hooks com realtime
  const createTokenMutation = useCreateInviteToken();
  const deleteTokenMutation = useDeleteInviteToken();

  // Buscar tokens com perfis relacionados
  const { data: tokens = [] } = useQuery({
    queryKey: ['invite-tokens-with-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invite_tokens')
        .select(`
          *,
          profiles!invite_tokens_created_by_fkey(full_name),
          used_by_profile:profiles!invite_tokens_used_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: profile?.role === 'admin'
  });

  const handleGenerateToken = () => {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    createTokenMutation.mutate({
      token,
      created_by: profile?.id,
      expires_at: expiresAt.toISOString()
    });
    
    if (!createTokenMutation.isError) {
      setIsDialogOpen(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/register/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Link de convite copiado!');
  };

  const getTokenStatus = (token: any) => {
    if (token.used_at) {
      return { status: 'used', icon: CheckCircle, color: 'text-green-600', label: 'Usado' };
    }
    
    const now = new Date();
    const expiresAt = new Date(token.expires_at);
    
    if (expiresAt < now) {
      return { status: 'expired', icon: XCircle, color: 'text-red-600', label: 'Expirado' };
    }
    
    return { status: 'active', icon: Clock, color: 'text-yellow-600', label: 'Ativo' };
  };

  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tokens de Convite
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Gerar Token
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Gerar Token de Convite</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expiration">Dias para expiração</Label>
                  <Input
                    id="expiration"
                    type="number"
                    min="1"
                    max="30"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(Number(e.target.value))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleGenerateToken} 
                    disabled={createTokenMutation.isPending}
                  >
                    {createTokenMutation.isPending ? "Gerando..." : "Gerar Token"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tokens.map((token) => {
            const { status, icon: StatusIcon, color, label } = getTokenStatus(token);
            const inviteUrl = `${window.location.origin}/register/${token.token}`;
            
            return (
              <div key={token.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className={`h-5 w-5 ${color}`} />
                      <span className={`font-medium ${color}`}>{label}</span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>
                        <strong>Criado em:</strong> {new Date(token.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <strong>Expira em:</strong> {new Date(token.expires_at).toLocaleDateString('pt-BR')}
                      </div>
                      {token.used_at && (
                        <div>
                          <strong>Usado em:</strong> {new Date(token.used_at).toLocaleDateString('pt-BR')}
                          {token.used_by_profile && (
                            <span> por {token.used_by_profile.full_name}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {status === 'active' && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={inviteUrl}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyInviteLink(token.token)}
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-4 w-4" />
                            Copiar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {tokens.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum token de convite criado ainda.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteTokenManager;
