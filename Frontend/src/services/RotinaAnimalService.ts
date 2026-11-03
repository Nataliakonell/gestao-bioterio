import api from './api';

export enum TipoRotina {
    Alimentacao = 1,
    Biometria = 2,
}

export enum FaseDeVida {
    Filhote = 1,
    Jovem = 2,
    Adulto = 3,
    Todos = 4,
}

export enum TipoFrequencia {
    Diaria = 1,
    IntervaloEmDias = 2,
    DiasDaSemana = 3,
}

export enum StatusRotina {
    SemRegistro = 1,
    Hoje = 2,
    Proximo = 3,
    Concluido = 4,
    EmDia = 5,
    Atrasado = 6,
    NaoAlimentado = 7,
}

export interface RotinaFaseConfig {
    faseDeVida: FaseDeVida;
    tipoFrequencia: TipoFrequencia;
    frequencia?: number;
    diaSemanaProgramado?: string[];
    protocoloDieta?: string;
}

export interface CreateRotinaAnimalPayload {
    especieId: number;
    tipoRotina: TipoRotina;
    fases: RotinaFaseConfig[];
    protocoloDieta?: string;
}

export interface CreateRotinaAnimalDto {
    id: number;
    especieId: number;
    tipoRotina: TipoRotina;
    faseDeVida: string;
    tipoFrequencia: TipoFrequencia;
    frequencia?: number;
    diaSemanaProgramado?: string[];
    protocoloDieta?: string;
}

export interface CreateRotinaAnimalResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
    rotinas?: CreateRotinaAnimalDto[];
}

export interface UpdateRotinaAnimalPayload {
    especieId: number;
    tipoRotina: TipoRotina;
    fases: RotinaFaseConfig[];
}

export interface UpdateRotinaAnimalDto {
    id: number;
    especieId: number;
    tipoRotina: TipoRotina;
    faseDeVida: string;
    tipoFrequencia: string;
    frequencia?: number;
    diaSemanaProgramado?: string[];
    protocoloDieta?: string;
}

export interface UpdateRotinaAnimalResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
    rotinas?: UpdateRotinaAnimalDto[];
}

export interface UpdateRotinaAnimalResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
}

export interface RotinaAnimalListVm {
    id: number;
    especieId: number;
    especieNome: string;
    tipoRotina: string;
    faseDeVida: string;
    tipoFrequencia: string;
    frequencia?: number;
    diaSemanaProgramado?: string[];
    protocoloDieta?: string;
}

export interface RotinaAnimalDetailVm {
    id: number;
    especieId: number;
    especieNome: string;
    tipoRotina: TipoRotina;
    faseDeVida: string;
    tipoFrequencia: TipoFrequencia;
    frequencia?: number;
    diaSemanaProgramado?: string[];
    protocoloDieta?: string;
}

export interface DiaSemanaStatusVm {
    dia: string;
    status: string;
}

export interface RotinaStatusDetalheVm {
    rotinaCadastrada: boolean;
    status: StatusRotina;
    statusDescricao: string;
    ultimaData?: string;
    proximaData?: string;
    tipoFrequencia?: TipoFrequencia;
    frequenciaDias?: number;
    diaSemanaProgramado?: string[];
    protocoloDieta?: string;
    diasSemanaStatus?: DiaSemanaStatusVm[];
}

export interface AnimalRotinaStatusVm {
    animalId: number;
    numeroRegistro: string;
    nomeAnimal: string;
    especieNome: string;
    faseDeVida: number;
    alimentacao?: RotinaStatusDetalheVm;
    biometria?: RotinaStatusDetalheVm;
}

export interface RotinaStatusSummaryVm {
    alimentacaoAtrasado: number;
    alimentacaoSemRegistro: number;
    alimentacaoHoje: number;
    alimentacaoProximo: number;
    alimentacaoConcluido: number;
    alimentacaoEmDia: number;
    alimentacaoNaoAlimentado: number;

    biometriaAtrasado: number;
    biometriaSemRegistro: number;
    biometriaHoje: number;
    biometriaProximo: number;
    biometriaConcluido: number;
    biometriaEmDia: number;
    biometriaNaoAlimentado: number;
}

export interface PaginatedAnimalRotinaStatusVm {
    items: AnimalRotinaStatusVm[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    summary: RotinaStatusSummaryVm;
}

export interface PaginatedRotinaAnimalResponse {
    items: RotinaAnimalListVm[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

const rotinaAnimalService = {
    getAll: async (params?: { page?: number; pageSize?: number; search?: string; especieId?: number; faseDeVida?: string }): Promise<PaginatedRotinaAnimalResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize));
        if (params?.search) queryParams.append('search', params.search);
        if (params?.especieId) queryParams.append('especieId', String(params.especieId));
        if (params?.faseDeVida) queryParams.append('faseDeVida', params.faseDeVida);

        const qs = queryParams.toString();
        const response = await api.get<PaginatedRotinaAnimalResponse>(`/RotinaAnimal${qs ? '?' + qs : ''}`);
        return response.data;
    },

    getById: async (id: number): Promise<RotinaAnimalDetailVm> => {
        const response = await api.get<RotinaAnimalDetailVm>(`/RotinaAnimal/${id}`);
        return response.data;
    },

    create: async (payload: CreateRotinaAnimalPayload): Promise<CreateRotinaAnimalResponse> => {
        const response = await api.post<CreateRotinaAnimalResponse>('/RotinaAnimal', payload);
        return response.data;
    },

    update: async (payload: UpdateRotinaAnimalPayload): Promise<UpdateRotinaAnimalResponse> => {
        const response = await api.put<UpdateRotinaAnimalResponse>('/RotinaAnimal', payload);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/RotinaAnimal/${id}`);
    },

    getAnimalRotinaStatus: async (animalId: number): Promise<AnimalRotinaStatusVm> => {
        const response = await api.get<AnimalRotinaStatusVm>(`/RotinaAnimal/animal/${animalId}/status`);
        return response.data;
    },

    getAllAnimaisRotinaStatus: async (params?: {
        page?: number;
        pageSize?: number;
        especieId?: number;
        search?: string;
        faseDeVida?: number[];
        statusBiometria?: number[];
        statusAlimentacao?: number[];
        dataBiometriaInicial?: string;
        dataBiometriaFinal?: string;
        dataAlimentacaoInicial?: string;
        dataAlimentacaoFinal?: string;
    }): Promise<PaginatedAnimalRotinaStatusVm> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize));
        if (params?.especieId) queryParams.append('especieId', String(params.especieId));
        if (params?.search) queryParams.append('search', params.search);
        if (params?.faseDeVida?.length) queryParams.append('faseDeVida', params.faseDeVida.join(','));
        if (params?.statusBiometria?.length) queryParams.append('statusBiometria', params.statusBiometria.join(','));
        if (params?.statusAlimentacao?.length) queryParams.append('statusAlimentacao', params.statusAlimentacao.join(','));
        if (params?.dataBiometriaInicial) queryParams.append('dataBiometriaInicial', params.dataBiometriaInicial);
        if (params?.dataBiometriaFinal) queryParams.append('dataBiometriaFinal', params.dataBiometriaFinal);
        if (params?.dataAlimentacaoInicial) queryParams.append('dataAlimentacaoInicial', params.dataAlimentacaoInicial);
        if (params?.dataAlimentacaoFinal) queryParams.append('dataAlimentacaoFinal', params.dataAlimentacaoFinal);
        const qs = queryParams.toString();
        const response = await api.get<PaginatedAnimalRotinaStatusVm>(`/RotinaAnimal/status/all${qs ? '?' + qs : ''}`);
        return response.data;
    },
};

export default rotinaAnimalService;
