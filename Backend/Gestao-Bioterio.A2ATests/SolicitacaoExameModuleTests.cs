using Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.CreateSolicitacaoExame;
using Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetSolicitacaoExameDetail;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Gestao_Bioterio.A2ATests;

[Collection("SequentialA2A")]
public class SolicitacaoExameModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public SolicitacaoExameModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioSolicitacaoExameTestDb"));

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
            NumeroRegistro = "RAT-001",
            NomePopular = "Rato Wistar",
            EspecieId = 1,
            Genero = Genero.Macho,
            FaseDeVida = Gestao_Bioterio.Domain.Entities.FaseDeVida.Adulto,
            DataDeEntrada = DateTime.Now.AddMonths(-3),
            InstalacaoBioterioId = 1,
            SituacaoAnimal = Situacao.Vivo,
            LocalOrigemId = 1
        };
        context.Animals.Add(animal);

        await context.SaveChangesAsync();
    }

    private async Task<int> CreateSolicitacaoAsync(int tipoExame = 1)
    {
        await SeedBaseDataAsync();
        var payload = new
        {
            animalId = 1,
            tipoExame,
            sinaisClinicos = "Letargia e perda de peso.",
            suspeitaClinica = "Anemia",
            regiaoAnatomica = "Sangue",
            observacao = "Jejum de 12h."
        };
        var response = await _client.PostAsJsonAsync("/api/SolicitacaoExame", payload);
        var created = await response.Content.ReadFromJsonAsync<CreateSolicitacaoExameResponse>();
        return created!.Id;
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        await SeedBaseDataAsync();
        var response = await _client.GetAsync("/api/SolicitacaoExame");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Create_ValidData_ReturnsOk()
    {
        var id = await CreateSolicitacaoAsync();
        Assert.True(id > 0);
    }

    [Fact]
    public async Task Create_InvalidTipoExame_ReturnsError()
    {
        await SeedBaseDataAsync();
        var response = await _client.PostAsJsonAsync("/api/SolicitacaoExame", new
        {
            animalId = 1,
            tipoExame = 99,
            regiaoAnatomica = "Sangue"
        });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Tipo de exame inválido", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Create_MissingRegiaoAnatomica_ReturnsError()
    {
        await SeedBaseDataAsync();
        var response = await _client.PostAsJsonAsync("/api/SolicitacaoExame", new
        {
            animalId = 1,
            tipoExame = 1,
            regiaoAnatomica = ""
        });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Região anatômica é obrigatória", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAndGet_ReturnsCorrectData()
    {
        var id = await CreateSolicitacaoAsync();

        var getResponse = await _client.GetAsync($"/api/SolicitacaoExame/{id}");
        var result = await getResponse.Content.ReadFromJsonAsync<SolicitacaoExameDetailVm>();

        Assert.NotNull(result);
        Assert.Equal(1, result!.AnimalId);
        Assert.Equal("HemogramaCompleto", result.TipoExame);
        Assert.Equal("Anemia", result.SuspeitaClinica);
    }

    [Fact]
    public async Task GetById_NotFound_ReturnsError()
    {
        var response = await _client.GetAsync("/api/SolicitacaoExame/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_ValidData_UpdatesCorrectly()
    {
        var id = await CreateSolicitacaoAsync();

        var updateResponse = await _client.PutAsJsonAsync("/api/SolicitacaoExame", new
        {
            id,
            animalId = 1,
            tipoExame = 2,
            sinaisClinicos = "Mucosas pálidas.",
            suspeitaClinica = "Síndrome anêmica",
            regiaoAnatomica = "Abdome",
            observacao = "Realizar com sedação."
        });
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/SolicitacaoExame/{id}");
        var result = await getResponse.Content.ReadFromJsonAsync<SolicitacaoExameDetailVm>();
        Assert.Equal("Ultrassonografia", result!.TipoExame);
        Assert.Equal("Síndrome anêmica", result.SuspeitaClinica);
    }

    [Fact]
    public async Task Delete_Existing_ReturnsNoContent()
    {
        var id = await CreateSolicitacaoAsync();

        var deleteResponse = await _client.DeleteAsync($"/api/SolicitacaoExame/{id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task Delete_NotFound_ReturnsError()
    {
        var response = await _client.DeleteAsync("/api/SolicitacaoExame/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}