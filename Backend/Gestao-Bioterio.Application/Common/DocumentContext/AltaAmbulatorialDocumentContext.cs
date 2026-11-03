using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace Gestao_Bioterio.Application.Common.DocumentContext
{
    public class AltaAmbulatorialDocumentContext : BaseDocumentContext
    {
        protected override string AreaName => "AltaAmbulatorial";

        public override List<DocumentPlaceholderCategory> GetAvailablePlaceholders()
        {
            var categories = GetGlobalPlaceholders();
            categories.Add(new DocumentPlaceholderCategory
            {
                Category = "Variáveis da Alta Ambulatorial",
                Items = new List<DocumentPlaceholderItem>
                {
                    new DocumentPlaceholderItem { Key = "FUN_DIAGNOSTICO", Label = "Diagnóstico Clínico", IsFunction = true },
                    new DocumentPlaceholderItem { Key = "FUN_TRATAMENTO", Label = "Tratamento Aplicado", IsFunction = true },
                    new DocumentPlaceholderItem { Key = "INPUT_DATA_ENTRADA_AMBULATORIO", Label = "Data Entrada Ambulatório", IsFunction = false },
                    new DocumentPlaceholderItem { Key = "INPUT_DATA_CLINICA", Label = "Data Alta Clínica", IsFunction = false },
                    new DocumentPlaceholderItem { Key = "INPUT_PROCEDIMENTOS_MEDICACAO_REALIZADAS_DURANTE_ATENDIMENTO", Label = "Procedimentos e Medicações", IsFunction = false },
                    new DocumentPlaceholderItem { Key = "INPUT_OBS_CLINICAS_ALTA", Label = "Observações Clínicas da Alta", IsFunction = false },
                    new DocumentPlaceholderItem { Key = "INPUT_INSTALACAO_RETORNO", Label = "Instalação de Retorno", IsFunction = false }
                }
            });
            return categories;
        }

        public override string? ResolveFun(string tokenName, Dictionary<string, string> tokenMap, ILogger? logger = null)
        {
            var key = tokenName.Trim().ToUpperInvariant();

            if (key == "FUN_DIAGNOSTICO")
            {
                if (tokenMap.TryGetValue("FUN_DIAGNOSTICO", out var val)) return val;
                if (tokenMap.TryGetValue("DIAGNOSTICO", out var val2)) return val2;
                if (tokenMap.TryGetValue("ATENDIMENTO.DIAGNOSTICO", out var val3)) return val3;
                return null;
            }
            if (key == "FUN_TRATAMENTO")
            {
                if (tokenMap.TryGetValue("FUN_TRATAMENTO", out var val)) return val;
                if (tokenMap.TryGetValue("TRATAMENTO", out var val2)) return val2;
                if (tokenMap.TryGetValue("ATENDIMENTO.TRATAMENTO", out var val3)) return val3;
                return null;
            }

            return base.ResolveFun(tokenName, tokenMap, logger);
        }
    }
}
