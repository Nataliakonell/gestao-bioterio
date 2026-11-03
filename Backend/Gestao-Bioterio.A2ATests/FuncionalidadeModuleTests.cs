using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Application.Features.Funcionalidade.Command.CreateFuncionalidade;
using Gestao_Bioterio.Application.Features.Funcionalidade.Command.UpdateFuncionalidade;
using Gestao_Bioterio.Application.Features.Funcionalidades.Queries.GetAllFuncionalidade;
using Gestao_Bioterio.Application.Features.Funcionalidades.Queries.GetFuncionalidadeDetail;
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
    public class FuncionalidadeModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public FuncionalidadeModuleTests(WebApplicationFactory<Program> factory)
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
            if (context.Funcionalidades.Any(f => f.Id == 888)) return;

            context.Funcionalidades.Add(new Funcionalidade
            {
                Id = 888,
                Nome = "Funcionalidade Teste Base",
                Descricao = "Descricao Teste Base"
            });
            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/Funcionalidade");
            response.EnsureSuccessStatusCode();

            var list = await response.Content.ReadFromJsonAsync<List<FuncionalidadeListVm>>();
            Assert.NotNull(list);
            Assert.NotEmpty(list);
        }

        [Fact]
        public async Task GetById_ReturnsOk()
        {
            var createCmd = new CreateFuncionalidadeCommand
            {
                Nome = "Funcionalidade Para GetById",
                Descricao = "Descricao GetById"
            };
            var createResponse = await _client.PostAsJsonAsync("/api/Funcionalidade", createCmd);
            createResponse.EnsureSuccessStatusCode();
            var created = await createResponse.Content.ReadFromJsonAsync<CreateFuncionalidadeResponse>();
            Assert.NotNull(created);

            var response = await _client.GetAsync($"/api/Funcionalidade/{created.Id}");
            response.EnsureSuccessStatusCode();

            var detail = await response.Content.ReadFromJsonAsync<FuncionalidadeDetailVm>();
            Assert.NotNull(detail);
            Assert.Equal("Funcionalidade Para GetById", detail.Nome);
        }

        [Fact]
        public async Task Create_ValidData_ReturnsOk()
        {
            var command = new CreateFuncionalidadeCommand
            {
                Nome = "Nova Funcionalidade A2A",
                Descricao = "Descricao da nova funcionalidade A2A"
            };

            var response = await _client.PostAsJsonAsync("/api/Funcionalidade", command);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<CreateFuncionalidadeResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.True(result.Id > 0);
        }

        [Fact]
        public async Task Create_InvalidData_ReturnsError()
        {
            var command = new CreateFuncionalidadeCommand
            {
                Nome = "", // Vazio deve falhar na validação
                Descricao = "Descricao sem nome"
            };

            var response = await _client.PostAsJsonAsync("/api/Funcionalidade", command);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<CreateFuncionalidadeResponse>();
            Assert.NotNull(result);
            Assert.False(result.Success);
            Assert.NotEmpty(result.ValidationErrors);
        }

        [Fact]
        public async Task Update_ValidData_UpdatesCorrectly()
        {
            var createCmd = new CreateFuncionalidadeCommand
            {
                Nome = "Funcionalidade Para Update",
                Descricao = "Descricao Antes"
            };
            var createResponse = await _client.PostAsJsonAsync("/api/Funcionalidade", createCmd);
            createResponse.EnsureSuccessStatusCode();
            var created = await createResponse.Content.ReadFromJsonAsync<CreateFuncionalidadeResponse>();
            Assert.NotNull(created);

            var command = new UpdateFuncionalidadeCommand
            {
                Id = created.Id,
                Nome = "Funcionalidade Apos Update",
                Descricao = "Descricao Atualizada"
            };

            var response = await _client.PutAsJsonAsync("/api/Funcionalidade", command);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);

            // Verificar atualização
            var getResponse = await _client.GetAsync($"/api/Funcionalidade/{created.Id}");
            getResponse.EnsureSuccessStatusCode();
            var detail = await getResponse.Content.ReadFromJsonAsync<FuncionalidadeDetailVm>();
            Assert.NotNull(detail);
            Assert.Equal("Funcionalidade Apos Update", detail.Nome);
        }

        [Fact]
        public async Task Delete_Existing_ReturnsNoContent()
        {
            var createCmd = new CreateFuncionalidadeCommand
            {
                Nome = "Para Deletar",
                Descricao = "Item a ser deletado"
            };
            var createResponse = await _client.PostAsJsonAsync("/api/Funcionalidade", createCmd);
            createResponse.EnsureSuccessStatusCode();
            var created = await createResponse.Content.ReadFromJsonAsync<CreateFuncionalidadeResponse>();
            Assert.NotNull(created);

            var deleteResponse = await _client.DeleteAsync($"/api/Funcionalidade/{created.Id}");
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        }
    }
}
