
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [signInData, setSignInData] = useState({
    username: '',
    password: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(signInData.username, signInData.password);
    
    if (error) {
      toast.error('Erro ao fazer login: ' + error.message);
    } else {
      toast.success('Login realizado com sucesso!');
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-border bg-card backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-3 rounded-full">
                <Car className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              MECSYS
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sistema de Checklist Digital
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-username">Usuário</Label>
                <Input
                  id="signin-username"
                  type="text"
                  placeholder="Seu nome de usuário"
                  value={signInData.username}
                  onChange={(e) => setSignInData(prev => ({...prev, username: e.target.value}))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Senha</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={signInData.password}
                  onChange={(e) => setSignInData(prev => ({...prev, password: e.target.value}))}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/signup')}
              >
                Criar Nova Conta
              </Button>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-primary">MecSys</p>
                <p className="text-xs text-muted-foreground">Desenvolvido por Aliffer</p>
                <p className="text-xs text-muted-foreground">© 2025 - Todos os direitos reservados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
