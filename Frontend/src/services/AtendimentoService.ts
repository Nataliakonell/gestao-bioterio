import axios from 'axios';
import api from './api';

export enum TipoAtendimento {
    Consulta = 1,
    AltaAmbulatorial = 2,
    EncaminhamentoAmbulatorial = 3,
    EncaminhamentoLiberacaoQuarentena = 4,
    ResultadoExame = 5,
}

export const tipoAtendimentoLabels: Record<string, string> = {
    [TipoAtendimento.Consulta]: 'Consulta',
    'Consulta': 'Consulta',
    [TipoAtendimento.AltaAmbulatorial]: 'Alta Ambulatorial',
    'AltaAmbulatorial': 'Alta Ambulatorial',
    [TipoAtendimento.EncaminhamentoAmbulatorial]: 'Encaminhamento Ambulatorial',
    'EncaminhamentoAmbulatorial': 'Encaminhamento Ambulatorial',
    [TipoAtendimento.EncaminhamentoLiberacaoQuarentena]: 'Liberação da quarentena',
    'EncaminhamentoLiberacaoQuarentena': 'Liberação da quarentena',
    'LiberacaoQuarentena': 'Liberação da quarentena',
    [TipoAtendimento.ResultadoExame]: 'Resultado de Exame',
    'ResultadoExame': 'Resultado de Exame',
    'Exame': 'Solicitação de Exame',
    'PrescricaoMedicacao': 'Prescrição de Medicação',
    'Evolucao': 'Evolução Clínica',
    'Procedimento': 'Procedimento',
    'Anexo': 'Anexo',
};

export const tipoAtendimentoColors: Record<string, string> = {
    Consulta: "bg-green-100 text-green-700",
    AltaAmbulatorial: "bg-red-100 text-red-700",
    EncaminhamentoAmbulatorial: "bg-blue-100 text-blue-700",
    EncaminhamentoLiberacaoQuarentena: "bg-orange-100 text-orange-700",
    ResultadoExame: "bg-yellow-100 text-yellow-700",
};



export interface CreateAtendimentoPayload {
    animalId: number;
    instalacaoBioterioId: number;
    tipoAtendimento: TipoAtendimento;
    dataHoraRegistro: string;
    anamnese?: string;
    diagnostico?: string;
    exameFisico?: string;
    tratamento?: string;
    responsavel: string;
    peso?: number;
    comprimento?: number;
    comprimentoCauda?: number;
}

export const tipoAtendimentoBorderColors: Record<string, string> = {
    Consulta: "border-l-green-500",
    AltaAmbulatorial: "border-l-red-500",
    EncaminhamentoAmbulatorial: "border-l-blue-500",
    EncaminhamentoLiberacaoQuarentena: "border-l-orange-500",
    ResultadoExame: "border-l-yellow-500",
};

export interface UpdateAtendimentoPayload extends CreateAtendimentoPayload {
    id: number;
}

export interface AtendimentoListVm {
    anamnese?: string;
    id: number;
    animalId: number;
    numeroRegistro: string;
    especieNome: string;
    tipoAtendimento: string;
    dataHoraRegistro: string;
    responsavel: string;
    instalacaoBioterioId: number;
    instalacaoBioterioNome?: string;
    peso: number;
    comprimento: number;
    comprimentoCauda: number;
    prescricoesCount?: number;
    solicitacoesExameCount?: number;
    procedimentosCount?: number;
    evolucoesCount?: number;
    anexosCount?: number;
}

export interface PrescricaoAtendimentoVm {
    id: number;
    medicacaoId: number;
    volumeDose: string;
    viaAdministracao: string;
    quantidadeDoses: number;
    intervaloEntreDosesHoras: number;
    dataHoraInicio: string;
    observacao?: string;
}

export interface SolicitacaoExameAtendimentoVm {
    id: number;
    tipoExame: string;
    sinaisClinicos?: string;
    suspeitaClinica?: string;
    regiaoAnatomica?: string;
    observacao?: string;
}

export interface ProcedimentoAtendimentoVm {
    id: number;
    tipoProcedimentoId: number;
    tipoProcedimentoNome: string;
    descricao?: string;
}

export interface EvolucaoAtendimentoVm {
    id: number;
    descricao?: string;
    dataHoraRegistro: string;
    responsavel: string;
}

export interface AnexoAtendimentoVm {
    id: number;
    nomeArquivoAnexo?: string;
    descricao?: string;
}

export interface AtendimentoDetailVm {
    id: number;
    animalId: number;
    numeroRegistro: string;
    especieNome: string;
    instalacaoBioterioId: number;
    biometriaAnimalId?: number;
    tipoAtendimento: string;
    dataHoraRegistro: string;
    anamnese?: string;
    diagnostico?: string;
    exameFisico?: string;
    tratamento?: string;
    responsavel: string;
    prescricoes: PrescricaoAtendimentoVm[];
    solicitacoesExame: SolicitacaoExameAtendimentoVm[];
    procedimentos: ProcedimentoAtendimentoVm[];
    evolucoes: EvolucaoAtendimentoVm[];
    anexos: AnexoAtendimentoVm[];
    peso: number;
    comprimento: number;
    comprimentoCauda: number;
}

export interface CreateAtendimentoResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
    id: number;
    atendimento?: CreateAtendimentoDto;
}

export interface CreateAtendimentoDto {
    id: number;
    animalId: number;
    instalacaoBioterioId: number;
    tipoAtendimento: string;
    dataHoraRegistro: string;
    anamnese?: string;
    diagnostico?: string;
    exameFisico?: string;
    tratamento?: string;
    responsavel: string;
}

export interface BaseResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
}

export interface PaginatedAtendimentoListVm {
    items: AtendimentoListVm[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface AtendimentoListParams {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    especieId?: number;
    animalId?: number;
}

export const getAtendimentos = async (params?: AtendimentoListParams): Promise<PaginatedAtendimentoListVm> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize));
    if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params?.especieId) queryParams.append('especieId', String(params.especieId));
    if (params?.animalId) queryParams.append('animalId', String(params.animalId));
    const qs = queryParams.toString();

    try {
        const response = await api.get<PaginatedAtendimentoListVm>(`/Atendimento${qs ? '?' + qs : ''}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao buscar atendimentos: ${message}`);
        }
        throw new Error('Erro de conexão ao buscar atendimentos');
    }
};

export const getAtendimento = async (id: number): Promise<AtendimentoDetailVm> => {
    try {
        const response = await api.get<AtendimentoDetailVm>(`/Atendimento/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao buscar atendimento: ${message}`);
        }
        throw new Error('Erro de conexão ao buscar atendimento');
    }
};

export const createAtendimento = async (payload: CreateAtendimentoPayload): Promise<CreateAtendimentoResponse> => {
    try {
        const response = await api.post<CreateAtendimentoResponse>('/Atendimento', payload);
        if (response.data?.success === false) {
            const validationErrors = response.data?.validationErrors ?? [];
            const message = response.data?.message || 'Erro ao adicionar atendimento';
            throw new Error(`${message}${validationErrors.length ? `: ${validationErrors.join(' | ')}` : ''}`);
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao adicionar atendimento: ${message}`);
        }
        throw new Error(error instanceof Error ? error.message : 'Erro de conexão ao adicionar atendimento');
    }
};

export const updateAtendimento = async (payload: UpdateAtendimentoPayload): Promise<BaseResponse> => {
    try {
        const response = await api.put<BaseResponse>('/Atendimento', payload);
        if (response.data?.success === false) {
            const validationErrors = response.data?.validationErrors ?? [];
            const message = response.data?.message || 'Erro ao editar atendimento';
            throw new Error(`${message}${validationErrors.length ? `: ${validationErrors.join(' | ')}` : ''}`);
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao editar atendimento: ${message}`);
        }
        throw new Error(error instanceof Error ? error.message : 'Erro de conexão ao editar atendimento');
    }
};

export const deletarAtendimento = async (id: number): Promise<void> => {
    try {
        await api.delete(`/Atendimento/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao deletar atendimento: ${message}`);
        }
        throw new Error('Erro de conexão ao deletar atendimento');
    }
};
