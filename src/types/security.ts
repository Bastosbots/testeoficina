
export interface SecurityAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_name?: string;
}
