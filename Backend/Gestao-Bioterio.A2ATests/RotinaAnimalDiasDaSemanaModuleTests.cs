using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllAnimaisRotinaStatus;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Gestao_Bioterio.Domain.Entities;
using Alimentacao = Gestao_Bioterio.Domain.Entities.Alimentacao;

namespace Gestao_Bioterio.A2ATests;

[Collection("SequentialA2A")]
public class RotinaAnimalDiasDaSemanaModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public RotinaAnimalDiasDaSemanaModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioTestDb_DiasDaSemana"));

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

        var instalacao = new InstalacaoBioterio { Id = 1, Nome = "Sala 1" };
        context.InstalacoesBioterio.Add(instalacao);

        var localOrigem = new LocalOrigem { Id = 1, Nome = "Biotério Central" };
        context.LocalOrigens.Add(localOrigem);

        await context.SaveChangesAsync();
    }

    private async Task<int> SeedAnimalComRotinaDiasDaSemanaAsync(
        int animalId,
        string registro,
        int especieId,
        TipoRotina tipoRotina,
        List<string> diasSemana,
        DateTime? ultimaAlimentacao = null,
        Alimentacao.StatusAlimentacao? statusAlimentacao = null)
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();

        var especie = new Especie { Id = especieId, Nome = $"Especie {especieId}", NomePopular = $"Popular {especieId}", GrupoId = 1 };
        context.Especies.Add(especie);

        var animal = new Animal
        {
            Id = animalId,
            NumeroRegistro = registro,
            NomePopular = $"Animal {animalId}",
            EspecieId = especieId,
            Genero = Genero.Macho,
            FaseDeVida = FaseDeVida.Adulto,
            DataDeEntrada = DateTime.Now.AddMonths(-3),
            InstalacaoBioterioId = 1,
            SituacaoAnimal = Situacao.Vivo,
            LocalOrigemId = 1
        };
        context.Animals.Add(animal);

        var rotina = new RotinaAnimal
        {
            Id = animalId,
            EspecieId = especieId,
            TipoRotina = tipoRotina,
            FaseDeVida = FaseDeVida.Adulto,
            TipoFrequencia = TipoFrequencia.DiasDaSemana,
            DiaSemanaProgramado = diasSemana
        };
        context.RotinasAnimais.Add(rotina);

        if (ultimaAlimentacao.HasValue)
        {
            if (tipoRotina == TipoRotina.Alimentacao)
            {
                var alimentacao = new Alimentacao
                {
                    Id = animalId,
                    AnimalId = animalId,
                    DataAlimentacao = ultimaAlimentacao.Value,
                    PesoRecomendado = 100,
                    TotalOfertado = 100,
                    TotalConsumido = 80,
                    Saldo = -20,
                    Status = statusAlimentacao ?? Alimentacao.StatusAlimentacao.Alimentada
                };
                context.Alimentacoes.Add(alimentacao);
            }
            else
            {
                var biometria = new BiometriaAnimal
                {
                    Id = animalId,
                    AnimalId = animalId,
                    DataBiometria = ultimaAlimentacao.Value,
                    Peso = 200
                };
                context.BiometriasAnimais.Add(biometria);
            }
        }

        await context.SaveChangesAsync();
        return animalId;
    }

    [Fact]
    public async Task GetAllStatus_DiasDaSemana_MissedDay_ReturnsNaoAlimentado()
    {
        await SeedBaseDataAsync();
        await SeedAnimalComRotinaDiasDaSemanaAsync(
            animalId: 10,
            registro: "NAS-001",
            especieId: 10,
            tipoRotina: TipoRotina.Alimentacao,
            diasSemana: new List<string> { "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" },
            ultimaAlimentacao: DateTime.Now.AddDays(-2));

        var response = await _client.GetAsync("/api/RotinaAnimal/status/all?page=1&pageSize=20");
        var result = await response.Content.ReadFromJsonAsync<PaginatedAnimalRotinaStatusVm>();

        Assert.NotNull(result);
        var animal = result!.Items.FirstOrDefault(a => a.AnimalId == 10);
        Assert.NotNull(animal);

        Assert.Equal(StatusRotina.NaoAlimentado, animal!.Alimentacao!.Status);
        Assert.Equal("Não alimentado em dia programado.", animal.Alimentacao.StatusDescricao);
    }

    [Fact]
    public async Task GetAllStatus_DiasDaSemana_SummaryHasNaoAlimentadoField()
    {
        await SeedBaseDataAsync();
        // Add one animal that is NaoAlimentado
        await SeedAnimalComRotinaDiasDaSemanaAsync(
            animalId: 11,
            registro: "NAS-002",
            especieId: 11,
            tipoRotina: TipoRotina.Alimentacao,
            diasSemana: new List<string> { "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" },
            ultimaAlimentacao: DateTime.Now.AddDays(-2));

        var response = await _client.GetAsync("/api/RotinaAnimal/status/all?page=1&pageSize=20");
        var result = await response.Content.ReadFromJsonAsync<PaginatedAnimalRotinaStatusVm>();

        Assert.NotNull(result);
        Assert.NotNull(result!.Summary);
        // In-memory DB accumulates across tests in the class
        Assert.True(result.Summary.AlimentacaoNaoAlimentado > 0);
        Assert.Equal(0, result.Summary.BiometriaNaoAlimentado);
    }

    [Fact]
    public async Task GetAllStatus_DiasDaSemana_AllDaysFed_NotNaoAlimentado()
    {
        await SeedBaseDataAsync();
        await SeedAnimalComRotinaDiasDaSemanaAsync(
            animalId: 12,
            registro: "NAS-003",
            especieId: 12,
            tipoRotina: TipoRotina.Alimentacao,
            diasSemana: new List<string> { "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" },
            ultimaAlimentacao: DateTime.Now.AddDays(-1));

        var response = await _client.GetAsync("/api/RotinaAnimal/status/all?page=1&pageSize=20");
        var result = await response.Content.ReadFromJsonAsync<PaginatedAnimalRotinaStatusVm>();

        Assert.NotNull(result);
        var animal = result!.Items.FirstOrDefault(a => a.AnimalId == 12);
        Assert.NotNull(animal);

        Assert.NotEqual(StatusRotina.NaoAlimentado, animal!.Alimentacao!.Status);
    }

    [Fact]
    public async Task GetAllStatus_DiasDaSemana_FilterByNaoAlimentado()
    {
        await SeedBaseDataAsync();
        // Animal that is NaoAlimentado
        await SeedAnimalComRotinaDiasDaSemanaAsync(
            animalId: 13,
            registro: "NAS-004",
            especieId: 13,
            tipoRotina: TipoRotina.Alimentacao,
            diasSemana: new List<string> { "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" },
            ultimaAlimentacao: DateTime.Now.AddDays(-2));

        var response = await _client.GetAsync("/api/RotinaAnimal/status/all?page=1&pageSize=20&statusAlimentacao=7");
        var result = await response.Content.ReadFromJsonAsync<PaginatedAnimalRotinaStatusVm>();

        Assert.NotNull(result);
        Assert.NotEmpty(result!.Items);
        Assert.Contains(result.Items, a => a.AnimalId == 13);
        Assert.Equal(StatusRotina.NaoAlimentado, result.Items.First(a => a.AnimalId == 13).Alimentacao!.Status);
    }

    [Fact]
    public async Task GetAllStatus_DiasDaSemana_BiometriaNaoRealizado()
    {
        await SeedBaseDataAsync();
        await SeedAnimalComRotinaDiasDaSemanaAsync(
            animalId: 14,
            registro: "NAS-005",
            especieId: 14,
            tipoRotina: TipoRotina.Biometria,
            diasSemana: new List<string> { "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" },
            ultimaAlimentacao: DateTime.Now.AddDays(-2));

        var response = await _client.GetAsync("/api/RotinaAnimal/status/all?page=1&pageSize=20");
        var result = await response.Content.ReadFromJsonAsync<PaginatedAnimalRotinaStatusVm>();

        Assert.NotNull(result);
        var animal = result!.Items.FirstOrDefault(a => a.AnimalId == 14);
        Assert.NotNull(animal);

        Assert.Equal(StatusRotina.NaoAlimentado, animal!.Biometria!.Status);
        Assert.Equal("Não alimentado em dia programado.", animal.Biometria.StatusDescricao);
        Assert.Equal(1, result.Summary.BiometriaNaoAlimentado);
    }
}
