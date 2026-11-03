using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Application.Features.Consultas.Queries.GetVisaoGeralClinica;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xunit;

namespace Gestao_Bioterio.A2ATests
{
    [Collection("SequentialA2A")]
    public class VisaoGeralClinicaModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public VisaoGeralClinicaModuleTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
                builder.UseSetting("UcdbAuthentication:ClientId", "test-client");
                builder.ConfigureServices(services =>
                {
                    services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                    services.AddDbContext<BioterioDbContext>(options =>
                        options.UseInMemoryDatabase("GestaoBioterioVisaoGeralClinicaTestDb"));
                    services.AddHttpClient("UcdbAuth")
                        .ConfigurePrimaryHttpMessageHandler(() => new MockAuthHandler());
                });
            });
            _client = _factory.CreateClient();
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "test-token");
        }

        private async Task SeedDataAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();

            if (await context.Animals.AnyAsync()) return;

            var grupo = new Grupo { Id = 1, Nome = "Roedores" };
            context.Groups.Add(grupo);

            var especie = new Especie { Id = 1, Nome = "Rattus norvegicus", NomePopular = "Rato", GrupoId = 1 };
            context.Especies.Add(especie);

            var instalacao = new InstalacaoBioterio { Id = 1, Nome = "Biotério Central Sala 1" };
            context.InstalacoesBioterio.Add(instalacao);

            var localOrigem = new LocalOrigem { Id = 1, Nome = "Origem Central" };
            context.LocalOrigens.Add(localOrigem);

            await context.SaveChangesAsync();

            var animal1 = new Animal
            {
                Id = 1,
                NumeroRegistro = "RAT-VG-001",
                NomePopular = "Rato Alpha",
                EspecieId = 1,
                InstalacaoBioterioId = 1,
                Genero = Genero.Macho,
                FaseDeVida = FaseDeVida.Adulto,
                DataDeEntrada = DateTime.UtcNow,
                SituacaoAnimal = Situacao.Vivo,
                LocalOrigemId = 1
            };

            var animal2 = new Animal
            {
                Id = 2,
                NumeroRegistro = "RAT-VG-002",
                NomePopular = "Rato Beta",
                EspecieId = 1,
                InstalacaoBioterioId = 1,
                Genero = Genero.Femea,
                FaseDeVida = FaseDeVida.Jovem,
                DataDeEntrada = DateTime.UtcNow,
                SituacaoAnimal = Situacao.Vivo,
                LocalOrigemId = 1
            };

            var animal3 = new Animal
            {
                Id = 3,
                NumeroRegistro = "RAT-VG-003",
                NomePopular = "Rato Gamma Sem Atendimento",
                EspecieId = 1,
                InstalacaoBioterioId = 1,
                Genero = Genero.Macho,
                FaseDeVida = FaseDeVida.Adulto,
                DataDeEntrada = DateTime.UtcNow,
                SituacaoAnimal = Situacao.Vivo,
                LocalOrigemId = 1
            };

            context.Animals.AddRange(animal1, animal2, animal3);
            await context.SaveChangesAsync();

            // Animal 1 tem consulta mais antiga
            context.Consultas.Add(new Consulta
            {
                AnimalId = animal1.Id,
                Anamnese = "Animal com claudicação leve",
                SuspeitaDiagnostica = "Trauma leve",
                DataHoraConsulta = DateTime.UtcNow.AddDays(-2),
                Responsavel = "Dr. Silva"
            });

            // Animal 2 tem atendimento mais recente
            context.Consultas.Add(new Consulta
            {
                AnimalId = animal2.Id,
                Anamnese = "Check-up de rotina",
                SuspeitaDiagnostica = "Sadio",
                DataHoraConsulta = DateTime.UtcNow.AddHours(-1),
                Responsavel = "Dra. Santos"
            });

            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task GetVisaoGeral_ReturnsOk_WithOrderedItemsAndHighlight()
        {
            await SeedDataAsync();

            var response = await _client.GetAsync("/api/Consulta/visao-geral");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<VisaoGeralClinicaResponse>();

            Assert.NotNull(result);
            Assert.True(result.TotalCount >= 2);
            Assert.NotNull(result.DestaqueUltimoAtendimentoGeral);
            
            // O destaque geral deve ser o Animal 2 (RAT-VG-002) pois seu atendimento foi há 1 hora
            Assert.Equal("RAT-VG-002", result.DestaqueUltimoAtendimentoGeral.NumeroRegistro);
            Assert.Equal("Consulta", result.DestaqueUltimoAtendimentoGeral.UltimoAtendimento?.Tipo);

            // Animal sem atendimento (RAT-VG-003) não deve aparecer na listagem clínica
            Assert.DoesNotContain(result.Items, x => x.NumeroRegistro == "RAT-VG-003");
        }

        [Fact]
        public async Task GetVisaoGeral_FilterBySearch_FiltersCorrectly()
        {
            await SeedDataAsync();

            var response = await _client.GetAsync("/api/Consulta/visao-geral?search=RAT-VG-001");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<VisaoGeralClinicaResponse>();

            Assert.NotNull(result);
            Assert.Single(result.Items);
            Assert.Equal("RAT-VG-001", result.Items[0].NumeroRegistro);
        }

        [Fact]
        public async Task GetVisaoGeral_Pagination_WorksCorrectly()
        {
            await SeedDataAsync();

            var response = await _client.GetAsync("/api/Consulta/visao-geral?page=1&pageSize=1");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<VisaoGeralClinicaResponse>();

            Assert.NotNull(result);
            Assert.Single(result.Items);
            Assert.True(result.TotalCount >= 2);
        }
    }
}
