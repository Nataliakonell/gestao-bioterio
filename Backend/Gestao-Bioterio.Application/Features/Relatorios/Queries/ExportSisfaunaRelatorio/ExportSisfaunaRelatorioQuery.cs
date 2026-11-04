using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Relatorios.Common;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportSisfaunaRelatorio
{
    public class ExportSisfaunaRelatorioQuery : IRequest<ExportRelatorioFileDto>
    {
        public FormatoRelatorio Formato { get; set; } = FormatoRelatorio.Excel;
        public int? AnoReferencia { get; set; }
        public DateTime? DataEntradaInicio { get; set; }
        public DateTime? DataEntradaFim { get; set; }
        public int? EspecieId { get; set; }
        public bool SomenteAtivos { get; set; } = false;
    }

    public class ExportSisfaunaRelatorioHandler : IRequestHandler<ExportSisfaunaRelatorioQuery, ExportRelatorioFileDto>
    {
        private readonly IRelatorioReadRepository _repository;

        public ExportSisfaunaRelatorioHandler(IRelatorioReadRepository repository)
        {
            _repository = repository;
        }

        public async Task<ExportRelatorioFileDto> Handle(ExportSisfaunaRelatorioQuery request, CancellationToken cancellationToken)
        {
            var dados = await _repository.GetRelatorioSisfaunaAsync(
                request.AnoReferencia,
                request.DataEntradaInicio,
                request.DataEntradaFim,
                request.EspecieId,
                request.SomenteAtivos,
                cancellationToken);

            var colunas = new List<string>
            {
                "Nº de Registro",
                "Nº Microchip",
                "Espécie",
                "Sexo",
                "Fase de Vida",
                "Procedência / Origem",
                "Data de Entrada",
                "Situação",
                "Termo de Doação"
            };

            var linhas = dados.Select(d => new List<string>
            {
                d.NumeroRegistro,
                d.NumeroChip,
                d.Especie,
                d.Sexo,
                d.FaseDeVida,
                d.LocalOrigem,
                d.DataEntrada,
                d.Situacao,
                d.TermoDoacao
            }).ToList();

            var subtitulo = request.AnoReferencia.HasValue ? $"Ano Referência: {request.AnoReferencia.Value}" : null;

            return RelatorioDocumentBuilder.CriarArquivoResponse(
                request.Formato,
                "relatorio_sisfauna",
                "Relatório SISFAUNA",
                colunas,
                linhas,
                subtitulo);
        }
    }
}
