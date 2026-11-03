import { useEffect, useState } from 'react';
import {
  getLoginUrl,
  isValidToken,
  hasValidUcdbToken,
  getCookie,
  hasAdminRole,
} from '@/services/api';

import { usePermissions } from '@/contexts/PermissionsContext';

interface ProtectedPageProps {
  children: React.ReactNode;
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const { status, isLoading: isPermissionsLoading } = usePermissions();

  useEffect(() => {
    const biotToken = getCookie('bioterio_token');

    // Se não tiver token nenhum, redireciona para o login
    if (!isValidToken(biotToken) && !hasValidUcdbToken()) {
      window.location.href = getLoginUrl(window.location.pathname);
      return;
    }

    // Se o token for válido, todos (alunos ou professores/funcionários)
    // DEVEM passar pela checagem de role (que valida gestao-bioterio-admin ou gestao-bioterio-user)
    if (hasAdminRole()) {
      setIsAuthed(true);
    } else {
      setIsAuthed(false); 
    }
  }, []);

  if (isAuthed === null || isPermissionsLoading) {
    return <div className="flex items-center justify-center h-screen">Verificando autenticação e permissões...</div>;
  }

  if (!isAuthed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-bold">Acesso negado</h2>
        <p>Você não tem permissão para acessar o sistema do Biotério.</p>
      </div>
    );
  }

  if (status === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Usuário Inativo</h2>
        <p className="text-muted-foreground max-w-md">
          Seu cadastro está inativo no sistema do Biotério e você não possui permissão para acessar nenhuma funcionalidade.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Caso considere isso um engano, entre em contato com o administrador do sistema.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
