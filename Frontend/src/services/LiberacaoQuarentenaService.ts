import api from './api';

export interface LiberacaoQuarentenaDetailVm {
    id: number;
    animalId: number;
    atendimentoId?: number;
    dataEntradaQuarentena?: string;
    dataSaidaQuarentena?: string;
    instalacaoBioterioId?: number;
    localizacaoDestinoId?: number;
    observacao?: string;
    dataCriacao?: string;
    rf?: string;
    nomeProfissional?: string;
    responsavel?: string;
}

export interface CreateLiberacaoQuarentenaPayload {
    animalId: number;
    atendimentoId?: number;
    dataEntradaQuarentena?: string;
    dataSaidaQuarentena?: string;
    instalacaoBioterioId?: number;
    localizacaoDestinoId?: number;
    observacao?: string;
    responsavel?: string;
}

export interface UpdateLiberacaoQuarentenaPayload extends CreateLiberacaoQuarentenaPayload {
    id: number;
}

export interface LiberacaoQuarentenaResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
    id: number;
    liberacaoQuarentena?: LiberacaoQuarentenaDetailVm;
}

export const liberacaoQuarentenaService = {
    async getAll(params?: { animalId?: number }): Promise<LiberacaoQuarentenaDetailVm[]> {
        const response = await api.get<LiberacaoQuarentenaDetailVm[]>('/LiberacaoQuarentena', { params });
        return response.data;
    },

    async getByAtendimentoId(_atendimentoId: number): Promise<LiberacaoQuarentenaDetailVm | null> {
        return null;
    },

    async getByAnimalId(animalId: number): Promise<LiberacaoQuarentenaDetailVm | null> {
        try {
            const response = await api.get<LiberacaoQuarentenaDetailVm>(`/LiberacaoQuarentena/animal/${animalId}`);
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) return null;
            throw error;
        }
    },

    async getById(id: number): Promise<LiberacaoQuarentenaDetailVm | null> {
        try {
            const response = await api.get<LiberacaoQuarentenaDetailVm>(`/LiberacaoQuarentena/${id}`);
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) return null;
            throw error;
        }
    },

    async create(payload: CreateLiberacaoQuarentenaPayload): Promise<LiberacaoQuarentenaResponse> {
        const response = await api.post<LiberacaoQuarentenaResponse>('/LiberacaoQuarentena', payload);
        if (response.data?.success === false) {
            const errors = response.data?.validationErrors ?? [];
            const msg = response.data?.message || 'Erro ao registrar liberação de quarentena';
            throw new Error(`${msg}${errors.length ? `: ${errors.join(' | ')}` : ''}`);
        }
        return response.data;
    },

    async update(payload: UpdateLiberacaoQuarentenaPayload): Promise<void> {
        const response = await api.put('/LiberacaoQuarentena', payload);
        if (response.data?.success === false) {
            const errors = response.data?.validationErrors ?? [];
            const msg = response.data?.message || 'Erro ao atualizar liberação de quarentena';
            throw new Error(`${msg}${errors.length ? `: ${errors.join(' | ')}` : ''}`);
        }
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/LiberacaoQuarentena/${id}`);
    },
};
