namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IRelatorioReadRepository
    {
        Task<List<RelatorioPlantelItemDto>> GetRelatorioPlantelAsync(
            int? grupoId,
            int? especieId,
            int? situacao,
            int? genero,
            int? faseDeVida,
            DateTime? dataEntradaInicio,
            DateTime? dataEntradaFim,
            CancellationToken ct = default);

        Task<List<RelatorioAlimentarItemDto>> GetRelatorioAlimentarAsync(
            DateTime? dataInicio,
            DateTime? dataFim,
            int? especieId,
            int? consumo,
            string? responsavel,
            CancellationToken ct = default);

        Task<List<RelatorioClinicoItemDto>> GetRelatorioClinicoAsync(
            DateTime? dataInicio,
            DateTime? dataFim,
            int? tipoClinico,
            int? animalId,
            string? veterinario,
            CancellationToken ct = default);

        Task<List<RelatorioInstalacaoItemDto>> GetRelatorioInstalacoesAsync(
            int localizacaoId,
            bool incluirSublocais,
            int? especieId,
            CancellationToken ct = default);

        Task<List<RelatorioEventoItemDto>> GetRelatorioEventosAsync(
            DateTime? dataInicio,
            DateTime? dataFim,
            int? tipoEvento,
            int? status,
            CancellationToken ct = default);

        Task<List<RelatorioMovimentacaoItemDto>> GetRelatorioMovimentacoesAsync(
            DateTime? dataInicio,
            DateTime? dataFim,
            int? animalId,
            int? tipoMovimentacao,
            int? localizacaoId,
            CancellationToken ct = default);

        Task<List<RelatorioSisfaunaItemDto>> GetRelatorioSisfaunaAsync(
            int? anoReferencia,
            DateTime? dataEntradaInicio,
            DateTime? dataEntradaFim,
            int? especieId,
            bool somenteAtivos,
            CancellationToken ct = default);
    }

    public class RelatorioPlantelItemDto
    {
        public string NumeroRegistro { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;
        public string Especie { get; set; } = string.Empty;
        public string Grupo { get; set; } = string.Empty;
        public string Sexo { get; set; } = string.Empty;
        public string FaseDeVida { get; set; } = string.Empty;
        public string Situacao { get; set; } = string.Empty;
        public string Localizacao { get; set; } = string.Empty;
        public string DataDeEntrada { get; set; } = string.Empty;
        public string Sisfauna { get; set; } = string.Empty;
        public string NumeroChip { get; set; } = string.Empty;
    }

    public class RelatorioAlimentarItemDto
    {
        public string Data { get; set; } = string.Empty;
        public string Animal { get; set; } = string.Empty;
        public string Especie { get; set; } = string.Empty;
        public string Refeicao { get; set; } = string.Empty;
        public string QuantidadeOfertada { get; set; } = string.Empty;
        public string QuantidadeConsumidaSaldo { get; set; } = string.Empty;
        public string StatusConsumo { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
        public string Observacoes { get; set; } = string.Empty;
    }

    public class RelatorioClinicoItemDto
    {
        public string DataHora { get; set; } = string.Empty;
        public string NumeroRegistro { get; set; } = string.Empty;
        public string AnimalNomeEspecie { get; set; } = string.Empty;
        public string TipoAtendimento { get; set; } = string.Empty;
        public string DescricaoDiagnostico { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
        public string StatusParecer { get; set; } = string.Empty;
    }

    public class RelatorioInstalacaoItemDto
    {
        public string Localizacao { get; set; } = string.Empty;
        public string Ambiente { get; set; } = string.Empty;
        public string Animal { get; set; } = string.Empty;
        public string Especie { get; set; } = string.Empty;
        public string Sexo { get; set; } = string.Empty;
        public string FaseDeVida { get; set; } = string.Empty;
        public string DataAlocacao { get; set; } = string.Empty;
    }

    public class RelatorioEventoItemDto
    {
        public string NomeEvento { get; set; } = string.Empty;
        public string TipoEvento { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
        public int QuantidadeAnimais { get; set; }
        public string Animais { get; set; } = string.Empty;
    }

    public class RelatorioMovimentacaoItemDto
    {
        public string DataHora { get; set; } = string.Empty;
        public string Animal { get; set; } = string.Empty;
        public string Especie { get; set; } = string.Empty;
        public string TipoMovimentacao { get; set; } = string.Empty;
        public string LocalizacaoDestino { get; set; } = string.Empty;
        public string Evento { get; set; } = string.Empty;
        public string ResponsavelRF { get; set; } = string.Empty;
    }

    public class RelatorioSisfaunaItemDto
    {
        public string NumeroRegistro { get; set; } = string.Empty;
        public string NumeroChip { get; set; } = string.Empty;
        public string Especie { get; set; } = string.Empty;
        public string Sexo { get; set; } = string.Empty;
        public string FaseDeVida { get; set; } = string.Empty;
        public string LocalOrigem { get; set; } = string.Empty;
        public string DataEntrada { get; set; } = string.Empty;
        public string Situacao { get; set; } = string.Empty;
        public string TermoDoacao { get; set; } = string.Empty;
    }
}
