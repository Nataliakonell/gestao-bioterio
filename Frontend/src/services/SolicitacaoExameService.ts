import api from './api';

export enum TipoExame {
    HemogramaCompleto = 1,
    Ultrassonografia = 2,
    Radiografia = 3,
    Outros = 4,
}

export const tipoExameLabels: Record<number, string> = {
    [TipoExame.HemogramaCompleto]: 'Hemograma Completo',
    [TipoExame.Ultrassonografia]: 'Ultrassonografia',
    [TipoExame.Radiografia]: 'Radiografia (Raio-X)',
    [TipoExame.Outros]: 'Outros',
};

export interface SolicitacaoExamePayload {
    id?: number;
    atendimentoId?: number | null;
    animalId: number;
    tipoExame: TipoExame;
    sinaisClinicos?: string;
    suspeitaClinica?: string;
    regiaoAnatomica?: string;
    observacao?: string;
    responsavel?: string;
}

export interface SolicitacaoExameVm {
    id: number;
    atendimentoId?: number | null;
    animalId: number;
    tipoExame: number | string;
    sinaisClinicos?: string;
    suspeitaClinica?: string;
    regiaoAnatomica?: string;
    observacao?: string;
    dataCriacao?: string;
    rf?: string;
    nomeProfissional?: string;
    status?: string;
    dataSuspensao?: string | null;
    motivoSuspensao?: string | null;
    dataCancelamento?: string | null;
    motivoCancelamento?: string | null;
    responsavel?: string;
}

export const solicitacaoExameService = {
    getAll: async (params?: { animalId?: number }): Promise<SolicitacaoExameVm[]> => {
        const queryParams = new URLSearchParams();
        if (params?.animalId) queryParams.append('animalId', params.animalId.toString());
        const qs = queryParams.toString();
        const url = `/SolicitacaoExame${qs ? `?${qs}` : ''}`;
        const response = await api.get<SolicitacaoExameVm[]>(url);
        return response.data;
    },

    getById: async (id: number): Promise<SolicitacaoExameVm> => {
        const response = await api.get<SolicitacaoExameVm>(`/SolicitacaoExame/${id}`);
        return response.data;
    },

    create: async (payload: SolicitacaoExamePayload) => {
        const response = await api.post('/SolicitacaoExame', payload);
        return response.data;
    },

    update: async (payload: SolicitacaoExamePayload) => {
        const response = await api.put('/SolicitacaoExame', payload);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/SolicitacaoExame/${id}`);
    },

    suspender: async (id: number, motivoSuspensao: string): Promise<any> => {
        const response = await api.post('/SolicitacaoExame/suspender', { id, motivoSuspensao });
        return response.data;
    },

    cancelar: async (id: number, motivoCancelamento: string): Promise<any> => {
        const response = await api.post('/SolicitacaoExame/cancelar', { id, motivoCancelamento });
        return response.data;
    },

    suspenderGrupo: async (ids: number[], motivoSuspensao: string): Promise<any[]> => {
        const results = await Promise.all(ids.map(id => api.post('/SolicitacaoExame/suspender', { id, motivoSuspensao }).then(r => r.data)));
        return results;
    },

    cancelarGrupo: async (ids: number[], motivoCancelamento: string): Promise<any[]> => {
        const results = await Promise.all(ids.map(id => api.post('/SolicitacaoExame/cancelar', { id, motivoCancelamento }).then(r => r.data)));
        return results;
    }
};
