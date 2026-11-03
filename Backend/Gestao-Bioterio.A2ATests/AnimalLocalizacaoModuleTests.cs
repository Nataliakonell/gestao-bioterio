using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.CreateAnimalLocalizacao;
using Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.UpdateAnimalLocalizacao;
using Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAllAnimalLocalizacao;
using Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAnimalLocalizacaoDetail;
using Gestao_Bioterio.Application.Responses;
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
    public class AnimalLocalizacaoModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public AnimalLocalizacaoModuleTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
                builder.UseSetting("UcdbAuthentication:ClientId", "test-client");
                builder.ConfigureServices(services =>
                {
                    services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                    services.AddDbContext<BioterioDbContext>(options =>
                        options.UseInMemoryDatabase("GestaoBioterioTestDb"));

                    services.AddHttpClient("UcdbAuth")
                        .ConfigurePrimaryHttpMessageHandler(() => new MockAuthHandler());
                });
            });

            _client = _factory.CreateClient();
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "test-token");

            SeedDataAsync().Wait();
        }

        private async Task SeedDataAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            if (context.Animals.Any(a => a.Id == 771)) return;

            context.Localizacoes.Add(new Localizacao
            {
                Id = 770,
                Nome = "Quarentena Central",
                Ambiente = Ambiente.Interno,
                CaminhoHierarquia = "Quarentena Central",
                CaminhoIds = "/770"
            });

            context.Animals.Add(new Animal
            {
                Id = 771,
                NumeroRegistro = "ANM-771",
                NomePopular = "Jiboia Teste",
                Genero = Genero.Macho,
                FaseDeVida = FaseDeVida.Adulto,
                DataDeEntrada = DateTime.UtcNow,
                SituacaoAnimal = Situacao.Vivo
            });

            context.Animals.Add(new Animal
            {
                Id = 772,
                NumeroRegistro = "ANM-772",
                NomePopular = "Cascavel Teste",
                Genero = Genero.Femea,
                FaseDeVida = FaseDeVida.Adulto,
                DataDeEntrada = DateTime.UtcNow,
                SituacaoAnimal = Situacao.Vivo
            });

            context.AnimalLocalizacoes.Add(new AnimalLocalizacao
            {
                Id = 773,
                AnimalId = 771,
                LocalizacaoId = 770
            });

            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/AnimalLocalizacao");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var list = await response.Content.ReadFromJsonAsync<List<AnimalLocalizacaoListVm>>();
            Assert.NotNull(list);
            Assert.NotEmpty(list);
        }

        [Fact]
        public async Task GetById_Existing_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/AnimalLocalizacao/773");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var detail = await response.Content.ReadFromJsonAsync<AnimalLocalizacaoDetailVm>();
            Assert.NotNull(detail);
            Assert.Equal(771, detail.AnimalId);
            Assert.Equal(770, detail.LocalizacaoId);
        }

        [Fact]
        public async Task Create_ValidData_ReturnsOk()
        {
            var command = new CreateAnimalLocalizacaoCommand
            {
                AnimalId = 772,
                LocalizacaoId = 770
            };

            var response = await _client.PostAsJsonAsync("/api/AnimalLocalizacao", command);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<CreateAnimalLocalizacaoResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.Equal(772, result.AnimalLocalizacao.AnimalId);
        }

        [Fact]
        public async Task Update_ValidData_ReturnsOk()
        {
            var command = new UpdateAnimalLocalizacaoCommand
            {
                Id = 773,
                AnimalId = 771,
                LocalizacaoId = 770
            };

            var response = await _client.PutAsJsonAsync("/api/AnimalLocalizacao", command);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
        }

        [Fact]
        public async Task Delete_Existing_ReturnsNoContent()
        {
            // Cria um vínculo novo para exclusão segura
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            var tempAnimal = new Animal
            {
                NumeroRegistro = "ANM-TEMP-DEL",
                NomePopular = "Animal Temporário",
                DataDeEntrada = DateTime.UtcNow
            };
            context.Animals.Add(tempAnimal);
            await context.SaveChangesAsync();

            var tempVinculo = new AnimalLocalizacao
            {
                AnimalId = tempAnimal.Id,
                LocalizacaoId = 770
            };
            context.AnimalLocalizacoes.Add(tempVinculo);
            await context.SaveChangesAsync();

            var deleteResponse = await _client.DeleteAsync($"/api/AnimalLocalizacao/{tempVinculo.Id}");
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        }
    }
}
