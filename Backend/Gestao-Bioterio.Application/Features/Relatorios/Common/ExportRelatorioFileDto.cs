namespace Gestao_Bioterio.Application.Features.Relatorios.Common
{
    public enum FormatoRelatorio
    {
        Excel = 1,
        Pdf = 2
    }

    public class ExportRelatorioFileDto
    {
        public byte[] FileBytes { get; set; } = Array.Empty<byte>();
        public string ContentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
    }
}
