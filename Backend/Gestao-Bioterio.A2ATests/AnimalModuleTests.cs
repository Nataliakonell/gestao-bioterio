using System.Net;
using System.Net.Http.Json;
using System.Net.Mime;
using System.Text;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Gestao_Bioterio.A2ATests;

internal class AnimalMockAuthHandler : HttpMessageHandler
{
    private readonly string _rf;

    public AnimalMockAuthHandler(string rf)
    {
        _rf = rf;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        var path = request.RequestUri?.AbsolutePath ?? "";
        if (path.EndsWith("/validatetoken"))
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("""{"active":true}""", Encoding.UTF8, MediaTypeNames.Application.Json)
            });
        if (path.EndsWith("/userinfo"))
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent($$"""{"preferred_username":"{{_rf}}","RF":"{{_rf}}"}""", Encoding.UTF8, MediaTypeNames.Application.Json)
            });
        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotFound));
    }
}

[Collection("SequentialA2A")]
public class AnimalModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AnimalModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioAnimalTestDb"));
            });
        });
    }

    private HttpClient CreateClientWithRf(string rf)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", $"mock-token-{rf}");
        return client;
    }

    private async Task SeedBaseDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
        
        // Assegurar que os dados existem no banco in-memory
        if (context.Funcionalidades.Any(f => f.Nome == "Animal")) return;

        var funcionalidade = new Funcionalidade { Nome = "Animal", Descricao = "Módulo de Plantel" };
        context.Funcionalidades.Add(funcionalidade);

        var perfilLeitor = new Perfil { Nome = "Leitor", Descricao = "Apenas leitura" };
        var perfilEditor = new Perfil { Nome = "Editor", Descricao = "Pode editar" };
        var perfilGerente = new Perfil { Nome = "Gerente", Descricao = "Pode gerenciar" };
        context.Perfis.AddRange(perfilLeitor, perfilEditor, perfilGerente);

        context.PerfilPermissoes.AddRange(
            new PerfilPermissao { Perfil = perfilLeitor, Funcionalidade = funcionalidade, NivelAcesso = NivelAcesso.Visualizar },
            new PerfilPermissao { Perfil = perfilEditor, Funcionalidade = funcionalidade, NivelAcesso = NivelAcesso.Editar },
            new PerfilPermissao { Perfil = perfilGerente, Funcionalidade = funcionalidade, NivelAcesso = NivelAcesso.Gerenciar }
        );

        var usuarioLeitor = new Usuario { RF = "LEITOR_RF", Nome = "Usuario Leitor", Email = "leitor@ucdb.br", Perfil = perfilLeitor };
        var usuarioEditor = new Usuario { RF = "EDITOR_RF", Nome = "Usuario Editor", Email = "editor@ucdb.br", Perfil = perfilEditor };
        var usuarioGerente = new Usuario { RF = "GERENTE_RF", Nome = "Usuario Gerente", Email = "gerente@ucdb.br", Perfil = perfilGerente };
        context.Usuarios.AddRange(usuarioLeitor, usuarioEditor, usuarioGerente);

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAnimal_WithVisualizarPermission_ReturnsOk()
    {
        var client = CreateClientWithRf("LEITOR_RF");
        await SeedBaseDataAsync();

        var response = await client.GetAsync("/api/Animal");
        
        // O usuário leitor tem permissão NivelAcesso.Visualizar (2) que é igual ao exigido pelo GET (2)
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task PostAnimal_WithVisualizarPermission_ReturnsForbidden()
    {
        var client = CreateClientWithRf("LEITOR_RF");
        await SeedBaseDataAsync();

        // O usuário leitor tenta fazer um POST (que exige NivelAcesso.Gerenciar = 4)
        var response = await client.PostAsync("/api/Animal", new StringContent(""));
        
        // Deve ser bloqueado pela validação de permissão!
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task PutAnimal_WithEditarPermission_DoesNotReturnForbidden()
    {
        var client = CreateClientWithRf("EDITOR_RF");
        await SeedBaseDataAsync();

        // O usuário editor tenta fazer um PUT (que exige NivelAcesso.Editar = 3)
        var response = await client.PutAsync("/api/Animal", new StringContent(""));
        
        // Como o payload está vazio, deve dar erro de validação (400 ou 415), MAS NÃO Forbidden (403).
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task PostAnimal_WithGerenciarPermission_DoesNotReturnForbidden()
    {
        var client = CreateClientWithRf("GERENTE_RF");
        await SeedBaseDataAsync();

        // O usuário gerente tenta fazer um POST (que exige NivelAcesso.Gerenciar = 4)
        var response = await client.PostAsync("/api/Animal", new StringContent(""));
        
        // Como o payload está vazio, deve dar erro de validação (400 ou 415), MAS NÃO Forbidden (403).
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Animal_ComLocalizacao_VinculaAnimalLocalizacaoEResolveNome()
    {
        var client = CreateClientWithRf("GERENTE_RF");
        await SeedBaseDataAsync();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();

            var grupo = new Grupo { Nome = "Roedores Teste" };
            context.Groups.Add(grupo);
            await context.SaveChangesAsync();

            var especie = new Especie { Nome = "Rattus norvegicus Teste", NomePopular = "Rato Wistar", GrupoId = grupo.Id };
            context.Especies.Add(especie);

            var localOrigem = new LocalOrigem { Nome = "Origem Teste" };
            context.LocalOrigens.Add(localOrigem);

            var instalacao = new InstalacaoBioterio { Nome = "Instalacao Legada Padrao" };
            context.InstalacoesBioterio.Add(instalacao);

            var loc = new Localizacao { Nome = "Sala Teste Localizacao", Ambiente = Ambiente.Interno };
            context.Localizacoes.Add(loc);
            await context.SaveChangesAsync();
        }

        int especieId, localOrigemId, locId;
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            especieId = (await context.Especies.FirstAsync(e => e.Nome == "Rattus norvegicus Teste")).Id;
            localOrigemId = (await context.LocalOrigens.FirstAsync(l => l.Nome == "Origem Teste")).Id;
            locId = (await context.Localizacoes.FirstAsync(l => l.Nome == "Sala Teste Localizacao")).Id;
        }

        var form = new MultipartFormDataContent();
        form.Add(new StringContent("LOC-999"), "NumeroRegistro");
        form.Add(new StringContent("Rato de Teste"), "NomePopular");
        form.Add(new StringContent(especieId.ToString()), "EspecieId");
        form.Add(new StringContent(locId.ToString()), "LocalizacaoId");
        form.Add(new StringContent(localOrigemId.ToString()), "LocalOrigemId");
        form.Add(new StringContent("Campo Grande"), "Municipio");
        form.Add(new StringContent("CHIP-LOC-999"), "NumeroChip");
        form.Add(new StringContent("Macho"), "Genero");
        form.Add(new StringContent("Adulto"), "FaseDeVida");
        form.Add(new StringContent("Vivo"), "SituacaoAnimal");
        form.Add(new StringContent("true"), "Sisfauna");
        form.Add(new StringContent("true"), "TermoDeDoacao");
        form.Add(new StringContent(DateTime.Now.ToString("yyyy-MM-dd")), "DataDeEntrada");
        form.Add(new StringContent("250"), "Peso");

        var response = await client.PostAsync("/api/Animal", form);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadFromJsonAsync<Gestao_Bioterio.Application.Features.Animais.Command.CreateAnimal.CreateAnimalResponse>();
        Assert.NotNull(content);
        Assert.True(content.Success, string.Join("; ", content.ValidationErrors ?? new List<string>()) + " | " + content.Message);
        Assert.True(content.Id > 0);

        // Verifica se AnimalLocalizacao foi criado
        using (var checkScope = _factory.Services.CreateScope())
        {
            var checkContext = checkScope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            var vinculo = await checkContext.AnimalLocalizacoes.FirstOrDefaultAsync(al => al.AnimalId == content.Id);
            Assert.NotNull(vinculo);
            Assert.Equal(locId, vinculo.LocalizacaoId);
        }

        // Verifica se GetById retorna a localizacao
        var detailRes = await client.GetAsync($"/api/Animal/{content.Id}");
        var body = await detailRes.Content.ReadAsStringAsync();
        if (detailRes.StatusCode != HttpStatusCode.OK)
            throw new Exception($"DEBUG FAIL: Id={content.Id}, Status={detailRes.StatusCode}, Body={body}");

        var detail = await detailRes.Content.ReadFromJsonAsync<Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail.RotinaAnimalDetailVm>();
        Assert.NotNull(detail);
        Assert.Equal("Sala Teste Localizacao", detail.InstalacaoBioterioNome);
        Assert.Equal(locId, detail.LocalizacaoId);
        Assert.Equal("Sala Teste Localizacao", detail.LocalizacaoNome);
    }
}
