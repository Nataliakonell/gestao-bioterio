using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Application.Features.Consultas.Command.CreateConsulta;
using Gestao_Bioterio.Application.Features.Consultas.Queries.GetAllConsultas;
using Gestao_Bioterio.Application.Features.Consultas.Queries.GetConsultaDetail;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Gestao_Bioterio.Application.Responses;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xunit;

namespace Gestao_Bioterio.A2ATests
{
    [Collection("SequentialA2A")]
    public class ConsultaModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public ConsultaModuleTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
                builder.UseSetting("UcdbAuthentication:ClientId", "test-client");
                builder.ConfigureServices(services =>
                {
                    services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                    services.AddDbContext<BioterioDbContext>(options =>
                        options.UseInMemoryDatabase("GestaoBioterioConsultaTestDb"));
                    services.AddHttpClient("UcdbAuth")
                        .ConfigurePrimaryHttpMessageHandler(() => new MockAuthHandler());
                });
            });
            _client = _factory.CreateClient();
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "test-token");
        }

        private async Task SeedBaseDataAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();

            if (context.Animals.Any()) return;

            var grupo = new Grupo { Id = 1, Nome = "Roedores" };
            context.Groups.Add(grupo);

            var especie = new Especie { Id = 1, Nome = "Rattus norvegicus", NomePopular = "Rato Wistar", GrupoId = 1 };
            context.Especies.Add(especie);

            var instalacao = new InstalacaoBioterio { Id = 1, Nome = "Sala 1" };
            context.InstalacoesBioterio.Add(instalacao);

            var localOrigem = new LocalOrigem { Id = 1, Nome = "Biotério Central" };
            context.LocalOrigens.Add(localOrigem);

            await context.SaveChangesAsync();

            var animal = new Animal
            {
                Id = 1,
                NumeroRegistro = "RAT-A2A-CONSULTA-01",
                NomePopular = "Rato Wistar",
                EspecieId = 1,
                Genero = Genero.Macho,
                FaseDeVida = FaseDeVida.Adulto,
                DataDeEntrada = DateTime.Now.AddMonths(-3),
                InstalacaoBioterioId = 1,
                SituacaoAnimal = Situacao.Vivo,
                LocalOrigemId = 1
            };
            context.Animals.Add(animal);
            await context.SaveChangesAsync();
        }

        private object BuildPayload(int animalId = 1, string anamnese = "Animal apático com perda de peso.")
        {
            return new
            {
                animalId,
                anamnese,
                exameFisico = "Mucosas hipocoradas, FC normal.",
                suspeitaDiagnostica = "Desidratação leve",
                instalacaoBioterioId = 1,
                dataHoraConsulta = DateTime.Now
            };
        }

        private async Task<int> CreateConsultaAsync(int animalId = 1)
        {
            await SeedBaseDataAsync();
            var response = await _client.PostAsJsonAsync("/api/Consulta", BuildPayload(animalId: animalId));
            var created = await response.Content.ReadFromJsonAsync<CreateConsultaResponse>();
            return created!.Id;
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            await SeedBaseDataAsync();
            var response = await _client.GetAsync("/api/Consulta");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var items = await response.Content.ReadFromJsonAsync<List<ConsultaListVm>>();
            Assert.NotNull(items);
        }

        [Fact]
        public async Task Create_ValidData_ReturnsOk()
        {
            await SeedBaseDataAsync();
            var response = await _client.PostAsJsonAsync("/api/Consulta", BuildPayload());
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<CreateConsultaResponse>();
            Assert.True(result!.Success);
            Assert.True(result.Id > 0);
            Assert.NotNull(result.Consulta);
        }

        [Fact]
        public async Task Create_InvalidAnimal_ReturnsBadRequest()
        {
            await SeedBaseDataAsync();
            var response = await _client.PostAsJsonAsync("/api/Consulta", BuildPayload(animalId: 9999));
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<CreateConsultaResponse>();
            Assert.False(result!.Success);
            Assert.NotEmpty(result.ValidationErrors);
        }

        [Fact]
        public async Task GetById_Existing_ReturnsOk()
        {
            var id = await CreateConsultaAsync();
            var response = await _client.GetAsync($"/api/Consulta/{id}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var dto = await response.Content.ReadFromJsonAsync<ConsultaDetailVm>();
            Assert.NotNull(dto);
            Assert.Equal(id, dto.Id);
        }

        [Fact]
        public async Task GetById_NotFound_ReturnsNotFound()
        {
            await SeedBaseDataAsync();
            var response = await _client.GetAsync("/api/Consulta/99999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Update_ValidData_UpdatesCorrectly()
        {
            var id = await CreateConsultaAsync();
            var updatePayload = new
            {
                id,
                animalId = 1,
                anamnese = "Anamnese atualizada",
                exameFisico = "Animal ativo",
                suspeitaDiagnostica = "Recuperado",
                instalacaoBioterioId = 1,
                dataHoraConsulta = DateTime.Now
            };

            var updateResponse = await _client.PutAsJsonAsync("/api/Consulta", updatePayload);
            Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

            var getResponse = await _client.GetAsync($"/api/Consulta/{id}");
            var dto = await getResponse.Content.ReadFromJsonAsync<ConsultaDetailVm>();
            Assert.Equal("Anamnese atualizada", dto!.Anamnese);
        }

        [Fact]
        public async Task Delete_Existing_ReturnsNoContent()
        {
            var id = await CreateConsultaAsync();
            var deleteResponse = await _client.DeleteAsync($"/api/Consulta/{id}");
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

            var getResponse = await _client.GetAsync($"/api/Consulta/{id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }
    }
}
