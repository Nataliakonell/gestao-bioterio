import api from './api';

export enum Ambiente {
    Interno = 1,
    Externo = 2
}

export interface LocalizacaoListVm {
    id: number;
    nome: string;
    localizacaoPaiId?: number | null;
    localizacaoPaiNome?: string | null;
    ambiente: number; // 1 = Interno, 2 = Externo
    caminhoIds?: string | null;
    caminhoHierarquia?: string | null;
    quantidadeAnimais: number;
}

export interface LocalizacaoDetailVm {
    id: number;
    nome: string;
    localizacaoPaiId?: number | null;
    localizacaoPaiNome?: string | null;
    ambiente: number;
    caminhoIds?: string | null;
    caminhoHierarquia?: string | null;
    subLocalizacoes?: LocalizacaoDetailVm[];
    animaisLocalizados?: {
        id: number;
        animalId: number;
        animalNomePopular?: string;
        animalNumeroRegistro?: string;
        animalEspecieNome?: string;
    }[];
}

export interface CreateLocalizacaoCommand {
    nome: string;
    localizacaoPaiId?: number | null;
    ambiente: number;
    animalIds?: number[];
}

export interface UpdateLocalizacaoCommand {
    id: number;
    nome: string;
    localizacaoPaiId?: number | null;
    ambiente: number;
    animalIds?: number[];
}

export interface CreateLocalizacaoResponse {
    id: number;
    localizacao?: any;
    success: boolean;
    message: string;
    validationErrors?: string[];
}

export const localizacaoService = {
    getAll: async (): Promise<LocalizacaoListVm[]> => {
        const response = await api.get<LocalizacaoListVm[]>('/Localizacao');
        return response.data;
    },

    getById: async (id: number): Promise<LocalizacaoDetailVm> => {
        const response = await api.get<LocalizacaoDetailVm>(`/Localizacao/${id}`);
        return response.data;
    },

    create: async (data: CreateLocalizacaoCommand): Promise<CreateLocalizacaoResponse> => {
        const response = await api.post<CreateLocalizacaoResponse>('/Localizacao', data);
        return response.data;
    },

    update: async (data: UpdateLocalizacaoCommand) => {
        const response = await api.put('/Localizacao', data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/Localizacao/${id}`);
        return response.data;
    }
};
