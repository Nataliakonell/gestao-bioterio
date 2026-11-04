import api from './api';

export type FormatoRelatorio = 'Excel' | 'Pdf';

export interface FiltrosRelatorioPlantel {
  formato: FormatoRelatorio;
  grupoId?: number;
  especieId?: number;
  situacao?: number;
  genero?: number;
  faseDeVida?: number;
  dataEntradaInicio?: string;
  dataEntradaFim?: string;
}

export interface FiltrosRelatorioAlimentar {
  formato: FormatoRelatorio;
  dataInicio?: string;
  dataFim?: string;
  especieId?: number;
  consumo?: number;
  responsavel?: string;
}

export interface FiltrosRelatorioClinico {
  formato: FormatoRelatorio;
  dataInicio?: string;
  dataFim?: string;
  tipoClinico?: number;
  animalId?: number;
  veterinario?: string;
}

export interface FiltrosRelatorioInstalacoes {
  formato: FormatoRelatorio;
  localizacaoId: number;
  incluirSublocais?: boolean;
  especieId?: number;
}

export interface FiltrosRelatorioEventos {
  formato: FormatoRelatorio;
  dataInicio?: string;
  dataFim?: string;
  tipoEvento?: number;
  status?: number;
}

export interface FiltrosRelatorioMovimentacoes {
  formato: FormatoRelatorio;
  dataInicio?: string;
  dataFim?: string;
  animalId?: number;
  tipoMovimentacao?: number;
  localizacaoId?: number;
}

export interface FiltrosRelatorioSisfauna {
  formato: FormatoRelatorio;
  anoReferencia?: number;
  dataEntradaInicio?: string;
  dataEntradaFim?: string;
  especieId?: number;
  somenteAtivos?: boolean;
}

const downloadBlob = (data: Blob, fallbackFileName: string, contentDisposition?: string) => {
  let fileName = fallbackFileName;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      fileName = match[1].replace(/['"]/g, '');
    }
  }

  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const relatorioService = {
  exportarPlantel: async (filtros: FiltrosRelatorioPlantel) => {
    const ext = filtros.formato === 'Excel' ? 'xlsx' : 'pdf';
    const response = await api.get('/Relatorios/plantel', {
      params: filtros,
      responseType: 'blob'
    });
    downloadBlob(response.data, `relatorio_plantel.${ext}`, response.headers['content-disposition']);
  },

  exportarAlimentacao: async (filtros: FiltrosRelatorioAlimentar) => {
    const ext = filtros.formato === 'Excel' ? 'xlsx' : 'pdf';
    const response = await api.get('/Relatorios/alimentacao', {
      params: filtros,
      responseType: 'blob'
    });
    downloadBlob(response.data, `relatorio_alimentacao.${ext}`, response.headers['content-disposition']);
  },

  exportarClinico: async (filtros: FiltrosRelatorioClinico) => {
    const ext = filtros.formato === 'Excel' ? 'xlsx' : 'pdf';
    const response = await api.get('/Relatorios/clinico', {
      params: filtros,
      responseType: 'blob'
    });
    downloadBlob(response.data, `relatorio_clinico.${ext}`, response.headers['content-disposition']);
  },

  exportarInstalacoes: async (filtros: FiltrosRelatorioInstalacoes) => {
    const ext = filtros.formato === 'Excel' ? 'xlsx' : 'pdf';
    const response = await api.get('/Relatorios/instalacoes', {
      params: filtros,
      responseType: 'blob'
    });
    downloadBlob(response.data, `relatorio_instalacoes.${ext}`, response.headers['content-disposition']);
  },

  exportarEventos: async (filtros: FiltrosRelatorioEventos) => {
    const ext = filtros.formato === 'Excel' ? 'xlsx' : 'pdf';
    const response = await api.get('/Relatorios/eventos', {
      params: filtros,
      responseType: 'blob'
    });
    downloadBlob(response.data, `relatorio_eventos.${ext}`, response.headers['content-disposition']);
  },

  exportarMovimentacoes: async (filtros: FiltrosRelatorioMovimentacoes) => {
    const ext = filtros.formato === 'Excel' ? 'xlsx' : 'pdf';
    const response = await api.get('/Relatorios/movimentacoes', {
      params: filtros,
      responseType: 'blob'
    });
    downloadBlob(response.data, `relatorio_movimentacoes.${ext}`, response.headers['content-disposition']);
  },

  exportarSisfauna: async (filtros: FiltrosRelatorioSisfauna) => {
    const ext = filtros.formato === 'Excel' ? 'xlsx' : 'pdf';
    const response = await api.get('/Relatorios/sisfauna', {
      params: filtros,
      responseType: 'blob'
    });
    downloadBlob(response.data, `relatorio_sisfauna.${ext}`, response.headers['content-disposition']);
  }
};
