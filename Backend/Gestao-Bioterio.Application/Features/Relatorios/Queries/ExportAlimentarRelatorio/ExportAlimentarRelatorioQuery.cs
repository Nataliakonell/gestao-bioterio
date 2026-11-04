using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Relatorios.Common;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportAlimentarRelatorio
{
    public class ExportAlimentarRelatorioQuery : IRequest<ExportRelatorioFileDto>
    {
        public FormatoRelatorio Formato { get; set; } = FormatoRelatorio.Excel;
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public int? EspecieId { get; set; }
        public int? Consumo { get; set; }
        public string? Responsavel { get; set; }
    }

    public class ExportAlimentarRelatorioHandler : IRequestHandler<ExportAlimentarRelatorioQuery, ExportRelatorioFileDto>
    {
        private readonly IRelatorioReadRepository _repository;

        public ExportAlimentarRelatorioHandler(IRelatorioReadRepository repository)
        {
            _repository = repository;
        }

        public async Task<ExportRelatorioFileDto> Handle(ExportAlimentarRelatorioQuery request, CancellationToken cancellationToken)
        {
            var dados = await _repository.GetRelatorioAlimentarAsync(
                request.DataInicio,
                request.DataFim,
                request.EspecieId,
                request.Consumo,
                request.Responsavel,
                cancellationToken);

            var colunas = new List<string>
            {
                "Data",
                "Animal",
                "Espécie",
                "Refeição",
                "Qtd Ofertada",
                "Qtd Consumida / Saldo",
                "Status Consumo",
                "Responsável",
                "Observações"
            };

            var linhas = dados.Select(d => new List<string>
            {
                d.Data,
                d.Animal,
                d.Especie,
                d.Refeicao,
                d.QuantidadeOfertada,
                d.QuantidadeConsumidaSaldo,
                d.StatusConsumo,
                d.Responsavel,
                d.Observacoes
            }).ToList();

            return RelatorioDocumentBuilder.CriarArquivoResponse(
                request.Formato,
                "relatorio_alimentar",
                "Relatório de Alimentação",
                colunas,
                linhas);
        }
    }
}
