import api from './api';

export interface ProcedimentoDetailVm {
    id: number;
    animalId: number;
    atendimentoId?: number;
    tipoProcedimentoId: number;
    tipoProcedimentoNome: string;
    descricao: string;
    responsavel?: string;
}

export interface ProcedimentoListVm {
    id: number;
    animalId: number;
    atendimentoId?: number;
    tipoProcedimentoId: number;
    tipoProcedimentoNome: string;
    descricao: string;
    dataCriacao?: string;
    rf?: string;
    nomeProfissional?: string;
    responsavel?: string;
}

export interface CreateProcedimentoPayload {
    animalId: number;
    atendimentoId?: number;
    tipoProcedimentoId: number;
    descricao: string;
    responsavel?: string;
}

export interface UpdateProcedimentoPayload {
    id: number;
    animalId: number;
    atendimentoId?: number;
    tipoProcedimentoId: number;
    descricao: string;
    responsavel?: string;
}

export interface CreateProcedimentoResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
    id: number;
}

export const procedimentoService = {
    async getAll(): Promise<ProcedimentoListVm[]> {
        const response = await api.get<ProcedimentoListVm[]>('/Procedimento');
        return response.data;
    },

    async getById(id: number): Promise<ProcedimentoDetailVm> {
        const response = await api.get<ProcedimentoDetailVm>(`/Procedimento/${id}`);
        return response.data;
    },

    async create(data: CreateProcedimentoPayload): Promise<CreateProcedimentoResponse> {
        const response = await api.post<CreateProcedimentoResponse>('/Procedimento', data);
        if (!response.data.success) {
            const validationErrors = response.data.validationErrors ?? [];
            const message = response.data.message || 'Erro ao cadastrar procedimento';
            throw new Error(`${message}${validationErrors.length ? `: ${validationErrors.join(' | ')}` : ''}`);
        }
        return response.data;
    },

    async update(data: UpdateProcedimentoPayload): Promise<void> {
        const response = await api.put<CreateProcedimentoResponse>('/Procedimento', data);
        if (!response.data.success) {
            const validationErrors = response.data.validationErrors ?? [];
            const message = response.data.message || 'Erro ao atualizar procedimento';
            throw new Error(`${message}${validationErrors.length ? `: ${validationErrors.join(' | ')}` : ''}`);
        }
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/Procedimento/${id}`);
    },
};

export default procedimentoService;
