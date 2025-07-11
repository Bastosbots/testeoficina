
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Shield, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);

  const [signInData, setSignInData] = useState({
    username: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'mechanic'
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(
      signUpData.username, 
      signUpData.password, 
      signUpData.fullName, 
      signUpData.role
    );
    
    if (error) {
      toast.error('Erro ao criar conta: ' + error.message);
    } else {
      toast.success('Conta criada com sucesso!');
      setActiveTab('signin');
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
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
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData(prev => ({...prev, fullName: e.target.value}))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Usuário</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Nome de usuário"
                      value={signUpData.username}
                      onChange={(e) => setSignUpData(prev => ({...prev, username: e.target.value}))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Perfil</Label>
                    <Select value={signUpData.role} onValueChange={(value) => 
                      setSignUpData(prev => ({...prev, role: value}))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Administrador
                          </div>
                        </SelectItem>
                        <SelectItem value="mechanic">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            Mecânico
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({...prev, password: e.target.value}))}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

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
