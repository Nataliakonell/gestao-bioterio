import api from "./api";

export interface Usuario {
  id: number;
  rf: string;
  nome: string;
  email: string;
  status: boolean;
  perfilId: number;
}

export interface PaginatedUsuarioListVm {
  items: Usuario[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UsuarioExternoDto {
  nome: string;
  email: string;
}

export interface BaseResponse {
  success: boolean;
  message: string;
  validationErrors?: string[];
}

export interface CreateUsuarioResponse extends BaseResponse {
  id: number;
  usuario: Usuario; 
}

export const getUsuarios = async (page: number = 1, pageSize: number = 10) => {
    const response = await api.get<PaginatedUsuarioListVm>(`/Usuario?page=${page}&pageSize=${pageSize}`);
    return response.data;
}

export const getUsuarioById = async (id: number) => {
    const response = await api.get<Usuario>(`/Usuario/${id}`);
    return response.data;
}

export const getDadosExternosPorRf = async (rf: string) => {
    const response = await api.get<UsuarioExternoDto>(`/Usuario/buscar-rf/${rf}`);
    return response.data;
}

export interface CreateUsuarioCommand {
  rf: string;
  nome: string;
  email: string;
  status: boolean;
  perfilId: number;
}

export const createUsuario = async (data: CreateUsuarioCommand) => {
    const response = await api.post<CreateUsuarioResponse>('/Usuario', data);
    return response.data;
}

export interface UpdateUsuarioCommand {
  id: number;
  rf: string;
  nome: string;
  email: string;
  status: boolean;
  perfilId: number;
}

export const updateUsuario = async (data: UpdateUsuarioCommand) => {
    const response = await api.put<BaseResponse>('/Usuario', data);
    return response.data;
}

export interface UsuarioLookupVm {
  id: number;
  nome: string;
  rf: string;
}

let lookupCache: Promise<UsuarioLookupVm[]> | null = null;

export const getUsuariosLookup = async (forceRefresh = false): Promise<UsuarioLookupVm[]> => {
  if (!lookupCache || forceRefresh) {
    lookupCache = api.get<UsuarioLookupVm[]>('/Usuario/lookup').then((res) => res.data);
  }
  return lookupCache;
};

export const deleteUsuario = async (id: number) => {
    const response = await api.delete<BaseResponse>(`/Usuario/${id}`);
    return response.data;
}   
