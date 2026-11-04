using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Relatorios.Common;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportEventosRelatorio
{
    public class ExportEventosRelatorioQuery : IRequest<ExportRelatorioFileDto>
    {
        public FormatoRelatorio Formato { get; set; } = FormatoRelatorio.Excel;
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public int? TipoEvento { get; set; }
        public int? Status { get; set; }
    }

    public class ExportEventosRelatorioHandler : IRequestHandler<ExportEventosRelatorioQuery, ExportRelatorioFileDto>
    {
        private readonly IRelatorioReadRepository _repository;

        public ExportEventosRelatorioHandler(IRelatorioReadRepository repository)
        {
            _repository = repository;
        }

        public async Task<ExportRelatorioFileDto> Handle(ExportEventosRelatorioQuery request, CancellationToken cancellationToken)
        {
            var dados = await _repository.GetRelatorioEventosAsync(
                request.DataInicio,
                request.DataFim,
                request.TipoEvento,
                request.Status,
                cancellationToken);

            var colunas = new List<string>
            {
                "Nome do Evento",
                "Tipo",
                "Status",
                "Período",
                "Responsável",
                "Qtd Animais",
                "Animais"
            };

            var linhas = dados.Select(d => new List<string>
            {
                d.NomeEvento,
                d.TipoEvento,
                d.Status,
                d.Periodo,
                d.Responsavel,
                d.QuantidadeAnimais.ToString(),
                d.Animais
            }).ToList();

            return RelatorioDocumentBuilder.CriarArquivoResponse(
                request.Formato,
                "relatorio_eventos",
                "Relatório de Eventos",
                colunas,
                linhas);
        }
    }
}
