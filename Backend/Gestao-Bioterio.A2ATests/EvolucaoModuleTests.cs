using Gestao_Bioterio.Application.Features.Evolucoes.Command.CreateEvolucao;
using Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetEvolucaoDetail;
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
public class EvolucaoModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public EvolucaoModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioEvolucaoTestDb"));

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

    private async Task<int> CreateEvolucaoAsync()
    {
        await SeedBaseDataAsync();
        var payload = new
        {
            animalId = 1,
            descricao = "Animal apresentou melhora do quadro clínico.",
            dataHoraRegistro = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            responsavel = "Dr. Teste"
        };
        var response = await _client.PostAsJsonAsync("/api/Evolucao", payload);
        var created = await response.Content.ReadFromJsonAsync<CreateEvolucaoResponse>();
        return created!.Id;
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        await SeedBaseDataAsync();
        var response = await _client.GetAsync("/api/Evolucao");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Create_ValidData_ReturnsOk()
    {
        var id = await CreateEvolucaoAsync();
        Assert.True(id > 0);
    }

    [Fact]
    public async Task Create_WithoutDescricao_ReturnsError()
    {
        await SeedBaseDataAsync();
        var response = await _client.PostAsJsonAsync("/api/Evolucao", new
        {
            animalId = 1,
            descricao = "",
            dataHoraRegistro = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            responsavel = "Dr. Teste"
        });
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("descrição", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAndGet_ReturnsCorrectData()
    {
        var id = await CreateEvolucaoAsync();

        var getResponse = await _client.GetAsync($"/api/Evolucao/{id}");
        var result = await getResponse.Content.ReadFromJsonAsync<EvolucaoDetailVm>();

        Assert.NotNull(result);
        Assert.Equal(1, result!.AnimalId);
        Assert.Equal("Animal apresentou melhora do quadro clínico.", result.Descricao);
        Assert.Equal("Dr. Teste", result.Responsavel);
    }

    [Fact]
    public async Task GetById_NotFound_ReturnsError()
    {
        var response = await _client.GetAsync("/api/Evolucao/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_ValidData_UpdatesCorrectly()
    {
        var id = await CreateEvolucaoAsync();

        var updateResponse = await _client.PutAsJsonAsync("/api/Evolucao", new
        {
            id,
            animalId = 1,
            descricao = "Presença de secreção nasal, iniciou suporte.",
            dataHoraRegistro = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            responsavel = "Dra. Ana Silva"
        });
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/Evolucao/{id}");
        var result = await getResponse.Content.ReadFromJsonAsync<EvolucaoDetailVm>();
        Assert.Equal("Dra. Ana Silva", result!.Responsavel);
        Assert.Equal("Presença de secreção nasal, iniciou suporte.", result.Descricao);
    }

    [Fact]
    public async Task Delete_Existing_ReturnsNoContent()
    {
        var id = await CreateEvolucaoAsync();

        var deleteResponse = await _client.DeleteAsync($"/api/Evolucao/{id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task Delete_NotFound_ReturnsError()
    {
        var response = await _client.DeleteAsync("/api/Evolucao/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}