import api from "./api";

export interface Perfil {
  id: number;
  nome: string;
  descricao?: string;
}
export interface BaseResponse {
  success: boolean;
  message: string;
  validationErrors?: string[];
}

export interface CreatePerfilResponse extends BaseResponse {
  id: number;
  perfil: Perfil;
}

export const getPerfis = async () => {
    const response = await api.get<Perfil[]>('/Perfil');
    return response.data;
}

export interface Permissao {
  funcionalidadeId: number;
  nivelAcesso: number;
}

export interface PerfilDetail extends Perfil {
  descricao: string;
  permissoes: Permissao[];
}

export const getPerfilById = async (id: number) => {
    const response = await api.get<PerfilDetail>(`/Perfil/${id}`);
    return response.data;
}

export interface CreatePerfilCommand {
  nome: string;
  descricao: string;
}

export const createPerfil = async (data: CreatePerfilCommand) => {
    const response = await api.post<CreatePerfilResponse>('/Perfil', data);
    return response.data;
}

export interface UpdatePerfilCommand {
  id: number;
  nome: string;
  descricao: string;
}

export const updatePerfil = async (data: UpdatePerfilCommand) => {
    const response = await api.put<BaseResponse>('/Perfil', data);
    return response.data;
}

export const deletePerfil = async (id: number) => {
    const response = await api.delete<BaseResponse>(`/Perfil/${id}`);
    return response.data;
}

export interface AssignPermissaoCommand {
  funcionalidadeId: number;
  nivelAcesso: number;
}

export const assignPermissao = async (perfilId: number, data: AssignPermissaoCommand) => {
    const response = await api.post<BaseResponse>(`/Perfil/${perfilId}/permissoes`, data);
    return response.data;
}