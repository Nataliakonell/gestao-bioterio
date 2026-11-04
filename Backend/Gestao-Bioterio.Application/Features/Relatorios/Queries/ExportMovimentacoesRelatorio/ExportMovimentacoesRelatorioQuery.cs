using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Relatorios.Common;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportMovimentacoesRelatorio
{
    public class ExportMovimentacoesRelatorioQuery : IRequest<ExportRelatorioFileDto>
    {
        public FormatoRelatorio Formato { get; set; } = FormatoRelatorio.Excel;
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public int? AnimalId { get; set; }
        public int? TipoMovimentacao { get; set; }
        public int? LocalizacaoId { get; set; }
    }

    public class ExportMovimentacoesRelatorioHandler : IRequestHandler<ExportMovimentacoesRelatorioQuery, ExportRelatorioFileDto>
    {
        private readonly IRelatorioReadRepository _repository;

        public ExportMovimentacoesRelatorioHandler(IRelatorioReadRepository repository)
        {
            _repository = repository;
        }

        public async Task<ExportRelatorioFileDto> Handle(ExportMovimentacoesRelatorioQuery request, CancellationToken cancellationToken)
        {
            var dados = await _repository.GetRelatorioMovimentacoesAsync(
                request.DataInicio,
                request.DataFim,
                request.AnimalId,
                request.TipoMovimentacao,
                request.LocalizacaoId,
                cancellationToken);

            var colunas = new List<string>
            {
                "Data/Hora",
                "Animal",
                "Espécie",
                "Tipo de Movimentação",
                "Localização Destino",
                "Evento",
                "Responsável (RF)"
            };

            var linhas = dados.Select(d => new List<string>
            {
                d.DataHora,
                d.Animal,
                d.Especie,
                d.TipoMovimentacao,
                d.LocalizacaoDestino,
                d.Evento,
                d.ResponsavelRF
            }).ToList();

            return RelatorioDocumentBuilder.CriarArquivoResponse(
                request.Formato,
                "relatorio_movimentacoes",
                "Relatório de Movimentações",
                colunas,
                linhas);
        }
    }
}
