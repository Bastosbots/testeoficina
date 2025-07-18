
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Eye } from "lucide-react";
import { useSecurityAudit } from "@/hooks/useSecurityAudit";
import { useAuth } from "@/hooks/useAuth";
import type { SecurityAuditLog as SecurityAuditLogType } from "@/types/security";

const SecurityAuditLog = () => {
  const { profile } = useAuth();
  const { data: auditLogs = [], isLoading } = useSecurityAudit();

  if (profile?.role !== 'admin') {
    return null;
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'privilege_escalation_attempt':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'admin_action':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string): "default" | "secondary" | "destructive" => {
    switch (action.toLowerCase()) {
      case 'privilege_escalation_attempt':
        return 'destructive';
      case 'admin_action':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Log de Auditoria de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Carregando logs...</div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum evento de segurança registrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log: SecurityAuditLogType) => (
              <div key={log.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <span className="text-sm font-medium">{log.resource}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Por: {log.user_name || 'Sistema'} | {new Date(log.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                {log.details && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <pre className="whitespace-pre-wrap">
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;
