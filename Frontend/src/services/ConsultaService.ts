import api from './api';

export interface CreateConsultaPayload {
    animalId: number;
    anamnese?: string;
    exameFisico?: string;
    suspeitaDiagnostica?: string;
    instalacaoBioterioId?: number | null;
    dataHoraConsulta: string;
    responsavel?: string;
}

export interface UpdateConsultaPayload extends CreateConsultaPayload {
    id: number;
}

export interface ConsultaListVm {
    id: number;
    animalId: number;
    numeroRegistro: string;
    especieNome: string;
    anamnese?: string;
    exameFisico?: string;
    suspeitaDiagnostica?: string;
    instalacaoBioterioId?: number;
    instalacaoBioterioNome: string;
    dataHoraConsulta: string;
    rf: string;
    dataCriacao: string;
    responsavel?: string;
}

export interface ConsultaDetailVm extends ConsultaListVm {}

export interface CreateConsultaResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
    id: number;
    consulta?: {
        id: number;
        animalId: number;
        anamnese?: string;
        exameFisico?: string;
        suspeitaDiagnostica?: string;
        instalacaoBioterioId?: number;
        dataHoraConsulta: string;
        responsavel?: string;
    };
}

export interface ResumoUltimoAtendimentoDto {
    id: number;
    tipo: string;
    tipoLabel: string;
    dataHora: string;
    responsavel: string;
    resumo: string;
}

export interface VisaoGeralClinicaItemVm {
    animalId: number;
    numeroRegistro: string;
    nomePopular: string;
    especieId: number;
    especieNome: string;
    faseDeVida: number;
    faseDeVidaNome: string;
    generoNome: string;
    localizacao: string;
    situacaoAnimal: number;
    situacaoAnimalNome: string;
    statusClinico: string;
    totalAtendimentos: number;
    ultimoAtendimento?: ResumoUltimoAtendimentoDto | null;
}

export interface VisaoGeralClinicaResponse {
    totalCount: number;
    page: number;
    pageSize: number;
    destaqueUltimoAtendimentoGeral?: VisaoGeralClinicaItemVm | null;
    items: VisaoGeralClinicaItemVm[];
}

export interface GetVisaoGeralClinicaParams {
    page?: number;
    pageSize?: number;
    search?: string;
    especieId?: number;
    tipoAtendimento?: string;
    dataInicio?: string;
    dataFim?: string;
}

export const consultaService = {
    async getAll(params?: { animalId?: number }): Promise<ConsultaListVm[]> {
        const qs = params?.animalId ? `?animalId=${params.animalId}` : '';
        const response = await api.get<ConsultaListVm[]>(`/Consulta${qs}`);
        return response.data;
    },
    async getById(id: number): Promise<ConsultaDetailVm> {
        const response = await api.get<ConsultaDetailVm>(`/Consulta/${id}`);
        return response.data;
    },
    async getVisaoGeral(params?: GetVisaoGeralClinicaParams): Promise<VisaoGeralClinicaResponse> {
        const query = new URLSearchParams();
        if (params?.page) query.append('page', String(params.page));
        if (params?.pageSize) query.append('pageSize', String(params.pageSize));
        if (params?.search) query.append('search', params.search);
        if (params?.especieId) query.append('especieId', String(params.especieId));
        if (params?.tipoAtendimento) query.append('tipoAtendimento', params.tipoAtendimento);
        if (params?.dataInicio) query.append('dataInicio', params.dataInicio);
        if (params?.dataFim) query.append('dataFim', params.dataFim);

        const qs = query.toString() ? `?${query.toString()}` : '';
        const response = await api.get<VisaoGeralClinicaResponse>(`/Consulta/visao-geral${qs}`);
        return response.data;
    },
    async create(payload: CreateConsultaPayload): Promise<CreateConsultaResponse> {
        const response = await api.post<CreateConsultaResponse>('/Consulta', payload);
        if (response.data?.success === false) {
            const errs = response.data?.validationErrors ?? [];
            const msg = response.data?.message || 'Erro ao registrar consulta';
            throw new Error(`${msg}${errs.length ? `: ${errs.join(' | ')}` : ''}`);
        }
        return response.data;
    },
    async update(payload: UpdateConsultaPayload): Promise<void> {
        const response = await api.put('/Consulta', payload);
        if ((response.data as any)?.success === false) {
            const errs = (response.data as any)?.validationErrors ?? [];
            const msg = (response.data as any)?.message || 'Erro ao atualizar consulta';
            throw new Error(`${msg}${errs.length ? `: ${errs.join(' | ')}` : ''}`);
        }
    },
    async delete(id: number): Promise<void> {
        await api.delete(`/Consulta/${id}`);
    },
};
