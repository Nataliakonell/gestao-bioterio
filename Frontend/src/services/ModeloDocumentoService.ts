import api from './api';

export enum TipoSecaoTemplate {
    Body = 1,
    Header = 2,
    Footer = 3
}

export enum TipoDocumento {
    Geral = 0,
    AltaAmbulatorial = 1,
    LiberacaoQuarentena = 2,
    SolicitacaoExame = 3,
    Consulta = 4,
    DocumentoDeEventoExterno = 5
}

export interface LayoutSectionConfig {
    tipo: 'texto' | 'imagem';
    conteudo: string;
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right' | 'justify';
}

export interface ConfiguracaoLayoutHeaderFooter {
    esquerda: LayoutSectionConfig;
    meio: LayoutSectionConfig;
    direita: LayoutSectionConfig;
}

export interface ModeloDocumentoVm {
    id: number;
    nome: string;
    tipoSecao: TipoSecaoTemplate;
    tipoDocumento: TipoDocumento;
    conteudo?: string;
    headerTemplateId?: number;
    headerTemplate?: ModeloDocumentoVm;
    footerTemplateId?: number;
    footerTemplate?: ModeloDocumentoVm;
    configuracaoLayoutJson?: string;
    ativo: boolean;
}

export interface CreateModeloDocumentoCommand {
    nome: string;
    tipoSecao: TipoSecaoTemplate;
    tipoDocumento: TipoDocumento;
    conteudo?: string;
    headerTemplateId?: number;
    footerTemplateId?: number;
    configuracaoLayoutJson?: string;
    ativo: boolean;
}

export interface UpdateModeloDocumentoCommand {
    id: number;
    nome: string;
    tipoSecao: TipoSecaoTemplate;
    tipoDocumento: TipoDocumento;
    conteudo?: string;
    headerTemplateId?: number;
    footerTemplateId?: number;
    configuracaoLayoutJson?: string;
    ativo: boolean;
}

export const modeloDocumentoService = {
    getAll: async (tipoSecao?: TipoSecaoTemplate): Promise<ModeloDocumentoVm[]> => {
        const params = tipoSecao !== undefined ? { tipoSecao } : {};
        const response = await api.get<ModeloDocumentoVm[]>('/ModelosDocumento', { params });
        return response.data;
    },

    getById: async (id: number): Promise<ModeloDocumentoVm> => {
        const response = await api.get<ModeloDocumentoVm>(`/ModelosDocumento/${id}`);
        return response.data;
    },

    getByTipo: async (tipo: TipoDocumento): Promise<ModeloDocumentoVm> => {
        const response = await api.get<ModeloDocumentoVm>(`/ModelosDocumento/tipo/${tipo}`);
        return response.data;
    },

    create: async (data: CreateModeloDocumentoCommand): Promise<any> => {
        const response = await api.post('/ModelosDocumento', data);
        return response.data;
    },

    update: async (data: UpdateModeloDocumentoCommand): Promise<any> => {
        const response = await api.put('/ModelosDocumento', data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/ModelosDocumento/${id}`);
    }
};
