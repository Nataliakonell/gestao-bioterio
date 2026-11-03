import api from "./api";

export interface Funcionalidade {
  id: number;
  nome: string;
  descricao: string; 
}

export interface BaseResponse {
  success: boolean;
  message: string;
  validationErrors?: string[];
}

export interface CreateFuncionalidadeResponse extends BaseResponse {
  id: number;
  funcionalidade: Funcionalidade;
}

export const getFuncionalidades = async () => {
    const response = await api.get<Funcionalidade[]>(`/Funcionalidade`);
    return response.data;
}

export const getFuncionalidadeById = async (id: number) => {
    const response = await api.get<Funcionalidade>(`/Funcionalidade/${id}`);
    return response.data;
}

export interface CreateFuncionalidadeCommand {
  nome: string;
  descricao: string;
}

export const createFuncionalidade = async (data: CreateFuncionalidadeCommand) => {
    const response = await api.post<CreateFuncionalidadeResponse>(`/Funcionalidade`, data);
    return response.data;
}

export interface UpdateFuncionalidadeCommand {
  id: number;
  nome: string;
  descricao: string;
}

export const updateFuncionalidade = async (data: UpdateFuncionalidadeCommand) => {
    const response = await api.put<BaseResponse>(`/Funcionalidade`, data);
    return response.data;
}

export const deleteFuncionalidade = async (id: number) => {
    await api.delete(`/Funcionalidade/${id}`);
}   
