import { BaseDocumentContext, type DocumentPlaceholderCategory } from './BaseDocumentContext';

export class AltaAmbulatorialDocumentContext extends BaseDocumentContext {
    protected areaName = "AltaAmbulatorial";

    public override getAvailablePlaceholders(): DocumentPlaceholderCategory[] {
        const globals = this.getGlobalPlaceholders();
        const areaPlaceholders: DocumentPlaceholderCategory = {
            category: "Variáveis da Alta Ambulatorial",
            items: [
                { key: "FUN_DIAGNOSTICO", label: "Diagnóstico Clínico", isFunction: true },
                { key: "FUN_TRATAMENTO", label: "Tratamento Aplicado", isFunction: true },
                { key: "INPUT_DATA_ENTRADA_AMBULATORIO", label: "Data Entrada Ambulatório" },
                { key: "INPUT_DATA_CLINICA", label: "Data Alta Clínica" },
                { key: "INPUT_PROCEDIMENTOS_MEDICACAO_REALIZADAS_DURANTE_ATENDIMENTO", label: "Procedimentos e Medicações" },
                { key: "INPUT_OBS_CLINICAS_ALTA", label: "Observações Clínicas da Alta" },
                { key: "INPUT_INSTALACAO_RETORNO", label: "Instalação de Retorno" },
            ]
        };
        return [...globals, areaPlaceholders];
    }

    public override resolveFun(tokenName: string, data: Record<string, any>, tokenMap: Record<string, string>): string | null {
        const key = tokenName.trim().toUpperCase();

        if (key === 'FUN_DIAGNOSTICO') {
            return tokenMap['FUN_DIAGNOSTICO'] || tokenMap['DIAGNOSTICO'] || tokenMap['ATENDIMENTO.DIAGNOSTICO'] || null;
        }
        if (key === 'FUN_TRATAMENTO') {
            return tokenMap['FUN_TRATAMENTO'] || tokenMap['TRATAMENTO'] || tokenMap['ATENDIMENTO.TRATAMENTO'] || null;
        }

        return super.resolveFun(tokenName, data, tokenMap);
    }
}
