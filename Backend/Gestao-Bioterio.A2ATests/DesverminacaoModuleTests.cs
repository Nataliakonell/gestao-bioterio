using Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.CreateDoseAplicacaoDesverminacao;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.CreateProtocoloDesverminacao;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetAllProtocolosDesverminacao;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoDetail;
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
public class DesverminacaoModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public DesverminacaoModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioDesverminacaoTestDb"));

                services.AddHttpClient("UcdbAuth")
                    .ConfigurePrimaryHttpMessageHandler(() => new MockAuthHandler());
            });
        });
        _client = _factory.CreateClient();
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "gestao-bioterio-admin");
    }

    private async Task SeedBaseDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();

        if (context.Animals.Any()) return;

        var grupo = new Grupo { Id = 1, Nome = "Repteis" };
        context.Groups.Add(grupo);

        var especie = new Especie { Id = 1, Nome = "Bothrops moojeni", NomePopular = "Jararaca-da-mata", GrupoId = 1 };
        context.Especies.Add(especie);

        var instalacao = new InstalacaoBioterio { Id = 1, Nome = "Sala Serpentário" };
        context.InstalacoesBioterio.Add(instalacao);

        var localOrigem = new LocalOrigem { Id = 1, Nome = "Biotério Central" };
        context.LocalOrigens.Add(localOrigem);

        await context.SaveChangesAsync();

        var animal1 = new Animal
        {
            Id = 1,
            NumeroRegistro = "BOT-001",
            NomePopular = "Jararaca 1",
            EspecieId = 1,
            Genero = Genero.Femea,
            FaseDeVida = Gestao_Bioterio.Domain.Entities.FaseDeVida.Adulto,
            DataDeEntrada = DateTime.Now.AddMonths(-6),
            InstalacaoBioterioId = 1,
            SituacaoAnimal = Situacao.Vivo,
            LocalOrigemId = 1
        };

        var animal2 = new Animal
        {
            Id = 2,
            NumeroRegistro = "BOT-002",
            NomePopular = "Jararaca 2",
            EspecieId = 1,
            Genero = Genero.Macho,
            FaseDeVida = Gestao_Bioterio.Domain.Entities.FaseDeVida.Adulto,
            DataDeEntrada = DateTime.Now.AddMonths(-12),
            InstalacaoBioterioId = 1,
            SituacaoAnimal = Situacao.Vivo,
            LocalOrigemId = 1
        };

        context.Animals.AddRange(animal1, animal2);
        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        await SeedBaseDataAsync();

        var response = await _client.GetAsync("/api/ProtocoloDesverminacao");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var list = await response.Content.ReadFromJsonAsync<List<ProtocoloDesverminacaoListVm>>();
        Assert.NotNull(list);
    }

    [Fact]
    public async Task CreateProtocolo_ValidData_ReturnsOk()
    {
        await SeedBaseDataAsync();

        var command = new CreateProtocoloDesverminacaoCommand
        {
            AnimalId = 1,
            DataEntrada = DateTime.Now.AddDays(-60),
            TemHistoricoDoses = false
        };

        var response = await _client.PostAsJsonAsync("/api/ProtocoloDesverminacao", command);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CreateProtocoloDesverminacaoResponse>();
        Assert.NotNull(result);
        Assert.True(result!.Success);
        Assert.True(result.Id > 0);
    }

    [Fact]
    public async Task CreateDoseAnual_UpdatesStatusToManutencaoAnual()
    {
        await SeedBaseDataAsync();

        // 1. Criar protocolo para animal 2
        var createProtoRes = await _client.PostAsJsonAsync("/api/ProtocoloDesverminacao", new CreateProtocoloDesverminacaoCommand
        {
            AnimalId = 2,
            DataEntrada = new DateTime(2025, 8, 28),
            TemHistoricoDoses = true
        });
        Assert.Equal(HttpStatusCode.OK, createProtoRes.StatusCode);
        var protoResult = await createProtoRes.Content.ReadFromJsonAsync<CreateProtocoloDesverminacaoResponse>();
        Assert.NotNull(protoResult);
        var protocoloId = protoResult!.Id;

        // 2. Aplicar Dose Anual com data 28/08/2025
        var doseCommand = new CreateDoseAplicacaoDesverminacaoCommand
        {
            ProtocoloDesverminacaoId = protocoloId,
            TipoDose = TipoDose.Anual,
            DataPrevista = new DateTime(2025, 8, 28),
            DataAplicacao = new DateTime(2025, 8, 28),
            StatusDoseDesverminacao = StatusDoseDesverminacao.Aplicada,
            Observacao = "Dose anual prévia"
        };

        var doseRes = await _client.PostAsJsonAsync("/api/DoseAplicacaoDesverminacao", doseCommand);
        Assert.Equal(HttpStatusCode.OK, doseRes.StatusCode);

        // 3. Buscar detalhe do protocolo e verificar status = ManutencaoAnual
        var getRes = await _client.GetAsync($"/api/ProtocoloDesverminacao/{protocoloId}");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);

        var detail = await getRes.Content.ReadFromJsonAsync<ProtocoloDesverminacaoDetailVm>();
        Assert.NotNull(detail);
        Assert.Equal("ManutencaoAnual", detail!.StatusProtocolo);
        Assert.True(detail.CicloInicialConcluido);
    }

    [Fact]
    public async Task GetById_NotFound_ReturnsError()
    {
        var response = await _client.GetAsync("/api/ProtocoloDesverminacao/9999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
