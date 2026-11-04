using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Relatorios.Common;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportClinicoRelatorio
{
    public class ExportClinicoRelatorioQuery : IRequest<ExportRelatorioFileDto>
    {
        public FormatoRelatorio Formato { get; set; } = FormatoRelatorio.Excel;
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public int? TipoClinico { get; set; }
        public int? AnimalId { get; set; }
        public string? Veterinario { get; set; }
    }

    public class ExportClinicoRelatorioHandler : IRequestHandler<ExportClinicoRelatorioQuery, ExportRelatorioFileDto>
    {
        private readonly IRelatorioReadRepository _repository;

        public ExportClinicoRelatorioHandler(IRelatorioReadRepository repository)
        {
            _repository = repository;
        }

        public async Task<ExportRelatorioFileDto> Handle(ExportClinicoRelatorioQuery request, CancellationToken cancellationToken)
        {
            var dados = await _repository.GetRelatorioClinicoAsync(
                request.DataInicio,
                request.DataFim,
                request.TipoClinico,
                request.AnimalId,
                request.Veterinario,
                cancellationToken);

            var colunas = new List<string>
            {
                "Data/Hora",
                "Nº Registro",
                "Animal / Espécie",
                "Tipo Atendimento",
                "Descrição / Diagnóstico",
                "Responsável",
                "Status / Parecer"
            };

            var linhas = dados.Select(d => new List<string>
            {
                d.DataHora,
                d.NumeroRegistro,
                d.AnimalNomeEspecie,
                d.TipoAtendimento,
                d.DescricaoDiagnostico,
                d.Responsavel,
                d.StatusParecer
            }).ToList();

            return RelatorioDocumentBuilder.CriarArquivoResponse(
                request.Formato,
                "relatorio_clinico",
                "Relatório Clínico",
                colunas,
                linhas);
        }
    }
}
