using Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.CreateAltaAmbulatorial;
using Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.UpdateAltaAmbulatorial;
using Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAltaAmbulatorial;
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
public class AltaAmbulatoriaModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AltaAmbulatoriaModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioAltaAmbulatoriaTestDb"));

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
        var instalacao2 = new InstalacaoBioterio { Id = 2, Nome = "Sala 2 - Retorno" };
        context.InstalacoesBioterio.Add(instalacao2);

        var localOrigem = new LocalOrigem { Id = 1, Nome = "Biotério Central" };
        context.LocalOrigens.Add(localOrigem);

        await context.SaveChangesAsync();

        var animal1 = new Animal
        {
            Id = 1,
            NumeroRegistro = "RAT-001",
            NomePopular = "Rato Wistar 1",
            EspecieId = 1,
            Genero = Genero.Macho,
            FaseDeVida = Gestao_Bioterio.Domain.Entities.FaseDeVida.Adulto,
            DataDeEntrada = DateTime.Now.AddMonths(-3),
            InstalacaoBioterioId = 1,
            SituacaoAnimal = Situacao.Vivo,
            LocalOrigemId = 1
        };
        var animal2 = new Animal
        {
            Id = 2,
            NumeroRegistro = "RAT-002",
            NomePopular = "Rato Wistar 2",
            EspecieId = 1,
            Genero = Genero.Femea,
            FaseDeVida = Gestao_Bioterio.Domain.Entities.FaseDeVida.Adulto,
            DataDeEntrada = DateTime.Now.AddMonths(-3),
            InstalacaoBioterioId = 1,
            SituacaoAnimal = Situacao.Vivo,
            LocalOrigemId = 1
        };
        context.Animals.AddRange(animal1, animal2);

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task Create_ValidData_ReturnsOk()
    {
        await SeedBaseDataAsync();

        var response = await _client.PostAsJsonAsync("/api/AltaAmbulatoria", new CreateAltaAmbulatoriaCommand
        {
            AnimalId = 1,
            DataEntradaAmbulatorio = DateTime.Now.AddDays(-5),
            DataAltaClinica = DateTime.Now,
            ObservacoesClinicas = "Sem observações",
            InstalacaoBioterioRetornoId = 2
        });

        var content = await response.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CreateAltaAmbulatoriaResponse>();
        Assert.NotNull(result);
        Assert.True(result!.Success);
        Assert.True(result.Id > 0);
    }

    [Fact]
    public async Task GetByAnimalId_Existing_ReturnsOk()
    {
        await SeedBaseDataAsync();

        var createRes = await _client.PostAsJsonAsync("/api/AltaAmbulatoria", new CreateAltaAmbulatoriaCommand
        {
            AnimalId = 2,
            DataAltaClinica = DateTime.Now,
            ObservacoesClinicas = "Alta ok"
        });
        Assert.Equal(HttpStatusCode.OK, createRes.StatusCode);

        var getRes = await _client.GetAsync("/api/AltaAmbulatoria/animal/2");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);

        var result = await getRes.Content.ReadFromJsonAsync<AltaAmbulatoriaDetailVm>();
        Assert.NotNull(result);
        Assert.Equal(2, result!.AnimalId);
        Assert.Equal("Alta ok", result.ObservacoesClinicas);
    }

    [Fact]
    public async Task CreateMultiple_And_GetAll_ReturnsAllAltas()
    {
        await SeedBaseDataAsync();

        // 1ª Alta
        var res1 = await _client.PostAsJsonAsync("/api/AltaAmbulatoria", new CreateAltaAmbulatoriaCommand
        {
            AnimalId = 1,
            DataEntradaAmbulatorio = DateTime.Now.AddDays(-10),
            DataAltaClinica = DateTime.Now.AddDays(-8),
            ObservacoesClinicas = "Primeira alta",
            InstalacaoBioterioRetornoId = 2
        });
        Assert.Equal(HttpStatusCode.OK, res1.StatusCode);
        var created1 = await res1.Content.ReadFromJsonAsync<CreateAltaAmbulatoriaResponse>();
        Assert.NotNull(created1);

        // 2ª Alta para o mesmo animal
        var res2 = await _client.PostAsJsonAsync("/api/AltaAmbulatoria", new CreateAltaAmbulatoriaCommand
        {
            AnimalId = 1,
            DataEntradaAmbulatorio = DateTime.Now.AddDays(-3),
            DataAltaClinica = DateTime.Now,
            ObservacoesClinicas = "Segunda alta",
            InstalacaoBioterioRetornoId = 1
        });
        Assert.Equal(HttpStatusCode.OK, res2.StatusCode);
        var created2 = await res2.Content.ReadFromJsonAsync<CreateAltaAmbulatoriaResponse>();
        Assert.NotNull(created2);

        // GetAll por animalId
        var listRes = await _client.GetAsync("/api/AltaAmbulatoria?animalId=1");
        Assert.Equal(HttpStatusCode.OK, listRes.StatusCode);
        var list = await listRes.Content.ReadFromJsonAsync<List<Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAllAltasAmbulatoriais.AltaAmbulatoriaListVm>>();
        Assert.NotNull(list);
        Assert.True(list!.Count >= 2);

        // GetById
        var getByIdRes = await _client.GetAsync($"/api/AltaAmbulatoria/{created1!.Id}");
        Assert.Equal(HttpStatusCode.OK, getByIdRes.StatusCode);
        var detail1 = await getByIdRes.Content.ReadFromJsonAsync<AltaAmbulatoriaDetailVm>();
        Assert.NotNull(detail1);
        Assert.Equal(created1.Id, detail1!.Id);
        Assert.Equal("Primeira alta", detail1.ObservacoesClinicas);
    }
}
