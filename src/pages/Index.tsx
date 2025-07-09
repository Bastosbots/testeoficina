
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Shield, User, Car } from "lucide-react";
import { toast } from "sonner";
import AdminDashboard from "@/components/AdminDashboard";
import MechanicDashboard from "@/components/MechanicDashboard";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    userType: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples para demonstração
    const validUsers = {
      'admin': { type: 'admin', name: 'Administrador' },
      'mecanico': { type: 'mechanic', name: 'João Silva' }
    };

    const user = validUsers[loginData.username as keyof typeof validUsers];
    
    if (user && loginData.password === '123456' && loginData.userType === user.type) {
      setIsLoggedIn(true);
      setUserType(user.type);
      setCurrentUser(user.name);
      toast.success(`Bem-vindo, ${user.name}!`);
    } else {
      toast.error('Credenciais inválidas. Tente "admin" ou "mecanico" com senha 123456');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType('');
    setCurrentUser('');
    setLoginData({ username: '', password: '', userType: '' });
    toast.success('Logout realizado com sucesso!');
  };

  if (isLoggedIn) {
    return userType === 'admin' ? (
      <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
    ) : (
      <MechanicDashboard currentUser={currentUser} onLogout={handleLogout} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center p-4">
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
          
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userType" className="text-foreground font-medium">
                  Perfil de Acesso
                </Label>
                <Select value={loginData.userType} onValueChange={(value) => 
                  setLoginData(prev => ({...prev, userType: value}))
                }>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selecione seu perfil" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="admin" className="text-foreground hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Administrador
                      </div>
                    </SelectItem>
                    <SelectItem value="mechanic" className="text-foreground hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" />
                        Mecânico
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">
                  Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={loginData.username}
                  onChange={(e) => setLoginData(prev => ({...prev, username: e.target.value}))}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2">
                Entrar no Sistema
              </Button>
            </form>

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

export default Index;
