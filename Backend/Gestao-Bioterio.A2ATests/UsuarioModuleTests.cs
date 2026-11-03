using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Application.Features.Usuarios.Command.CreateUsuario;
using Gestao_Bioterio.Application.Features.Usuarios.Command.UpdateUsuario;
using Gestao_Bioterio.Application.Features.Usuarios.Queries.GetAllUsuarios;
using Gestao_Bioterio.Application.Features.Usuarios.Queries.GetMyPermissoes;
using Gestao_Bioterio.Application.Features.Usuarios.Queries.GetUsuarioLookup;
using Gestao_Bioterio.Application.Features.Usuarios.Queries.GetUsuariosDetail;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xunit;

using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Contracts.Persistence.DTOs;
using Gestao_Bioterio.Persistence.Repository;

namespace Gestao_Bioterio.A2ATests
{
    internal class TestUsuarioRepository(BioterioDbContext context) : UsuarioRepository(context, null!), IUsuarioRepository
    {
        public override Task<UsuarioExternoDto?> BuscarDadosExternosPorRfAsync(string rf)
        {
            return Task.FromResult<UsuarioExternoDto?>(new UsuarioExternoDto
            {
                Nome = "Usuário Externo Teste",
                Email = $"{rf.ToLower()}@ucdb.br"
            });
        }
    }

    [Collection("SequentialA2A")]
    public class UsuarioModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public UsuarioModuleTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
                builder.UseSetting("UcdbAuthentication:ClientId", "test-client");
                builder.ConfigureServices(services =>
                {
                    services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                    services.AddDbContext<BioterioDbContext>(options =>
                        options.UseInMemoryDatabase("GestaoBioterioUsuarioTestDb"));

                    services.AddHttpClient("UcdbAuth")
                        .ConfigurePrimaryHttpMessageHandler(() => new MockAuthHandler());

                    services.RemoveAll(typeof(IUsuarioRepository));
                    services.AddScoped<IUsuarioRepository, TestUsuarioRepository>();
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
            if (context.Usuarios.Any(u => u.RF == "RF_ATIVO")) return;

            var perfil = new Perfil
            {
                Id = 10,
                Nome = "Perfil Teste",
                Descricao = "Perfil para testes"
            };
            context.Perfis.Add(perfil);

            var func = new Funcionalidade
            {
                Id = 1,
                Nome = "Usuários",
                Descricao = "Módulo de Usuários"
            };
            context.Funcionalidades.Add(func);

            var perfilPermissao = new PerfilPermissao
            {
                PerfilId = 10,
                FuncionalidadeId = 1,
                NivelAcesso = NivelAcesso.Visualizar
            };
            context.PerfilPermissoes.Add(perfilPermissao);

            var usuarioAtivo = new Usuario
            {
                Id = 101,
                RF = "RF_ATIVO",
                Nome = "Usuário Ativo",
                Email = "ativo@ucdb.br",
                Status = true,
                PerfilId = 10
            };
            context.Usuarios.Add(usuarioAtivo);

            var usuarioInativo = new Usuario
            {
                Id = 102,
                RF = "RF_INATIVO",
                Nome = "Usuário Inativo",
                Email = "inativo@ucdb.br",
                Status = false,
                PerfilId = 10
            };
            context.Usuarios.Add(usuarioInativo);

            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/Usuario");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<PaginatedUsuarioListVm>();
            Assert.NotNull(result);
            Assert.NotNull(result.Items);
            Assert.NotEmpty(result.Items);
        }

        [Fact]
        public async Task GetById_Existing_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/Usuario/101");
            response.EnsureSuccessStatusCode();

            var user = await response.Content.ReadFromJsonAsync<UsuarioDetailVm>();
            Assert.NotNull(user);
            Assert.Equal("RF_ATIVO", user.RF);
            Assert.True(user.Status);
        }

        [Fact]
        public async Task GetById_NotFound_ReturnsNotFound()
        {
            var response = await _client.GetAsync("/api/Usuario/99999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Update_ValidData_ReturnsOk()
        {
            var cmd = new UpdateUsuarioCommand
            {
                Id = 101,
                RF = "RF_ATIVO",
                Nome = "Usuário Ativo Atualizado",
                Email = "ativo_atualizado@ucdb.br",
                Status = true,
                PerfilId = 10
            };

            var response = await _client.PutAsJsonAsync("/api/Usuario", cmd);
            response.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task Update_InativarUsuario_RevogaAcessoImediatamente()
        {
            var updateCmd = new UpdateUsuarioCommand
            {
                Id = 101,
                RF = "RF_ATIVO",
                Nome = "Usuário Ativo",
                Email = "ativo@ucdb.br",
                Status = false,
                PerfilId = 10
            };

            var updateResponse = await _client.PutAsJsonAsync("/api/Usuario", updateCmd);
            updateResponse.EnsureSuccessStatusCode();

            using var request = new HttpRequestMessage(HttpMethod.Get, "/api/Usuario");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-token-RF_ATIVO");

            var forbiddenResponse = await _client.SendAsync(request);
            Assert.Equal(HttpStatusCode.Forbidden, forbiddenResponse.StatusCode);

            // Reativar para não afetar outros testes
            updateCmd.Status = true;
            await _client.PutAsJsonAsync("/api/Usuario", updateCmd);
        }

        [Fact]
        public async Task GetMyPermissoes_UsuarioAtivo_RetornaPermissoes()
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "/api/Usuario/me/permissoes");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-token-RF_ATIVO");

            var response = await _client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<MyPermissoesVm>();
            Assert.NotNull(result);
            Assert.True(result.Status);
            Assert.NotEmpty(result.Permissoes);
            Assert.Contains(result.Permissoes, p => p.Funcionalidade == "Usuários");
        }

        [Fact]
        public async Task GetMyPermissoes_UsuarioInativo_RetornaStatusFalseESemPermissoes()
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "/api/Usuario/me/permissoes");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-token-RF_INATIVO");

            var response = await _client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<MyPermissoesVm>();
            Assert.NotNull(result);
            Assert.False(result.Status);
            Assert.False(result.IsAdmin);
            Assert.Empty(result.Permissoes);
        }

        [Fact]
        public async Task RequirePermission_UsuarioInativo_RetornaForbidden()
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "/api/Usuario");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-token-RF_INATIVO");

            var response = await _client.SendAsync(request);
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task RequirePermission_UsuarioAtivoComPermissao_RetornaOk()
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "/api/Usuario");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "mock-token-RF_ATIVO");

            var response = await _client.SendAsync(request);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetLookup_ReturnsOk_OnlyActiveUsers()
        {
            var response = await _client.GetAsync("/api/Usuario/lookup");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<List<UsuarioLookupVm>>();
            Assert.NotNull(result);
            Assert.NotEmpty(result);
            Assert.Contains(result, u => u.RF == "RF_ATIVO");
            Assert.DoesNotContain(result, u => u.RF == "RF_INATIVO");
        }

        [Fact]
        public async Task GetLookup_Unauthenticated_ReturnsUnauthorized()
        {
            var unauthenticatedClient = _factory.CreateClient();
            var response = await unauthenticatedClient.GetAsync("/api/Usuario/lookup");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
