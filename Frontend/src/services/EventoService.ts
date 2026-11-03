import api from './api';

export enum TipoEvento {
    Interno = 1,
    Externo = 2
}

export enum StatusEvento {
    Agendado = 1,
    EmAndamento = 2,
    Cancelado = 3,
    Concluido = 4,
    RegistroRetornoAtrasado = 5
}

export function isStatusAgendado(status: any): boolean {
    return status === StatusEvento.Agendado || status === 1 || status === "1" || status === "Agendado";
}

export function isStatusEmAndamento(status: any): boolean {
    return status === StatusEvento.EmAndamento || status === 2 || status === "2" || status === "EmAndamento";
}

export function isStatusConcluido(status: any): boolean {
    return status === StatusEvento.Concluido || status === 4 || status === "4" || status === "Concluido";
}

export function isStatusCancelado(status: any): boolean {
    return status === StatusEvento.Cancelado || status === 3 || status === "3" || status === "Cancelado";
}

export function isTipoInterno(tipo: any): boolean {
    return tipo === TipoEvento.Interno || tipo === 1 || tipo === "1" || tipo === "Interno";
}

export function isTipoExterno(tipo: any): boolean {
    return tipo === TipoEvento.Externo || tipo === 2 || tipo === "2" || tipo === "Externo";
}

export interface EventoListVm {
    id: number;
    nome: string;
    tipoEvento: TipoEvento;
    tipoEventoDescricao: string;
    dataHoraInicio: string;
    dataHoraPrevisaoRetorno: string;
    responsavel: string;
    status: StatusEvento;
    statusDescricao: string;
    quantidadeAnimais: number;
}

export interface EventoAnimalItemVm {
    id: number;
    animalId: number;
    animalNomePopular?: string;
    animalNumeroRegistro?: string;
    animalEspecieNome?: string;
}

export interface EventoDetailVm {
    id: number;
    nome: string;
    tipoEvento: TipoEvento;
    tipoEventoDescricao: string;
    dataHoraInicio: string;
    dataHoraPrevisaoRetorno: string;
    responsavel: string;
    status: StatusEvento;
    statusDescricao: string;
    animais: EventoAnimalItemVm[];
}

export interface CreateEventoCommand {
    nome: string;
    tipoEvento: TipoEvento;
    dataHoraInicio: string;
    dataHoraPrevisaoRetorno: string;
    responsavel: string;
    status?: StatusEvento;
    animalIds?: number[];
}

export interface UpdateEventoCommand {
    id: number;
    nome: string;
    tipoEvento: TipoEvento;
    dataHoraInicio: string;
    dataHoraPrevisaoRetorno: string;
    responsavel: string;
    status: StatusEvento;
}

export interface CreateEventoResponse {
    success: boolean;
    message: string;
    id: number;
    evento?: EventoDetailVm;
}

export interface UpdateEventoResponse {
    success: boolean;
    message: string;
}

export const eventoService = {
    getAll: async (status?: StatusEvento, tipoEvento?: TipoEvento): Promise<EventoListVm[]> => {
        const response = await api.get<EventoListVm[]>('/Evento', {
            params: {
                status,
                tipoEvento
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<EventoDetailVm> => {
        const response = await api.get<EventoDetailVm>(`/Evento/${id}`);
        return response.data;
    },

    create: async (cmd: CreateEventoCommand): Promise<CreateEventoResponse> => {
        const response = await api.post<CreateEventoResponse>('/Evento', cmd);
        return response.data;
    },

    update: async (cmd: UpdateEventoCommand): Promise<UpdateEventoResponse> => {
        const response = await api.put<UpdateEventoResponse>('/Evento', cmd);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/Evento/${id}`);
    }
};
