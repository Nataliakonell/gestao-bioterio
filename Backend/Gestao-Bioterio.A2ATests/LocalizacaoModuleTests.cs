using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Application.Features.Localizacoes.Command.CreateLocalizacao;
using Gestao_Bioterio.Application.Features.Localizacoes.Command.UpdateLocalizacao;
using Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetAllLocalizacao;
using Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetLocalizacaoDetail;
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
    public class LocalizacaoModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public LocalizacaoModuleTests(WebApplicationFactory<Program> factory)
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
            if (context.Localizacoes.Any(l => l.Id == 888)) return;

            context.Localizacoes.Add(new Localizacao
            {
                Id = 888,
                Nome = "Biotério Central",
                Ambiente = Ambiente.Interno,
                CaminhoHierarquia = "Biotério Central",
                CaminhoIds = "/888"
            });
            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/Localizacao");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var list = await response.Content.ReadFromJsonAsync<List<LocalizacaoListVm>>();
            Assert.NotNull(list);
            Assert.NotEmpty(list);
        }

        [Fact]
        public async Task GetById_Existing_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/Localizacao/888");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var detail = await response.Content.ReadFromJsonAsync<LocalizacaoDetailVm>();
            Assert.NotNull(detail);
            Assert.NotNull(detail.Nome);
        }

        [Fact]
        public async Task GetById_NotFound_Returns404()
        {
            var response = await _client.GetAsync("/api/Localizacao/999999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Create_ValidData_ReturnsOkAndCalculatesPath()
        {
            var command = new CreateLocalizacaoCommand
            {
                Nome = "Sala de Serpentes",
                Ambiente = Ambiente.Interno,
                LocalizacaoPaiId = 888
            };

            var response = await _client.PostAsJsonAsync("/api/Localizacao", command);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<CreateLocalizacaoResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.Contains("Sala de Serpentes", result.Localizacao.CaminhoHierarquia);
        }

        [Fact]
        public async Task Update_ValidData_UpdatesCorrectly()
        {
            var updateCommand = new UpdateLocalizacaoCommand
            {
                Id = 888,
                Nome = "Biotério Principal UCDB",
                Ambiente = Ambiente.Interno,
                LocalizacaoPaiId = null
            };

            var response = await _client.PutAsJsonAsync("/api/Localizacao", updateCommand);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
        }

        [Fact]
        public async Task Delete_Existing_ReturnsNoContent()
        {
            var createCommand = new CreateLocalizacaoCommand
            {
                Nome = "Sala Temporária Para Deletar",
                Ambiente = Ambiente.Interno
            };
            var createResponse = await _client.PostAsJsonAsync("/api/Localizacao", createCommand);
            var created = await createResponse.Content.ReadFromJsonAsync<CreateLocalizacaoResponse>();

            var deleteResponse = await _client.DeleteAsync($"/api/Localizacao/{created!.Id}");
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        }
    }
}
