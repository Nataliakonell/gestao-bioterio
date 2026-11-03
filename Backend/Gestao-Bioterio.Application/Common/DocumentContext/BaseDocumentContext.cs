using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace Gestao_Bioterio.Application.Common.DocumentContext
{
    public class DocumentPlaceholderItem
    {
        public string Key { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public bool IsFunction { get; set; }
    }

    public class DocumentPlaceholderCategory
    {
        public string Category { get; set; } = string.Empty;
        public List<DocumentPlaceholderItem> Items { get; set; } = new();
    }

    public abstract class BaseDocumentContext
    {
        protected abstract string AreaName { get; }

        /// <summary>
        /// Retorna os comandos FUN_* globais (disponíveis para qualquer documento de qualquer página).
        /// </summary>
        public virtual List<DocumentPlaceholderCategory> GetGlobalPlaceholders()
        {
            return new List<DocumentPlaceholderCategory>
            {
                new DocumentPlaceholderCategory
                {
                    Category = "Comandos do Sistema [FUN_*]",
                    Items = new List<DocumentPlaceholderItem>
                    {
                        new DocumentPlaceholderItem { Key = "FUN_DATA_AGORA", Label = "Data Atual", IsFunction = true },
                        new DocumentPlaceholderItem { Key = "FUN_DATA_HORA_AGORA", Label = "Data e Hora Atual", IsFunction = true },
                        new DocumentPlaceholderItem { Key = "FUN_NOME_COMPLETO_USUARIO", Label = "Nome Completo do Usuário (RF)", IsFunction = true }
                    }
                }
            };
        }

        /// <summary>
        /// Retorna todos os placeholders disponíveis para a área atual (Globais + Pertinentes da área).
        /// </summary>
        public virtual List<DocumentPlaceholderCategory> GetAvailablePlaceholders()
        {
            return GetGlobalPlaceholders();
        }

        /// <summary>
        /// Tenta resolver os comandos FUN_* globais.
        /// </summary>
        protected virtual string? ResolveGlobalFun(string key, Dictionary<string, string> tokenMap)
        {
            if (key == "FUN_DATA_AGORA")
            {
                if (tokenMap.TryGetValue("FUN_DATA_AGORA", out var val)) return val;
                if (tokenMap.TryGetValue("DATAATUAL", out var val2)) return val2;
                return DateTime.Now.ToString("dd/MM/yyyy");
            }
            if (key == "FUN_DATA_HORA_AGORA")
            {
                if (tokenMap.TryGetValue("FUN_DATA_HORA_AGORA", out var val)) return val;
                if (tokenMap.TryGetValue("DATAHORAATUAL", out var val2)) return val2;
                return DateTime.Now.ToString("dd/MM/yyyy HH:mm");
            }
            if (key == "FUN_NOME_COMPLETO_USUARIO" || key == "FUN_NOME_RESPONSAVEL" || key == "FUN_NOME_RESPOSAVEL")
            {
                if (tokenMap.TryGetValue("FUN_NOME_COMPLETO_USUARIO", out var val)) return val;
                if (tokenMap.TryGetValue("FUN_NOME_RESPONSAVEL", out var val2)) return val2;
                if (tokenMap.TryGetValue("FUN_NOME_RESPOSAVEL", out var val3)) return val3;
                if (tokenMap.TryGetValue("RESPONSAVEL", out var val4)) return val4;
                return null;
            }
            return null;
        }

        /// <summary>
        /// Resolve um comando FUN_*. Se não estiver disponível no contexto nem na base,
        /// registra no logger e retorna null.
        /// </summary>
        public virtual string? ResolveFun(string tokenName, Dictionary<string, string> tokenMap, ILogger? logger = null)
        {
            var key = tokenName.Trim().ToUpperInvariant();

            var globalValue = ResolveGlobalFun(key, tokenMap);
            if (globalValue != null) return globalValue;

            logger?.LogWarning("[DocumentContext:{AreaName}] Função '{TokenName}' não está disponível no contexto de documento da página/área '{AreaName}'.", AreaName, tokenName, AreaName);
            return null;
        }
    }
}
