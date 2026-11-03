using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllAnimaisRotinaStatus;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAnimalRotinaStatus;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Alimentacao = Gestao_Bioterio.Domain.Entities.Alimentacao;

namespace Gestao_Bioterio.A2ATests;

[Collection("SequentialA2A")]
public class RotinaAnimalModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public RotinaAnimalModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioRotinaAnimalTestDb"));

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

        if (context.Groups.Any()) return;

        var grupo = new Grupo { Id = 1, Nome = "Roedores" };
        context.Groups.Add(grupo);

        var especie = new Especie { Id = 1, Nome = "Rattus norvegicus", NomePopular = "Rato Wistar", GrupoId = 1 };
        context.Especies.Add(especie);

        var especie2 = new Especie { Id = 2, Nome = "Mus musculus", NomePopular = "Camundongo Swiss", GrupoId = 1 };
        context.Especies.Add(especie2);

        var instalacao = new InstalacaoBioterio { Id = 1, Nome = "Sala 1" };
        context.InstalacoesBioterio.Add(instalacao);

        var localOrigem = new LocalOrigem { Id = 1, Nome = "Biotério Central" };
        context.LocalOrigens.Add(localOrigem);

        await context.SaveChangesAsync();

        var animal1 = new Animal
        {
            Id = 1,
            NumeroRegistro = "RAT-001",
            NomePopular = "Rato Wistar",
            EspecieId = 1,
            Genero = Genero.Macho,
            FaseDeVida = FaseDeVida.Adulto,
            DataDeEntrada = DateTime.Now.AddMonths(-3),
            InstalacaoBioterioId = 1,
            SituacaoAnimal = Situacao.Vivo,
            LocalOrigemId = 1
        };
        context.Animals.Add(animal1);

        var animal2 = new Animal
        {
            Id = 2,
            NumeroRegistro = "CAM-001",
            NomePopular = "Camundongo Swiss",
            EspecieId = 2,
            Genero = Genero.Macho,
            FaseDeVida = FaseDeVida.Adulto,
            DataDeEntrada = DateTime.Now.AddMonths(-2),
            InstalacaoBioterioId = 1,
            SituacaoAnimal = Situacao.Vivo,
            LocalOrigemId = 1
        };
        context.Animals.Add(animal2);

        var rotina = new RotinaAnimal
        {
            Id = 1,
            EspecieId = 1,
            TipoRotina = TipoRotina.Alimentacao,
            FaseDeVida = FaseDeVida.Adulto,
            TipoFrequencia = TipoFrequencia.IntervaloEmDias,
            Frequencia = 1
        };
        context.RotinasAnimais.Add(rotina);

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAllStatus_ReturnsOk()
    {
        await SeedBaseDataAsync();
        var response = await _client.GetAsync("/api/RotinaAnimal/status/all?page=1&pageSize=20");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetAllStatus_ReturnsPaginatedResults()
    {
        await SeedBaseDataAsync();
        var response = await _client.GetAsync("/api/RotinaAnimal/status/all?page=1&pageSize=1");
        var result = await response.Content.ReadFromJsonAsync<PaginatedAnimalRotinaStatusVm>();

        Assert.NotNull(result);
        Assert.Single(result!.Items);
        Assert.Equal(2, result.TotalCount);
        Assert.Equal(1, result.Page);
        Assert.Equal(1, result.PageSize);
        Assert.Equal(2, result.TotalPages);
    }

    [Fact]
    public async Task GetAllStatus_WithEspecieFilter_FiltersResults()
    {
        await SeedBaseDataAsync();
        var response = await _client.GetAsync("/api/RotinaAnimal/status/all?especieId=1&pageSize=20");
        var result = await response.Content.ReadFromJsonAsync<PaginatedAnimalRotinaStatusVm>();

        Assert.NotNull(result);
        Assert.Single(result!.Items);
        Assert.Equal("RAT-001", result.Items[0].NumeroRegistro);
    }

    [Fact]
    public async Task GetAllStatus_ReturnsCorrectDataForAnimal()
    {
        await SeedBaseDataAsync();
        var response = await _client.GetAsync("/api/RotinaAnimal/status/all?pageSize=20");
        var result = await response.Content.ReadFromJsonAsync<PaginatedAnimalRotinaStatusVm>();

        Assert.NotNull(result);
        var animal1 = result!.Items.FirstOrDefault(a => a.AnimalId == 1);
        Assert.NotNull(animal1);
        Assert.Equal("RAT-001", animal1!.NumeroRegistro);
        Assert.Equal("Rato Wistar", animal1.NomeAnimal);
        Assert.Equal("Rattus norvegicus", animal1.EspecieNome);
        Assert.Equal(FaseDeVida.Adulto, animal1.FaseDeVida);

        Assert.NotNull(animal1.Alimentacao);
        Assert.True(animal1.Alimentacao!.RotinaCadastrada);
    }

    [Fact]
    public async Task GetAllStatus_ExcludesNonVivoAnimals()
    {
        await SeedBaseDataAsync();

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
        var obitoAnimal = new Animal
        {
            Id = 3,
            NumeroRegistro = "OBITO-001",
            NomePopular = "Rato Wistar",
            EspecieId = 1,
            Genero = Genero.Macho,
            FaseDeVida = FaseDeVida.Adulto,
            DataDeEntrada = DateTime.Now.AddMonths(-6),
            InstalacaoBioterioId = 1,
            SituacaoAnimal = Situacao.Obito,
            LocalOrigemId = 1
        };
        context.Animals.Add(obitoAnimal);
        await context.SaveChangesAsync();

        var response = await _client.GetAsync("/api/RotinaAnimal/status/all?pageSize=20");
        var result = await response.Content.ReadFromJsonAsync<PaginatedAnimalRotinaStatusVm>();

        Assert.NotNull(result);
        Assert.Equal(2, result!.TotalCount);
        Assert.DoesNotContain(result.Items, a => a.NumeroRegistro == "OBITO-001");
    }

    [Fact]
    public async Task GetAnimalRotinaStatus_OldEndpoint_StillWorks()
    {
        await SeedBaseDataAsync();
        var response = await _client.GetAsync("/api/RotinaAnimal/animal/1/status");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<AnimalRotinaStatusVm>();
        Assert.NotNull(result);
        Assert.Equal(1, result!.AnimalId);
        Assert.Equal("RAT-001", result.NumeroRegistro);
    }

}
