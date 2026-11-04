using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Relatorios.Common;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportPlantelRelatorio
{
    public class ExportPlantelRelatorioQuery : IRequest<ExportRelatorioFileDto>
    {
        public FormatoRelatorio Formato { get; set; } = FormatoRelatorio.Excel;
        public int? GrupoId { get; set; }
        public int? EspecieId { get; set; }
        public int? Situacao { get; set; }
        public int? Genero { get; set; }
        public int? FaseDeVida { get; set; }
        public DateTime? DataEntradaInicio { get; set; }
        public DateTime? DataEntradaFim { get; set; }
    }

    public class ExportPlantelRelatorioHandler : IRequestHandler<ExportPlantelRelatorioQuery, ExportRelatorioFileDto>
    {
        private readonly IRelatorioReadRepository _repository;

        public ExportPlantelRelatorioHandler(IRelatorioReadRepository repository)
        {
            _repository = repository;
        }

        public async Task<ExportRelatorioFileDto> Handle(ExportPlantelRelatorioQuery request, CancellationToken cancellationToken)
        {
            var dados = await _repository.GetRelatorioPlantelAsync(
                request.GrupoId,
                request.EspecieId,
                request.Situacao,
                request.Genero,
                request.FaseDeVida,
                request.DataEntradaInicio,
                request.DataEntradaFim,
                cancellationToken);

            var colunas = new List<string>
            {
                "Número de Registro",
                "Nome Popular",
                "Espécie",
                "Grupo",
                "Sexo",
                "Fase de Vida",
                "Situação",
                "Localização",
                "Data de Entrada",
                "SISFAUNA",
                "Nº Microchip"
            };

            var linhas = dados.Select(d => new List<string>
            {
                d.NumeroRegistro,
                d.NomePopular,
                d.Especie,
                d.Grupo,
                d.Sexo,
                d.FaseDeVida,
                d.Situacao,
                d.Localizacao,
                d.DataDeEntrada,
                d.Sisfauna,
                d.NumeroChip
            }).ToList();

            return RelatorioDocumentBuilder.CriarArquivoResponse(
                request.Formato,
                "relatorio_plantel",
                "Relatório de Plantel",
                colunas,
                linhas);
        }
    }
}
