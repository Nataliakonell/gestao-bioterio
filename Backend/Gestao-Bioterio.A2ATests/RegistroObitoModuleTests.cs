using Gestao_Bioterio.Application.Features.RegistrosObito.Command.CreateRegistroObito;
using Gestao_Bioterio.Application.Features.RegistrosObito.Command.UpdateRegistroObito;
using Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetAllRegistrosObito;
using Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetRegistroObitoDetail;
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
    public class RegistroObitoModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public RegistroObitoModuleTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
                builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

                builder.ConfigureServices(services =>
                {
                    services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                    services.AddDbContext<BioterioDbContext>(options =>
                        options.UseInMemoryDatabase("GestaoBioterioRegistroObitoTestDb"));

                    services.AddHttpClient("UcdbAuth")
                        .ConfigurePrimaryHttpMessageHandler(() => new MockAuthHandler());
                });
            });
            _client = _factory.CreateClient();
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "test-token");
        }

        private async Task<int> SeedAnimalAsync(string numeroRegistro = "RAT-TEST-01", Situacao situacao = Situacao.Vivo)
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();

            if (!context.Groups.Any(g => g.Id == 1))
            {
                context.Groups.Add(new Grupo { Id = 1, Nome = "Roedores" });
            }

            if (!context.Especies.Any(e => e.Id == 1))
            {
                context.Especies.Add(new Especie { Id = 1, Nome = "Rattus norvegicus", NomePopular = "Rato Wistar", GrupoId = 1 });
            }

            if (!context.InstalacoesBioterio.Any(i => i.Id == 1))
            {
                context.InstalacoesBioterio.Add(new InstalacaoBioterio { Id = 1, Nome = "Biotério Sala A" });
            }

            var animal = new Animal
            {
                NumeroRegistro = numeroRegistro,
                NomePopular = "Rato Wistar",
                EspecieId = 1,
                InstalacaoBioterioId = 1,
                Genero = Genero.Macho,
                FaseDeVida = FaseDeVida.Adulto,
                DataDeEntrada = DateTime.UtcNow.AddMonths(-2),
                SituacaoAnimal = situacao,
                Municipio = "Campo Grande",
                NumeroChip = Guid.NewGuid().ToString().Substring(0, 8)
            };

            context.Animals.Add(animal);
            await context.SaveChangesAsync();
            return animal.Id;
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/RegistroObito");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task Create_ValidData_ReturnsOk_And_UpdatesAnimalStatusToObito()
        {
            var animalId = await SeedAnimalAsync($"RAT-OBITO-{Guid.NewGuid().ToString()[..6]}", Situacao.Vivo);

            var command = new CreateRegistroObitoCommand
            {
                AnimalId = animalId,
                DataObito = DateTime.UtcNow,
                HouveNecropsia = true,
                Observacoes = "Necropsia realizada para fins de estudo."
            };

            var response = await _client.PostAsJsonAsync("/api/RegistroObito", command);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<CreateRegistroObitoResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.True(result.Id > 0);
            Assert.NotNull(result.RegistroObito);
            Assert.True(result.RegistroObito.HouveNecropsia);

            // Verifica se a situação do animal foi atualizada para Obito
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            var animalAtualizado = await context.Animals.FindAsync(animalId);
            Assert.NotNull(animalAtualizado);
            Assert.Equal(Situacao.Obito, animalAtualizado.SituacaoAnimal);
        }

        [Fact]
        public async Task Create_AnimalAlreadyObito_ReturnsBadRequest()
        {
            var animalId = await SeedAnimalAsync($"RAT-ALREADY-OBITO-{Guid.NewGuid().ToString()[..6]}", Situacao.Obito);

            var command = new CreateRegistroObitoCommand
            {
                AnimalId = animalId,
                DataObito = DateTime.UtcNow,
                HouveNecropsia = false,
                Observacoes = "Tentativa duplicada"
            };

            var response = await _client.PostAsJsonAsync("/api/RegistroObito", command);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Create_NonExistentAnimal_ReturnsBadRequest()
        {
            var command = new CreateRegistroObitoCommand
            {
                AnimalId = 999999,
                DataObito = DateTime.UtcNow,
                HouveNecropsia = false
            };

            var response = await _client.PostAsJsonAsync("/api/RegistroObito", command);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task GetById_ReturnsCorrectRecord()
        {
            var animalId = await SeedAnimalAsync($"RAT-GETBYID-{Guid.NewGuid().ToString()[..6]}", Situacao.Vivo);

            var command = new CreateRegistroObitoCommand
            {
                AnimalId = animalId,
                DataObito = DateTime.UtcNow,
                HouveNecropsia = false,
                Observacoes = "Teste de busca por id"
            };

            var postResponse = await _client.PostAsJsonAsync("/api/RegistroObito", command);
            var postResult = await postResponse.Content.ReadFromJsonAsync<CreateRegistroObitoResponse>();
            Assert.NotNull(postResult);

            var getResponse = await _client.GetAsync($"/api/RegistroObito/{postResult.Id}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

            var detail = await getResponse.Content.ReadFromJsonAsync<RegistroObitoDetailVm>();
            Assert.NotNull(detail);
            Assert.Equal(postResult.Id, detail.Id);
            Assert.Equal(animalId, detail.AnimalId);
            Assert.False(detail.HouveNecropsia);
        }

        [Fact]
        public async Task GetByAnimalId_ReturnsCorrectRecord()
        {
            var animalId = await SeedAnimalAsync($"RAT-BYANIMAL-{Guid.NewGuid().ToString()[..6]}", Situacao.Vivo);

            var command = new CreateRegistroObitoCommand
            {
                AnimalId = animalId,
                DataObito = DateTime.UtcNow,
                HouveNecropsia = true,
                Observacoes = "Consulta por AnimalId"
            };

            await _client.PostAsJsonAsync("/api/RegistroObito", command);

            var response = await _client.GetAsync($"/api/RegistroObito/animal/{animalId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var detail = await response.Content.ReadFromJsonAsync<RegistroObitoDetailVm>();
            Assert.NotNull(detail);
            Assert.Equal(animalId, detail.AnimalId);
            Assert.True(detail.HouveNecropsia);
        }

        [Fact]
        public async Task Update_ValidData_UpdatesRecord()
        {
            var animalId = await SeedAnimalAsync($"RAT-UPDATE-{Guid.NewGuid().ToString()[..6]}", Situacao.Vivo);

            var postResponse = await _client.PostAsJsonAsync("/api/RegistroObito", new CreateRegistroObitoCommand
            {
                AnimalId = animalId,
                DataObito = DateTime.UtcNow,
                HouveNecropsia = false,
                Observacoes = "Original"
            });
            var postResult = await postResponse.Content.ReadFromJsonAsync<CreateRegistroObitoResponse>();
            Assert.NotNull(postResult);

            var updateCommand = new UpdateRegistroObitoCommand
            {
                Id = postResult.Id,
                AnimalId = animalId,
                DataObito = DateTime.UtcNow,
                HouveNecropsia = true,
                Observacoes = "Atualizado para necropsia realizada"
            };

            var putResponse = await _client.PutAsJsonAsync("/api/RegistroObito", updateCommand);
            Assert.Equal(HttpStatusCode.OK, putResponse.StatusCode);

            var getResponse = await _client.GetAsync($"/api/RegistroObito/{postResult.Id}");
            var detail = await getResponse.Content.ReadFromJsonAsync<RegistroObitoDetailVm>();
            Assert.NotNull(detail);
            Assert.True(detail.HouveNecropsia);
            Assert.Equal("Atualizado para necropsia realizada", detail.Observacoes);
        }

                [Fact]
        public async Task Delete_Existing_ReturnsNoContent_And_RevertsAnimalStatusToVivo()
        {
            var animalId = await SeedAnimalAsync($"RAT-DELETE-{Guid.NewGuid().ToString()[..6]}", Situacao.Vivo);

            var postResponse = await _client.PostAsJsonAsync("/api/RegistroObito", new CreateRegistroObitoCommand
            {
                AnimalId = animalId,
                DataObito = DateTime.UtcNow,
                HouveNecropsia = false
            });
            var postResult = await postResponse.Content.ReadFromJsonAsync<CreateRegistroObitoResponse>();
            Assert.NotNull(postResult);

            // Verifica que o animal ficou como Obito
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
                var animalObito = await context.Animals.FindAsync(animalId);
                Assert.NotNull(animalObito);
                Assert.Equal(Situacao.Obito, animalObito.SituacaoAnimal);
            }

            var deleteResponse = await _client.DeleteAsync($"/api/RegistroObito/{postResult.Id}");
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

            var getResponse = await _client.GetAsync($"/api/RegistroObito/{postResult.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);

            // Verifica que a situação do animal voltou para Vivo
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
                var animalRevertido = await context.Animals.FindAsync(animalId);
                Assert.NotNull(animalRevertido);
                Assert.Equal(Situacao.Vivo, animalRevertido.SituacaoAnimal);
            }
        }
    }
}