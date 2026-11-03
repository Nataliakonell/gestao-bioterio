import { BaseDocumentContext } from './BaseDocumentContext';
import { AltaAmbulatorialDocumentContext } from './AltaAmbulatorialDocumentContext';
import { LiberacaoQuarentenaDocumentContext } from './LiberacaoQuarentenaDocumentContext';
import { AtendimentoDocumentContext } from './AtendimentoDocumentContext';
import { SolicitacaoExameDocumentContext } from './SolicitacaoExameDocumentContext';
import { DocumentoEventoExternoDocumentContext } from './DocumentoEventoExternoDocumentContext';
import { GeralDocumentContext } from './GeralDocumentContext';

export class DocumentContextFactory {
    private static contexts: Record<string, BaseDocumentContext> = {
        'LiberacaoQuarentena': new LiberacaoQuarentenaDocumentContext(),
        '1': new LiberacaoQuarentenaDocumentContext(),
        'AltaAmbulatorial': new AltaAmbulatorialDocumentContext(),
        '2': new AltaAmbulatorialDocumentContext(),
        'SolicitacaoExame': new SolicitacaoExameDocumentContext(),
        '3': new SolicitacaoExameDocumentContext(),
        'Atendimento': new AtendimentoDocumentContext(),
        'DocumentoDeEventoExterno': new DocumentoEventoExternoDocumentContext(),
        'TransporteFauna': new DocumentoEventoExternoDocumentContext(),
        '5': new DocumentoEventoExternoDocumentContext(),
        'Geral': new GeralDocumentContext(),
        '0': new GeralDocumentContext()
    };

    public static getContext(tipoDocumento?: string | number | BaseDocumentContext): BaseDocumentContext {
        if (tipoDocumento && typeof tipoDocumento === 'object' && tipoDocumento instanceof BaseDocumentContext) {
            return tipoDocumento;
        }
        if (tipoDocumento === undefined || tipoDocumento === null) return this.contexts['Geral'];
        const key = String(tipoDocumento).trim();
        return this.contexts[key] || this.contexts['Geral'];
    }
}
