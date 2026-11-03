using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Gestao_Bioterio.Application.Helpers
{
    public class FormatString
    {

        public static string FormatToTitleCase(string nome)
        {
            if (string.IsNullOrWhiteSpace(nome))
                return string.Empty;

            // Remove espaços extras
            nome = Regex.Replace(nome.Trim(), @"\s+", " ");

            var palavras = nome.ToLower().Split(' ');

            for (int i = 0; i < palavras.Length; i++)
            {
                if (palavras[i].Length > 0)
                {
                    palavras[i] = char.ToUpper(palavras[i][0]) + palavras[i].Substring(1);
                }
            }
            return string.Join(" ", palavras);
        }
    }
}
