using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Application.Features.Perfis.Command.CreatePerfil;
using Gestao_Bioterio.Application.Features.Perfis.Command.UpdatePerfil;
using Gestao_Bioterio.Application.Features.Perfis.Queries.GetAllPerfil;
using Gestao_Bioterio.Application.Features.Perfis.Queries.GetPerfilDetail;
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
    public class PerfilModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public PerfilModuleTests(WebApplicationFactory<Program> factory)
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
            if (context.Perfis.Any(p => p.Id == 999)) return;

            context.Perfis.Add(new Perfil
            {
                Id = 999,
                Nome = "Perfil Existente",
                Descricao = "Descrição Existente"
            });
            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/Perfil");
            response.EnsureSuccessStatusCode();

            var perfis = await response.Content.ReadFromJsonAsync<List<PerfilListVm>>();
            Assert.NotNull(perfis);
            Assert.NotEmpty(perfis);
        }

        [Fact]
        public async Task GetById_Existing_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/Perfil/999");
            response.EnsureSuccessStatusCode();

            var perfil = await response.Content.ReadFromJsonAsync<PerfilDetailVm>();
            Assert.NotNull(perfil);
            Assert.Equal("Perfil Existente", perfil.Nome);
        }

        [Fact]
        public async Task GetById_NotFound_ReturnsNotFound()
        {
            var response = await _client.GetAsync("/api/Perfil/999999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Create_ValidData_ReturnsOk()
        {
            var cmd = new CreatePerfilCommand
            {
                Nome = "Novo Perfil",
                Descricao = "Nova Descricao"
            };

            var response = await _client.PostAsJsonAsync("/api/Perfil", cmd);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<CreatePerfilResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.True(result.Id > 0);
        }

        [Fact]
        public async Task Create_InvalidData_ReturnsOkWithValidationError()
        {
            var cmd = new CreatePerfilCommand
            {
                Nome = "",
                Descricao = ""
            };

            var response = await _client.PostAsJsonAsync("/api/Perfil", cmd);
            response.EnsureSuccessStatusCode(); 

            var result = await response.Content.ReadFromJsonAsync<CreatePerfilResponse>();
            Assert.NotNull(result);
            Assert.False(result.Success);
            Assert.NotEmpty(result.ValidationErrors);
        }

        [Fact]
        public async Task Update_ValidData_ReturnsOk()
        {
            // First, create a new Perfil specifically for updating to avoid state bleed
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            var tempPerfil = new Perfil { Id = 998, Nome = "To Update", Descricao = "To Update" };
            if (!context.Perfis.Any(p => p.Id == 998))
            {
                context.Perfis.Add(tempPerfil);
                await context.SaveChangesAsync();
            }

            var cmd = new UpdatePerfilCommand
            {
                Id = 998,
                Nome = "Perfil Atualizado",
                Descricao = "Descrição Atualizada"
            };

            var response = await _client.PutAsJsonAsync("/api/Perfil", cmd);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<Gestao_Bioterio.Application.Responses.BaseResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
        }

        [Fact]
        public async Task Delete_Existing_ReturnsNoContent()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            var tempPerfil = new Perfil { Nome = "To Delete", Descricao = "To Delete" };
            context.Perfis.Add(tempPerfil);
            await context.SaveChangesAsync();

            var response = await _client.DeleteAsync($"/api/Perfil/{tempPerfil.Id}");
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }
    }
}
