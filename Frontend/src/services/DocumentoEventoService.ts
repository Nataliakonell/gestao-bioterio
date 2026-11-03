import api from './api';

export interface DocumentoEventoListVm {
    id: number;
    eventoId: number;
    eventoNome?: string;
    modeloDocumentoId: number;
    modeloDocumentoNome?: string;
    conteudoDadosJson: string;
    dataCriacao: string;
    rf: string;
}

export interface DocumentoEventoDetailVm {
    id: number;
    eventoId: number;
    eventoNome?: string;
    modeloDocumentoId: number;
    modeloDocumentoNome?: string;
    conteudoDadosJson: string;
    dataCriacao: string;
    rf: string;
}

export interface CreateDocumentoEventoCommand {
    eventoId: number;
    modeloDocumentoId: number;
    conteudoDadosJson: string;
}

export interface UpdateDocumentoEventoCommand {
    id: number;
    eventoId: number;
    modeloDocumentoId: number;
    conteudoDadosJson: string;
}

export interface CreateDocumentoEventoResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
    id?: number;
    documentoEvento?: DocumentoEventoDetailVm;
}

export const documentoEventoService = {
    getAll: async (eventoId?: number): Promise<DocumentoEventoListVm[]> => {
        const response = await api.get<DocumentoEventoListVm[]>('/DocumentoEvento', {
            params: eventoId ? { eventoId } : undefined
        });
        return response.data;
    },

    getById: async (id: number): Promise<DocumentoEventoDetailVm> => {
        const response = await api.get<DocumentoEventoDetailVm>(`/DocumentoEvento/${id}`);
        return response.data;
    },

    create: async (data: CreateDocumentoEventoCommand): Promise<CreateDocumentoEventoResponse> => {
        const response = await api.post<CreateDocumentoEventoResponse>('/DocumentoEvento', data);
        return response.data;
    },

    update: async (data: UpdateDocumentoEventoCommand) => {
        const response = await api.put('/DocumentoEvento', data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/DocumentoEvento/${id}`);
        return response.data;
    }
};
