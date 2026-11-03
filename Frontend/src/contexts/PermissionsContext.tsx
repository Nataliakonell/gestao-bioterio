import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { getActiveToken, isValidToken } from '@/services/api';

export interface PermissaoDto {
  funcionalidade: string;
  nivelAcesso: string;
}

export interface MyPermissoesVm {
  isAdmin: boolean;
  status?: boolean;
  permissoes: PermissaoDto[];
}

interface PermissionsContextData {
  isAdmin: boolean;
  status: boolean;
  permissoes: PermissaoDto[];
  isLoading: boolean;
  hasPermission: (funcionalidade: string, nivelMinimo?: string) => boolean;
}

const NiveisAcesso: Record<string, number> = {
  SemAcesso: 1,
  Visualizar: 2,
  Editar: 3,
  Gerenciar: 4,
};

const PermissionsContext = createContext<PermissionsContextData>({} as PermissionsContextData);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState(true);
  const [permissoes, setPermissoes] = useState<PermissaoDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissoes = async () => {
      const token = getActiveToken();
      if (!isValidToken(token)) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<MyPermissoesVm>('/Usuario/me/permissoes');
        setIsAdmin(response.data.isAdmin);
        setStatus(response.data.status ?? true);
        setPermissoes(response.data.permissoes || []);
      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissoes();
  }, []);

  const hasPermission = (funcionalidade: string, nivelMinimo: string = 'Visualizar'): boolean => {
    if (status === false) return false;
    if (isAdmin) return true;

    const permissao = permissoes.find((p) => p.funcionalidade === funcionalidade);
    if (!permissao) return false;

    const valorAtual = NiveisAcesso[permissao.nivelAcesso] || 1;
    const valorMinimo = NiveisAcesso[nivelMinimo] || 2;

    return valorAtual >= valorMinimo;
  };

  return (
    <PermissionsContext.Provider value={{ isAdmin, status, permissoes, isLoading, hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionsProvider');
  }
  return context;
}
