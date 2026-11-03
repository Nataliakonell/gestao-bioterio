using Gestao_Bioterio.Application.Features.Procedimentos.Command.CreateProcedimento;
using Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetProcedimentoDetail;
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
public class ProcedimentoModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ProcedimentoModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioProcedimentoTestDb"));

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

    private async Task<int> CreateProcedimentoAsync()
    {
        await SeedBaseDataAsync();
        
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
        if (!context.TiposProcedimento.Any())
        {
            context.TiposProcedimento.Add(new TipoProcedimento { Id = 1, Nome = "Coleta de sangue", Ativo = true });
            await context.SaveChangesAsync();
        }

        var payload = new
        {
            animalId = 1,
            tipoProcedimentoId = 1,
            descricao = "Coleta de sangue para exames laboratoriais."
        };
        var response = await _client.PostAsJsonAsync("/api/Procedimento", payload);
        var created = await response.Content.ReadFromJsonAsync<CreateProcedimentoResponse>();
        return created!.Id;
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        await SeedBaseDataAsync();
        var response = await _client.GetAsync("/api/Procedimento");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Create_ValidData_ReturnsOk()
    {
        var id = await CreateProcedimentoAsync();
        Assert.True(id > 0);
    }

    [Fact]
    public async Task Create_MissingTipoProcedimento_ReturnsError()
    {
        await SeedBaseDataAsync();
        var response = await _client.PostAsJsonAsync("/api/Procedimento", new
        {
            animalId = 1,
            tipoProcedimentoId = 0,
            descricao = "Sem tipo."
        });
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("tipo de procedimento", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAndGet_ReturnsCorrectData()
    {
        var id = await CreateProcedimentoAsync();

        var getResponse = await _client.GetAsync($"/api/Procedimento/{id}");
        var result = await getResponse.Content.ReadFromJsonAsync<ProcedimentoDetailVm>();

        Assert.NotNull(result);
        Assert.Equal(1, result!.AnimalId);
        Assert.Equal(1, result.TipoProcedimentoId);
    }

    [Fact]
    public async Task GetById_NotFound_ReturnsError()
    {
        var response = await _client.GetAsync("/api/Procedimento/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_ValidData_UpdatesCorrectly()
    {
        var id = await CreateProcedimentoAsync();
        
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
        if (!context.TiposProcedimento.Any(t => t.Id == 2))
        {
            context.TiposProcedimento.Add(new TipoProcedimento { Id = 2, Nome = "Cirurgia", Ativo = true });
            await context.SaveChangesAsync();
        }

        var updateResponse = await _client.PutAsJsonAsync("/api/Procedimento", new
        {
            id,
            animalId = 1,
            tipoProcedimentoId = 2,
            descricao = "Procedimento cirúrgico realizado com sucesso."
        });
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/Procedimento/{id}");
        var result = await getResponse.Content.ReadFromJsonAsync<ProcedimentoDetailVm>();
        Assert.Equal(2, result!.TipoProcedimentoId);
    }

    [Fact]
    public async Task Delete_Existing_ReturnsNoContent()
    {
        var id = await CreateProcedimentoAsync();

        var deleteResponse = await _client.DeleteAsync($"/api/Procedimento/{id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task Delete_NotFound_ReturnsError()
    {
        var response = await _client.DeleteAsync("/api/Procedimento/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}