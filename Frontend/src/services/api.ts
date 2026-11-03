import axios from 'axios';

const isRaUsername = (username: string | undefined | null): boolean => {
  if (!username) return false;
  return /^ra\d+$/i.test(username.trim());
};

export const hasAdminRole = (): boolean => {
  const token = getActiveToken();
  if (!isValidToken(token)) return false;

  try {
    const payload = JSON.parse(atob(token!.split('.')[1]));

    const roles: string[] =
      payload?.realm_access?.roles ||
      payload?.resource_access?.['gestao-bioterio']?.roles ||
      payload?.roles ||
      [];

    return roles.includes('gestao-bioterio-admin') || roles.includes('gestao-bioterio-user');
  } catch {
    return false;
  }
};

export const isBioterioAdmin = (): boolean => {
  const token = getActiveToken();
  if (!isValidToken(token)) return false;

  try {
    const payload = JSON.parse(atob(token!.split('.')[1]));

    const roles: string[] =
      payload?.realm_access?.roles ||
      payload?.resource_access?.[ 'gestao-bioterio']?.roles ||
      payload?.roles ||
      [];

    return roles.includes('gestao-bioterio-admin');
  } catch {
    return false;
  }
};

export const hasValidUcdbToken = (): boolean => {
  const ucdbToken = getCookie('ucdb_token');
  if (isValidToken(ucdbToken)) return true;

  const keycloakSession = getCookie('keycloak_session');
  if (isValidToken(keycloakSession)) return true;

  return false;
};

const extractJwtFromKeycloakSession = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;
  try {
    const decoded = atob(raw);
    const obj = JSON.parse(decoded);
    if (obj?.AccessToken && isValidToken(obj.AccessToken)) return obj.AccessToken;
  } catch {
  }
  return isValidToken(raw) ? raw : undefined;
};

export const getActiveToken = (): string | undefined => {
  const biotToken = getCookie('bioterio_token');
  if (isValidToken(biotToken)) {
    return biotToken;
  }

  const ucdbToken = getCookie('ucdb_token');
  if (isValidToken(ucdbToken)) {
    console.log('[getActiveToken] usando ucdb_token');
    return ucdbToken;
  }

  const keycloakRaw = getCookie('keycloak_session');
  const keycloakToken = extractJwtFromKeycloakSession(keycloakRaw);
  if (keycloakToken) {
    return keycloakToken;
  }

  return undefined;
};

export const getLoginUrl = (targetRedirect?: string): string => {
  const returnUrl = encodeURIComponent(window.location.origin);
  let finalRedirect = targetRedirect || '/';
  const redirect = encodeURIComponent(finalRedirect);

  return `https://accounts.ucdb.br/?returnUrl=${returnUrl}&redirect=${redirect}`;
};

export const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
  return undefined;
};

const setCookie = (name: string, value: string, options: any = {}) => {
  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (options.expires) cookieStr += `; expires=${options.expires.toUTCString()}`;
  if (options.path) cookieStr += `; path=${options.path}`;
  if (options.secure) cookieStr += `; secure`;
  if (options.sameSite) cookieStr += `; samesite=${options.sameSite}`;
  document.cookie = cookieStr;
};

export const removeCookie = (name: string) => {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getActiveToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;
const MAX_RETRIES = 2;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401 && !isRedirecting) {
      isRedirecting = true;
      console.warn('[API] 401 recebido, removendo cookie e redirecionando para login...');
      removeCookie('bioterio_token');
      setTimeout(() => {
        window.location.href = getLoginUrl(window.location.pathname);
      }, 100);
    }

    const retriable = status === 429 || status === 503 || !status;
    const retryCount = error.config?.__retryCount ?? 0;
    if (retriable && retryCount < MAX_RETRIES) {
      const delayMs = 500 * Math.pow(2, retryCount);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      const config = {
        ...error.config,
        __retryCount: retryCount + 1,
      };
      return api(config);
    }

    return Promise.reject(error);
  }
);

export const isValidToken = (token: string | undefined): boolean => {
  if (!token || token === 'undefined' || token === 'null' || token.trim().length === 0) return false;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return false;
      }
    }
  } catch {
  }
  return true;
};

export const saveToken = (token: string) => {
  let expires = new Date(Date.now() + 8 * 60 * 60 * 1000);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) expires = new Date(payload.exp * 1000);
  } catch { /* ignora */ }

  setCookie('bioterio_token', token, {
    expires,
    path: '/',
    sameSite: 'lax',
  });
};


export const clearLogoutFlag = () => {
  localStorage.removeItem('explicit_logout');
};

const getCache = new Map<string, { data: unknown; expiresAt: number }>();

export async function cachedGet<T>(url: string, ttlMs = 60_000): Promise<T> {
  const now = Date.now();
  const hit = getCache.get(url);
  if (hit && hit.expiresAt > now) return hit.data as T;

  const response = await api.get<T>(url);
  getCache.set(url, { data: response.data, expiresAt: now + ttlMs });
  return response.data;
}

export const clearGetCache = () => getCache.clear();

export interface UserInfo {
  name: string;
  email: string;
  avatar: string;
}

export const getUserInfo = (): UserInfo | null => {  const token = getActiveToken();
  if (!isValidToken(token)) return null;

  try {
    const base64Url = token!.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    const fullName =
      payload.name ||
      payload.nome ||
      payload.nomeCompleto ||
      payload.nome_completo ||
      (payload.given_name && payload.family_name ? `${payload.given_name} ${payload.family_name}` : null) ||
      payload.preferred_username ||
      'Usuário';

    return {
      name: fullName,
      email: payload.email || '',
      avatar: payload.picture || payload.avatar || '',
    };
  } catch (error) {
    console.error('Erro ao decodificar o token:', error);
    return null;
  }
};
export default api;
