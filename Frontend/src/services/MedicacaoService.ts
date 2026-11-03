import api, { cachedGet } from './api';

export interface MedicacaoListVm {
    id: number;
    principioAtivo: string;
    nomeComercial: string;
    ativo: boolean;
}

export interface MedicacaoLookupVm {
    id: number;
    principioAtivo: string;
    nomeComercial: string;
}

export interface CreateMedicacaoResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
    id: number;
    medicacao: MedicacaoLookupVm;
}

export const medicacaoService = {
    getAll: async (): Promise<MedicacaoListVm[]> => {
        const response = await api.get<MedicacaoListVm[]>('/Medicacao');
        return response.data;
    },

    getLookup: async (): Promise<MedicacaoLookupVm[]> => {
        return cachedGet<MedicacaoLookupVm[]>('/Medicacao/lookup');
    },

    create: async (data: { principioAtivo: string; nomeComercial: string }): Promise<CreateMedicacaoResponse> => {
        const response = await api.post<CreateMedicacaoResponse>('/Medicacao', data);
        if (response.data && response.data.success === false) {
            const errMsg = response.data.validationErrors?.[0] || response.data.message || "Erro ao cadastrar medicação.";
            throw new Error(errMsg);
        }
        return response.data;
    },

    update: async (data: { id: number; principioAtivo: string; nomeComercial: string; ativo: boolean }): Promise<void> => {
        await api.put('/Medicacao', data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/Medicacao/${id}`);
    }
};
