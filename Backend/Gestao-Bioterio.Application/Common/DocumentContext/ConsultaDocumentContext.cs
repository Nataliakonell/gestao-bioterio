using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace Gestao_Bioterio.Application.Common.DocumentContext
{
    public class ConsultaDocumentContext : BaseDocumentContext
    {
        protected override string AreaName => "Consulta";

        public override List<DocumentPlaceholderCategory> GetAvailablePlaceholders()
        {
            var categories = GetGlobalPlaceholders();
            categories.Add(new DocumentPlaceholderCategory
            {
                Category = "Variáveis de Consulta / Animal",
                Items = new List<DocumentPlaceholderItem>
                {
                    new DocumentPlaceholderItem { Key = "FUN_NUMERO_REGISTRO", Label = "Número Registro Animal", IsFunction = true },
                    new DocumentPlaceholderItem { Key = "FUN_NOME_POPULAR", Label = "Nome Popular Animal", IsFunction = true },
                    new DocumentPlaceholderItem { Key = "FUN_ESPECIE", Label = "Espécie", IsFunction = true },
                    new DocumentPlaceholderItem { Key = "FUN_GENERO", Label = "Gênero", IsFunction = true },
                    new DocumentPlaceholderItem { Key = "FUN_FASE_VIDA", Label = "Fase de Vida", IsFunction = true },
                    new DocumentPlaceholderItem { Key = "FUN_LOCAL_ORIGEM", Label = "Local de Origem", IsFunction = true },
                    new DocumentPlaceholderItem { Key = "FUN_INSTALACAO_ATUAL", Label = "Instalação Atual", IsFunction = true }
                }
            });
            return categories;
        }

        public override string? ResolveFun(string tokenName, Dictionary<string, string> tokenMap, ILogger? logger = null)
        {
            var key = tokenName.Trim().ToUpperInvariant();

            if (key == "FUN_NUMERO_REGISTRO")
            {
                if (tokenMap.TryGetValue("FUN_NUMERO_REGISTRO", out var val)) return val;
                if (tokenMap.TryGetValue("NUMEROREGISTRO", out var val2)) return val2;
                if (tokenMap.TryGetValue("ANIMAL.NUMEROREGISTRO", out var val3)) return val3;
                return null;
            }
            if (key == "FUN_NOME_POPULAR")
            {
                if (tokenMap.TryGetValue("FUN_NOME_POPULAR", out var val)) return val;
                if (tokenMap.TryGetValue("NOMEPOPULAR", out var val2)) return val2;
                if (tokenMap.TryGetValue("ANIMAL.NOMEPOPULAR", out var val3)) return val3;
                return null;
            }
            if (key == "FUN_ESPECIE")
            {
                if (tokenMap.TryGetValue("FUN_ESPECIE", out var val)) return val;
                if (tokenMap.TryGetValue("ESPECIENOME", out var val2)) return val2;
                if (tokenMap.TryGetValue("ANIMAL.ESPECIENOME", out var val3)) return val3;
                if (tokenMap.TryGetValue("ESPECIE.NOME", out var val4)) return val4;
                return null;
            }
            if (key == "FUN_GENERO")
            {
                if (tokenMap.TryGetValue("FUN_GENERO", out var val)) return val;
                if (tokenMap.TryGetValue("GENERO", out var val2)) return val2;
                if (tokenMap.TryGetValue("ANIMAL.GENERO", out var val3)) return val3;
                return null;
            }
            if (key == "FUN_FASE_VIDA")
            {
                if (tokenMap.TryGetValue("FUN_FASE_VIDA", out var val)) return val;
                if (tokenMap.TryGetValue("FASEDEVIDA", out var val2)) return val2;
                if (tokenMap.TryGetValue("ANIMAL.FASEDEVIDA", out var val3)) return val3;
                return null;
            }
            if (key == "FUN_LOCAL_ORIGEM")
            {
                if (tokenMap.TryGetValue("FUN_LOCAL_ORIGEM", out var val)) return val;
                if (tokenMap.TryGetValue("LOCALORIGEMNOME", out var val2)) return val2;
                if (tokenMap.TryGetValue("LOCALORIGEM.NOME", out var val3)) return val3;
                return null;
            }
            if (key == "FUN_INSTALACAO_ATUAL")
            {
                if (tokenMap.TryGetValue("FUN_INSTALACAO_ATUAL", out var val)) return val;
                if (tokenMap.TryGetValue("INSTALACAOATUAL", out var val2)) return val2;
                if (tokenMap.TryGetValue("INSTALACAO.NOME", out var val3)) return val3;
                return null;
            }

            return base.ResolveFun(tokenName, tokenMap, logger);
        }
    }
}
