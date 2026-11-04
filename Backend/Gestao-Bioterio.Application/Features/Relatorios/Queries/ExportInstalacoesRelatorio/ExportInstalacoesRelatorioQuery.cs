using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Relatorios.Common;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportInstalacoesRelatorio
{
    public class ExportInstalacoesRelatorioQuery : IRequest<ExportRelatorioFileDto>
    {
        public FormatoRelatorio Formato { get; set; } = FormatoRelatorio.Excel;
        public int LocalizacaoId { get; set; }
        public bool IncluirSublocais { get; set; } = true;
        public int? EspecieId { get; set; }
    }

    public class ExportInstalacoesRelatorioHandler : IRequestHandler<ExportInstalacoesRelatorioQuery, ExportRelatorioFileDto>
    {
        private readonly IRelatorioReadRepository _repository;

        public ExportInstalacoesRelatorioHandler(IRelatorioReadRepository repository)
        {
            _repository = repository;
        }

        public async Task<ExportRelatorioFileDto> Handle(ExportInstalacoesRelatorioQuery request, CancellationToken cancellationToken)
        {
            var dados = await _repository.GetRelatorioInstalacoesAsync(
                request.LocalizacaoId,
                request.IncluirSublocais,
                request.EspecieId,
                cancellationToken);

            var colunas = new List<string>
            {
                "Localização",
                "Ambiente",
                "Animal",
                "Espécie",
                "Sexo",
                "Fase de Vida",
                "Data de Alocação"
            };

            var linhas = dados.Select(d => new List<string>
            {
                d.Localizacao,
                d.Ambiente,
                d.Animal,
                d.Especie,
                d.Sexo,
                d.FaseDeVida,
                d.DataAlocacao
            }).ToList();

            return RelatorioDocumentBuilder.CriarArquivoResponse(
                request.Formato,
                "relatorio_instalacoes",
                "Relatório de Instalações",
                colunas,
                linhas);
        }
    }
}
