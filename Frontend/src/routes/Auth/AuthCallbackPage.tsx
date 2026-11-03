import { useEffect, useRef, useState } from 'react'
import { saveToken, getLoginUrl, clearLogoutFlag } from '@/services/api'

interface AuthState {
  status: 'loading' | 'error' | 'success';
  errorMessage?: string;
  targetRedirect: string;
}

function getTargetRedirect(): string {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || params.get('returnUrl');
  
  if (!redirect || redirect === 'undefined' || redirect === 'null') {
    return '/';
  }
  
  if (redirect.startsWith('/') && !redirect.toLowerCase().includes('/auth/callback')) {
    return redirect;
  }
  
  try {
    const url = new URL(redirect, window.location.origin);
    if (url.pathname.toLowerCase().includes('/auth/callback')) {
      return '/';
    }
  
    return url.pathname + url.search;
  } catch {

    if (!redirect.toLowerCase().includes('/auth/callback')) {
      return redirect.startsWith('/') ? redirect : '/' + redirect;
    }
    return '/';
  }
}

export default function AuthCallbackPage() {
  const hasHandledRef = useRef(false);
  const [authState, setAuthState] = useState<AuthState>({
    status: 'loading',
    targetRedirect: '/'
  });

  useEffect(() => {
    if (hasHandledRef.current) return;
    hasHandledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const errorParam = params.get('error');
    const errorDesc = params.get('error_description');
    const targetRedirect = getTargetRedirect();


    if (errorParam) {
      setAuthState({
        status: 'error',
        errorMessage: errorDesc || 'Falha na autenticação. Tente novamente.',
        targetRedirect
      });
      return;
    }
    if (!token) {
      setAuthState({
        status: 'error',
        errorMessage: 'Token não recebido. Tente fazer login novamente.',
        targetRedirect
      });
      return;
    }

    try {
      saveToken(token);
      clearLogoutFlag();
      sessionStorage.setItem('auth_just_completed', Date.now().toString());
      
      setAuthState({ status: 'success', targetRedirect });
      window.location.replace(targetRedirect);
    } catch {
      setAuthState({
        status: 'error',
        errorMessage: 'Erro ao salvar sessão. Tente novamente.',
        targetRedirect
      });
    }
  }, []);

  
  if (authState.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-3">
            Erro de Autenticação
          </h1>
          
          <p className="text-gray-600 mb-8 line-clamp-3">
            {authState.errorMessage}
          </p>
          
          <button
            onClick={() => {
              window.location.href = getLoginUrl(authState.targetRedirect);
            }}
            className="bg-blue-600 text-white border-none py-3 px-8 rounded-lg cursor-pointer font-medium text-base w-full mb-3 hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="bg-transparent text-gray-600 border border-gray-300 py-3 px-8 rounded-lg cursor-pointer font-medium text-sm w-full hover:bg-gray-50 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-sans">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-4 text-gray-600">Autenticando...</p>
    </div>
  );
}
