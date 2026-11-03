import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isBioterioAdmin } from '@/services/api';
import { toast } from 'sonner';

interface RequireRoleProps {
  role?: string;
  children: React.ReactNode;
}

export default function RequireRole({
  role = 'gestao-bioterio-admin',
  children,
}: RequireRoleProps) {
  const location = useLocation();

  // Verifica se o usuário possui a role necessária
  const hasRequiredRole = role === 'gestao-bioterio-admin' ? isBioterioAdmin() : false;

  if (!hasRequiredRole) {
    toast.error('Acesso restrito: Apenas administradores do biotério podem acessar esta funcionalidade.');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
