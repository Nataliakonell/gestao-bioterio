using Gestao_Bioterio.Domain.Entities;
using System.Collections.Generic;

namespace Gestao_Bioterio.Application.Common.DocumentContext
{
    public static class DocumentContextFactory
    {
        private static readonly Dictionary<TipoDocumento, BaseDocumentContext> Contexts = new()
        {
            [TipoDocumento.AltaAmbulatorial] = new AltaAmbulatorialDocumentContext(),
            [TipoDocumento.LiberacaoQuarentena] = new ConsultaDocumentContext(),
            [TipoDocumento.SolicitacaoExame] = new ConsultaDocumentContext(),
            [TipoDocumento.Geral] = new GeralDocumentContext()
        };

        public static BaseDocumentContext GetContext(TipoDocumento tipo)
        {
            if (Contexts.TryGetValue(tipo, out var ctx))
            {
                return ctx;
            }
            return Contexts[TipoDocumento.Geral];
        }
    }
}
