import api from './api';

export interface AnexoVm {
    id: number;
    animalId: number;
    nomeArquivoAnexo?: string;
    descricao?: string;
    dataCriacao?: string;
    rf?: string;
    nomeProfissional?: string;
    responsavel?: string;
}

export interface CreateAnexoPayload {
    animalId: number;
    nomeArquivoAnexo?: string;
    descricao?: string;
    responsavel?: string;
    arquivo?: File | null;
}

export interface UpdateAnexoPayload {
    id: number;
    animalId: number;
    nomeArquivoAnexo?: string;
    descricao?: string;
    responsavel?: string;
}

export const anexoService = {
    async getAll(params?: { animalId?: number }): Promise<AnexoVm[]> {
        const qs = params?.animalId ? `?animalId=${params.animalId}` : '';
        const response = await api.get<AnexoVm[]>(`/Anexo${qs}`);
        return response.data;
    },
    async getById(id: number): Promise<AnexoVm> {
        const response = await api.get<AnexoVm>(`/Anexo/${id}`);
        return response.data;
    },
    async create(payload: CreateAnexoPayload): Promise<any> {
        const formData = new FormData();
        formData.append('animalId', String(payload.animalId));
        if (payload.nomeArquivoAnexo) formData.append('nomeArquivoAnexo', payload.nomeArquivoAnexo);
        if (payload.descricao) formData.append('descricao', payload.descricao);
        if (payload.responsavel) formData.append('responsavel', payload.responsavel);
        if (payload.arquivo) formData.append('arquivo', payload.arquivo);

        const response = await api.post('/Anexo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if ((response.data as any)?.success === false) {
            const errs = (response.data as any)?.validationErrors ?? [];
            const msg = (response.data as any)?.message || 'Erro ao registrar anexo';
            throw new Error(`${msg}${errs.length ? `: ${errs.join(' | ')}` : ''}`);
        }
        return response.data;
    },
    async update(payload: UpdateAnexoPayload): Promise<any> {
        const response = await api.put('/Anexo', payload);
        if ((response.data as any)?.success === false) {
            const errs = (response.data as any)?.validationErrors ?? [];
            const msg = (response.data as any)?.message || 'Erro ao atualizar anexo';
            throw new Error(`${msg}${errs.length ? `: ${errs.join(' | ')}` : ''}`);
        }
        return response.data;
    },
    async delete(id: number): Promise<void> {
        await api.delete(`/Anexo/${id}`);
    },
};

export default anexoService;
