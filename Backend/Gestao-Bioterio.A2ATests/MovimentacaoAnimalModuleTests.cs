using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.CreateMovimentacaoAnimal;
using Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.UpdateMovimentacaoAnimal;
using Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetAllMovimentacaoAnimal;
using Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetMovimentacaoAnimalDetail;
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
    public class MovimentacaoAnimalModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public MovimentacaoAnimalModuleTests(WebApplicationFactory<Program> factory)
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
            if (context.Animals.Any(a => a.Id == 661)) return;

            context.Localizacoes.Add(new Localizacao
            {
                Id = 660,
                Nome = "Ambulatório Central",
                Ambiente = Ambiente.Interno,
                CaminhoHierarquia = "Ambulatório Central",
                CaminhoIds = "/660"
            });

            context.Animals.Add(new Animal
            {
                Id = 661,
                NumeroRegistro = "ANM-661",
                NomePopular = "Lagarto Teiú",
                DataDeEntrada = DateTime.UtcNow
            });

            context.MovimentacoesAnimais.Add(new MovimentacaoAnimal
            {
                Id = 662,
                AnimalId = 661,
                LocalizacaoId = 660,
                TipoMovimentacao = TipoMovimentacao.Transferencia
            });

            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/MovimentacaoAnimal?animalId=661");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var list = await response.Content.ReadFromJsonAsync<List<MovimentacaoAnimalListVm>>();
            Assert.NotNull(list);
            Assert.NotEmpty(list);
        }

        [Fact]
        public async Task GetById_Existing_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/MovimentacaoAnimal/662");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var detail = await response.Content.ReadFromJsonAsync<MovimentacaoAnimalDetailVm>();
            Assert.NotNull(detail);
            Assert.Equal(661, detail.AnimalId);
            Assert.Equal(660, detail.LocalizacaoId);
        }

        [Fact]
        public async Task Create_ValidData_ReturnsOkAndUpdatesCurrentLocation()
        {
            var command = new CreateMovimentacaoAnimalCommand
            {
                AnimalId = 661,
                LocalizacaoId = 660,
                TipoMovimentacao = TipoMovimentacao.AtendimentoClinico
            };

            var response = await _client.PostAsJsonAsync("/api/MovimentacaoAnimal", command);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<CreateMovimentacaoAnimalResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.Equal(661, result.MovimentacaoAnimal.AnimalId);

            // Verifica se a localização atual do animal foi sincronizada
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            var animalLoc = await context.AnimalLocalizacoes.FirstOrDefaultAsync(x => x.AnimalId == 661);
            Assert.NotNull(animalLoc);
            Assert.Equal(660, animalLoc.LocalizacaoId);
        }

        [Fact]
        public async Task Update_ValidData_ReturnsOk()
        {
            var command = new UpdateMovimentacaoAnimalCommand
            {
                Id = 662,
                AnimalId = 661,
                LocalizacaoId = 660,
                TipoMovimentacao = TipoMovimentacao.Transferencia
            };

            var response = await _client.PutAsJsonAsync("/api/MovimentacaoAnimal", command);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
        }

        [Fact]
        public async Task Delete_Existing_ReturnsNoContent()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            var tempMov = new MovimentacaoAnimal
            {
                AnimalId = 661,
                LocalizacaoId = 660,
                TipoMovimentacao = TipoMovimentacao.Transferencia
            };
            context.MovimentacoesAnimais.Add(tempMov);
            await context.SaveChangesAsync();

            var deleteResponse = await _client.DeleteAsync($"/api/MovimentacaoAnimal/{tempMov.Id}");
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        }
    }
}
