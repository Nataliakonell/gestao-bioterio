using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Contracts.Infrastructure;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence
{
    public class BioterioDbContext : DbContext
    {
        private readonly ICurrentUserService? _currentUserService;

        public BioterioDbContext(DbContextOptions<BioterioDbContext> options, ICurrentUserService? currentUserService = null) : base(options)
        {
            _currentUserService = currentUserService;
        }

        public DbSet<Animal> Animals { get; set; }
        public DbSet<Especie> Especies { get; set; }
        public DbSet<InstalacaoBioterio> InstalacoesBioterio { get; set; }
        public DbSet<Grupo> Groups { get; set; }
        public DbSet<AnimalLog> AnimaisLog { get; set; }
        public DbSet<LocalOrigem> LocalOrigens { get; set; }
        public DbSet<TipoProcedimento> TiposProcedimento { get; set; }
        public DbSet<Alimentacao> Alimentacoes { get; set; }
        public DbSet<Refeicao> Refeicoes { get; set; }
        public DbSet<BiometriaAnimal> BiometriasAnimais { get; set; }
        public DbSet<RotinaAnimal> RotinasAnimais { get; set; }
        public DbSet<RotinaAnimalLog> RotinasAnimaisLogs { get; set; }
        public DbSet<Consulta> Consultas { get; set; }
        public DbSet<Evolucao> Evolucoes { get; set; }
        public DbSet<Procedimento> Procedimentos { get; set; }
        public DbSet<SolicitacaoExame> SolicitacoesExame { get; set; }
        public DbSet<Medicacao> Medicacoes { get; set; }
        public DbSet<PrescricaoMedicacao> PrescricoesMedicacao { get; set; }
        public DbSet<MedicacaoAdministrada> MedicacoesAdministradas { get; set; }
        public DbSet<ProtocoloDesverminacao> ProtocolosDesverminacao { get; set; }
        public DbSet<DoseAplicacaoDesverminacao> DosesAplicacaoDesverminacao { get; set; }
        public DbSet<Anexo> Anexos { get; set; }
        public DbSet<AltaAmbulatorial> AltaAmbulatoriais { get; set; }
        public DbSet<LiberacaoQuarentena> LiberacoesQuarentena { get; set; }
        public DbSet<ModeloDocumento> ModelosDocumentos { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Perfil> Perfis { get; set; }
        public DbSet<Funcionalidade> Funcionalidades { get; set; }
        public DbSet<PerfilPermissao> PerfilPermissoes { get; set; }
        public DbSet<PerfilPermissaoLog> PerfilPermissoesLogs { get; set; }
        public DbSet<Localizacao> Localizacoes { get; set; }
        public DbSet<AnimalLocalizacao> AnimalLocalizacoes { get; set; }
        public DbSet<MovimentacaoAnimal> MovimentacoesAnimais { get; set; }
        public DbSet<Evento> Eventos { get; set; }
        public DbSet<EventoAnimal> EventosAnimais { get; set; }
        public DbSet<DocumentoEvento> DocumentosEventos { get; set; }
        public DbSet<RegistroObito> RegistrosObito { get; set; }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var now = TimeZoneHelper.GetNowInCampoGrande();
            var currentRF = _currentUserService?.GetRfFromToken() ?? string.Empty;
            var currentNome = _currentUserService?.GetNomeFromToken() ?? string.Empty;

            foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.DataCriacao = now;
                    if (string.IsNullOrEmpty(entry.Entity.RF))
                        entry.Entity.RF = currentRF;
                }
            }

            foreach (var entry in ChangeTracker.Entries<Animal>().ToList())
            {
                if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                {
                    var animal = entry.Entity;
                    string tipoOperacao = entry.State == EntityState.Added ? "CREATE" : "UPDATE";

                    var dataEntradaCampoGrande = TimeZoneHelper.ConvertToCampoGrandeTime(animal.DataDeEntrada);


                    var animalLog = new AnimalLog
                    {
                        Animal = animal,
                        AnimalId = animal.Id,
                        NumeroRegistro = animal.NumeroRegistro,
                        NomePopular = animal.NomePopular,
                        EspecieId = animal.EspecieId,
                        InstalacaoBioterioId = animal.InstalacaoBioterioId,
                        Genero = animal.Genero,
                        FaseDeVida = animal.FaseDeVida,
                        DataDeEntrada = dataEntradaCampoGrande,
                        Municipio = animal.Municipio,
                        LocalOrigemId = animal.LocalOrigemId,
                        NumeroChip = animal.NumeroChip,
                        Sisfauna = animal.Sisfauna,
                        TermoDeDoacao = animal.TermoDeDoacao,
                        Situacao = animal.SituacaoAnimal,
                        NomeArquivoFoto = animal.NomeArquivoFoto,
                        RF = currentRF,
                        DataCriacao = now,
                        DataAtualizacao = now,
                        TipoOperacao = tipoOperacao
                    };

                    AnimaisLog.Add(animalLog);
                }
            }

            foreach (var entry in ChangeTracker.Entries<RotinaAnimal>().ToList())
            {
                if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                {
                    var rotina = entry.Entity;
                    string tipoOperacao = entry.State == EntityState.Added ? "CREATE" : "UPDATE";

                    var rotinaLog = new RotinaAnimalLog
                    {
                        RotinaAnimal = rotina,
                        RotinaAnimalId = rotina.Id,
                        EspecieId = rotina.EspecieId,
                        TipoRotina = rotina.TipoRotina,
                        FaseDeVida = rotina.FaseDeVida,
                        TipoFrequencia = rotina.TipoFrequencia,
                        Frequencia = rotina.Frequencia,
                        DiaSemanaProgramado = rotina.DiaSemanaProgramado,
                        ProtocoloDieta = rotina.ProtocoloDieta,
                        RF = currentRF,
                        DataCriacao = now,
                        DataAtualizacao = now,
                        TipoOperacao = tipoOperacao
                    };

                    RotinasAnimaisLogs.Add(rotinaLog);
                }
            }

            foreach (var entry in ChangeTracker.Entries<PerfilPermissao>().ToList())
            {
                if (entry.State == EntityState.Added || entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
                {
                    var perfilPermissao = entry.Entity;
                    string tipoOperacao = entry.State switch
                    {
                        EntityState.Added => "CREATE",
                        EntityState.Modified => "UPDATE",
                        EntityState.Deleted => "DELETE",
                        _ => "UNKNOWN"
                    };

                    var permissaoLog = new PerfilPermissaoLog
                    {
                        PerfilId = perfilPermissao.PerfilId,
                        FuncionalidadeId = perfilPermissao.FuncionalidadeId,
                        NivelAcesso = perfilPermissao.NivelAcesso,
                        RF = currentRF,
                        DataCriacao = now,
                        TipoOperacao = tipoOperacao
                    };

                    PerfilPermissoesLogs.Add(permissaoLog);
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("bioterio");
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(BioterioDbContext).Assembly);
            base.OnModelCreating(modelBuilder);
        }
    }
}