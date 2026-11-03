using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Persistence.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Gestao_Bioterio.Persistence
{
    public static class PersistenceServiceRegistration
    {
        public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<BioterioDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<IDbConnection>(sp =>
            {
                var connectionString = configuration.GetConnectionString("ExternalConnection");
                return new SqlConnection(connectionString);
            });

            services.AddScoped<IAnimalRepository, AnimalRepository>();
            services.AddScoped<IAnimalLogRepository, AnimalLogRepository>();
            services.AddScoped<IEspecieRepository, EspecieRepository>();
            services.AddScoped<IInstalacaoBioterioRepository, InstalacaoBioterioRepository>();
            services.AddScoped<IGrupoRepository, GrupoRepository>();
            services.AddScoped<ILocalOrigemRepository, LocalOrigemRepository>();
            services.AddScoped<IAlimentacaoRepository, AlimentacaoRepository>();
            services.AddScoped<IRefeicaoRepository, RefeicaoRepository>();
            services.AddScoped<IBiometriaAnimalRepository, BiometriaAnimalRepository>();
            services.AddScoped<IRotinaAnimalRepository, RotinaAnimalRepository>();
            services.AddScoped<IRotinaAnimalLogRepository, RotinaAnimalLogRepository>();
            services.AddScoped<IConsultaRepository, ConsultaRepository>();
            services.AddScoped<IEvolucaoRepository, EvolucaoRepository>();
            services.AddScoped<IProcedimentoRepository, ProcedimentoRepository>();
            services.AddScoped<ITipoProcedimentoRepository, TipoProcedimentoRepository>();
            services.AddScoped<ISolicitacaoExameRepository, SolicitacaoExameRepository>();
            services.AddScoped<IMedicacaoRepository, MedicacaoRepository>();
            services.AddScoped<IPrescricaoMedicacaoRepository, PrescricaoMedicacaoRepository>();
            services.AddScoped<IMedicacaoAdministradaRepository, MedicacaoAdministradaRepository>();
            services.AddScoped<IProtocoloDesverminacaoRepository, ProtocoloDesverminacaoRepository>();
            services.AddScoped<IDoseAplicacaoDesverminacaoRepository, DoseAplicacaoDesverminacaoRepository>();
            services.AddScoped<IAnexoRepository, AnexoRepository>();
            services.AddScoped<IAltaAmbulatoriaRepository, AltaAmbulatoriaRepository>();
            services.AddScoped<ILiberacaoQuarentenaRepository, LiberacaoQuarentenaRepository>();
            services.AddScoped<IModeloDocumentoRepository, ModeloDocumentoRepository>();
            services.AddScoped<IUsuarioRepository, UsuarioRepository>();
            services.AddScoped<IPerfilRepository, PerfilRepository>();
            services.AddScoped<IFuncionalidadeRepository, FuncionalidadeRepository>();
            services.AddScoped<IPerfilPermissaoRepository, PerfilPermissaoRepository>();
            services.AddScoped<IPerfilPermissaoLogRepository, PerfilPermissaoLogRepository>();
            services.AddScoped<ILocalizacaoRepository, LocalizacaoRepository>();
            services.AddScoped<IAnimalLocalizacaoRepository, AnimalLocalizacaoRepository>();
            services.AddScoped<IMovimentacaoAnimalRepository, MovimentacaoAnimalRepository>();
            services.AddScoped<IEventoRepository, EventoRepository>();
            services.AddScoped<IEventoAnimalRepository, EventoAnimalRepository>();
            services.AddScoped<IDocumentoEventoRepository, DocumentoEventoRepository>();
            services.AddScoped<IRegistroObitoRepository, RegistroObitoRepository>();

            return services;
        }
    }
}
