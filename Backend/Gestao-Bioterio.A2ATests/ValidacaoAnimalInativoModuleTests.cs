using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Gestao_Bioterio.A2ATests
{
    [Collection("SequentialA2A")]
    public class ValidacaoAnimalInativoModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public ValidacaoAnimalInativoModuleTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
                builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

                builder.ConfigureServices(services =>
                {
                    services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                    services.AddDbContext<BioterioDbContext>(options =>
                        options.UseInMemoryDatabase("GestaoBioterioAnimalInativoTestDb"));

                    services.AddHttpClient("UcdbAuth")
                        .ConfigurePrimaryHttpMessageHandler(() => new MockAuthHandler());
                });
            });
            _client = _factory.CreateClient();
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "test-token");
        }

        private async Task<(int animalVivoId, int animalObitoId, int animalReintroduzidoId)> SeedBaseDataAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();

            if (!context.Groups.Any(g => g.Id == 1))
                context.Groups.Add(new Grupo { Id = 1, Nome = "Roedores" });

            if (!context.Especies.Any(e => e.Id == 1))
                context.Especies.Add(new Especie { Id = 1, Nome = "Rattus norvegicus", NomePopular = "Rato Wistar", GrupoId = 1 });

            if (!context.InstalacoesBioterio.Any(i => i.Id == 1))
                context.InstalacoesBioterio.Add(new InstalacaoBioterio { Id = 1, Nome = "BiotÃ©rio Central" });

            if (!context.LocalOrigens.Any(l => l.Id == 1))
                context.LocalOrigens.Add(new LocalOrigem { Id = 1, Nome = "CriaÃ§Ã£o PrÃ³pria" });

            if (!context.Medicacoes.Any(m => m.Id == 1))
                context.Medicacoes.Add(new Medicacao { Id = 1, NomeComercial = "Dipirona 500mg", PrincipioAtivo = "Dipirona" });

            await context.SaveChangesAsync();

            var prefix = Guid.NewGuid().ToString()[..6];

            var animalVivo = new Animal
            {
                NumeroRegistro = $"VIVO-{prefix}",
                NomePopular = "Rato Vivo",
                EspecieId = 1,
                InstalacaoBioterioId = 1,
                LocalOrigemId = 1,
                Genero = Genero.Macho,
                FaseDeVida = FaseDeVida.Adulto,
                SituacaoAnimal = Situacao.Vivo,
                DataDeEntrada = DateTime.UtcNow.AddDays(-30)
            };
            var animalObito = new Animal
            {
                NumeroRegistro = $"OBITO-{prefix}",
                NomePopular = "Rato Ã“bito",
                EspecieId = 1,
                InstalacaoBioterioId = 1,
                LocalOrigemId = 1,
                Genero = Genero.Femea,
                FaseDeVida = FaseDeVida.Adulto,
                SituacaoAnimal = Situacao.Obito,
                DataDeEntrada = DateTime.UtcNow.AddDays(-30)
            };
            var animalReintroduzido = new Animal
            {
                NumeroRegistro = $"REINT-{prefix}",
                NomePopular = "Rato Reintroduzido",
                EspecieId = 1,
                InstalacaoBioterioId = 1,
                LocalOrigemId = 1,
                Genero = Genero.Macho,
                FaseDeVida = FaseDeVida.Adulto,
                SituacaoAnimal = Situacao.Reintroduzido,
                DataDeEntrada = DateTime.UtcNow.AddDays(-30)
            };

            context.Animals.AddRange(animalVivo, animalObito, animalReintroduzido);
            await context.SaveChangesAsync();

            return (animalVivo.Id, animalObito.Id, animalReintroduzido.Id);
        }

        [Fact]
        public async Task Alimentacao_AnimalEmObito_RejeitaRegistro()
        {
            var (_, animalObitoId, _) = await SeedBaseDataAsync();

            var payload = new
            {
                animalId = animalObitoId,
                dataAlimentacao = DateTime.Now,
                pesoRecomendado = 30m,
                refeicoes = new[]
                {
                    new { tipoRefeicao = 1, pesoRefeicao = 30m, situacaoRefeicao = 1 }
                }
            };

            var response = await _client.PostAsJsonAsync("/api/Alimentacao", payload);
            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();

            Assert.NotNull(result);
            Assert.False(result!.Success);
            Assert.Contains(result.ValidationErrors ?? new List<string>(), e => e.Contains("Ã“bito") || e.Contains("Reintroduzido") || e.Contains("situaÃ§Ã£o"));
        }

        [Fact]
        public async Task Alimentacao_AnimalReintroduzido_RejeitaRegistro()
        {
            var (_, _, animalReintroduzidoId) = await SeedBaseDataAsync();

            var payload = new
            {
                animalId = animalReintroduzidoId,
                dataAlimentacao = DateTime.Now,
                pesoRecomendado = 30m,
                refeicoes = new[]
                {
                    new { tipoRefeicao = 1, pesoRefeicao = 30m, situacaoRefeicao = 1 }
                }
            };

            var response = await _client.PostAsJsonAsync("/api/Alimentacao", payload);
            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();

            Assert.NotNull(result);
            Assert.False(result!.Success);
            Assert.Contains(result.ValidationErrors ?? new List<string>(), e => e.Contains("Ã“bito") || e.Contains("Reintroduzido") || e.Contains("situaÃ§Ã£o"));
        }

        [Fact]
        public async Task Biometria_AnimalEmObito_RejeitaRegistro()
        {
            var (_, animalObitoId, _) = await SeedBaseDataAsync();

            var payload = new
            {
                animalId = animalObitoId,
                peso = 150m,
                comprimento = 20m,
                dataBiometria = DateTime.UtcNow
            };

            var response = await _client.PostAsJsonAsync("/api/BiometriaAnimal", payload);
            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();

            Assert.NotNull(result);
            Assert.False(result!.Success);
            Assert.Contains(result.ValidationErrors ?? new List<string>(), e => e.Contains("Ã“bito") || e.Contains("Reintroduzido") || e.Contains("situaÃ§Ã£o"));
        }

        [Fact]
        public async Task Biometria_AnimalReintroduzido_RejeitaRegistro()
        {
            var (_, _, animalReintroduzidoId) = await SeedBaseDataAsync();

            var payload = new
            {
                animalId = animalReintroduzidoId,
                peso = 150m,
                comprimento = 20m,
                dataBiometria = DateTime.UtcNow
            };

            var response = await _client.PostAsJsonAsync("/api/BiometriaAnimal", payload);
            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();

            Assert.NotNull(result);
            Assert.False(result!.Success);
            Assert.Contains(result.ValidationErrors ?? new List<string>(), e => e.Contains("Ã“bito") || e.Contains("Reintroduzido") || e.Contains("situaÃ§Ã£o"));
        }

        [Fact]
        public async Task PrescricaoMedicacao_AnimalEmObito_RejeitaRegistro()
        {
            var (_, animalObitoId, _) = await SeedBaseDataAsync();

            var payload = new
            {
                animalId = animalObitoId,
                medicacaoId = 1,
                volumeDose = "1ml",
                viaAdministracao = 1,
                quantidadeDoses = 3,
                intervaloEntreDosesHoras = 8,
                dataHoraInicio = DateTime.UtcNow,
                responsavel = "Dr. Veterinario"
            };

            var response = await _client.PostAsJsonAsync("/api/PrescricaoMedicacao", payload);
            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();

            Assert.NotNull(result);
            Assert.False(result!.Success);
            Assert.Contains(result.ValidationErrors ?? new List<string>(), e => e.Contains("Ã“bito") || e.Contains("Reintroduzido") || e.Contains("situaÃ§Ã£o"));
        }

        [Fact]
        public async Task ProtocoloDesverminacao_AnimalEmObito_RejeitaRegistro()
        {
            var (_, animalObitoId, _) = await SeedBaseDataAsync();

            var payload = new
            {
                animalId = animalObitoId,
                dataEntrada = DateTime.UtcNow
            };

            var response = await _client.PostAsJsonAsync("/api/ProtocoloDesverminacao", payload);
            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();

            Assert.NotNull(result);
            Assert.False(result!.Success);
            Assert.Contains(result.ValidationErrors ?? new List<string>(), e => e.Contains("Ã“bito") || e.Contains("Reintroduzido") || e.Contains("situaÃ§Ã£o"));
        }

        [Fact]
        public async Task MedicacaoAdministrada_AnimalEmObito_RejeitaRegistro()
        {
            var (animalVivoId, _, _) = await SeedBaseDataAsync();

            // 1. Criar prescriÃ§Ã£o para animal vivo
            var prescricaoPayload = new
            {
                animalId = animalVivoId,
                medicacaoId = 1,
                volumeDose = "1ml",
                viaAdministracao = 1,
                quantidadeDoses = 1,
                intervaloEntreDosesHoras = 0,
                dataHoraInicio = DateTime.UtcNow,
                responsavel = "Dr. Veterinario"
            };
            var prescricaoResp = await _client.PostAsJsonAsync("/api/PrescricaoMedicacao", prescricaoPayload);
            var prescricaoResult = await prescricaoResp.Content.ReadFromJsonAsync<PrescricaoTestResponse>();
            Assert.NotNull(prescricaoResult);
            Assert.True(prescricaoResult!.Success);

            // 2. Agora atualizar esse animal para Ã“bito
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
                var animal = await context.Animals.FindAsync(animalVivoId);
                animal!.SituacaoAnimal = Situacao.Obito;
                await context.SaveChangesAsync();
            }

            // 3. Tentar registrar nova dose para a prescriÃ§Ã£o cujo animal agora Ã© Ã“bito
            var adminPayload = new
            {
                prescricaoMedicacaoId = prescricaoResult.Id,
                dataHoraPrevista = DateTime.UtcNow,
                responsavel = "Enfermeiro",
                statusDose = 1,
                dataHoraAdministracao = DateTime.UtcNow
            };
            var adminResp = await _client.PostAsJsonAsync("/api/MedicacaoAdministrada", adminPayload);
            var adminResult = await adminResp.Content.ReadFromJsonAsync<BaseResponse>();

            Assert.NotNull(adminResult);
            Assert.False(adminResult!.Success);
            Assert.Contains(adminResult.ValidationErrors ?? new List<string>(), e => e.Contains("Ã“bito") || e.Contains("Reintroduzido") || e.Contains("situaÃ§Ã£o"));
        }

        [Fact]
        public async Task Operacoes_AnimalVivo_Sucesso()
        {
            var (animalVivoId, _, _) = await SeedBaseDataAsync();

            // 1. AlimentaÃ§Ã£o com animal vivo
            var alimPayload = new
            {
                animalId = animalVivoId,
                dataAlimentacao = DateTime.Now,
                pesoRecomendado = 30m,
                refeicoes = new[]
                {
                    new { tipoRefeicao = 1, pesoRefeicao = 30m, situacaoRefeicao = 1 }
                }
            };
            var alimResp = await _client.PostAsJsonAsync("/api/Alimentacao", alimPayload);
            var alimResult = await alimResp.Content.ReadFromJsonAsync<BaseResponse>();
            Assert.NotNull(alimResult);
            Assert.True(alimResult!.Success);

            // 2. Biometria com animal vivo
            var bioPayload = new
            {
                animalId = animalVivoId,
                peso = 180m,
                comprimento = 22m,
                dataBiometria = DateTime.UtcNow
            };
            var bioResp = await _client.PostAsJsonAsync("/api/BiometriaAnimal", bioPayload);
            var bioResult = await bioResp.Content.ReadFromJsonAsync<BaseResponse>();
            Assert.NotNull(bioResult);
            Assert.True(bioResult!.Success);

            // 3. PrescriÃ§Ã£o com animal vivo
            var prescPayload = new
            {
                animalId = animalVivoId,
                medicacaoId = 1,
                volumeDose = "2ml",
                viaAdministracao = 1,
                quantidadeDoses = 1,
                intervaloEntreDosesHoras = 0,
                dataHoraInicio = DateTime.UtcNow,
                responsavel = "Dr. Veterinario"
            };
            var prescResp = await _client.PostAsJsonAsync("/api/PrescricaoMedicacao", prescPayload);
            var prescResult = await prescResp.Content.ReadFromJsonAsync<PrescricaoTestResponse>();
            Assert.NotNull(prescResult);
            Assert.True(prescResult!.Success);
        }
    }

    public class PrescricaoTestResponse : BaseResponse
    {
        public int Id { get; set; }
    }
}
