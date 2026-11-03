import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionsContext';
import { toast } from 'sonner';

interface RequirePermissionProps {
  funcionalidade: string;
  nivelMinimo?: string;
  children: React.ReactNode;
}

export default function RequirePermission({ 
  funcionalidade, 
  nivelMinimo = 'Visualizar', 
  children 
}: RequirePermissionProps) {
  const { hasPermission, isLoading } = usePermissions();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center">Verificando permissões...</div>;
  }

  if (!hasPermission(funcionalidade, nivelMinimo)) {
    toast.error(`Acesso negado: Você não tem permissão para acessar esta área (${funcionalidade} - ${nivelMinimo}).`);
    
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
