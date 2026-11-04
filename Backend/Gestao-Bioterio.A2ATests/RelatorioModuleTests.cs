using System.Net;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Gestao_Bioterio.A2ATests;

[Collection("SequentialA2A")]
public class RelatorioModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public RelatorioModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioRelatoriosTestDb"));

                services.AddHttpClient("UcdbAuth")
                    .ConfigurePrimaryHttpMessageHandler(() => new MockAuthHandler());
            });
        });

        _client = _factory.CreateClient();
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "gestao-bioterio-admin");
    }

    private async Task SeedDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();

        if (context.Animals.Any()) return;

        var grupo = new Grupo { Id = 1, Nome = "Roedores" };
        context.Groups.Add(grupo);

        var especie = new Especie { Id = 1, Nome = "Rattus norvegicus", NomePopular = "Rato Wistar", GrupoId = 1 };
        context.Especies.Add(especie);

        var localizacao = new Localizacao { Id = 1, Nome = "Sala 101 - Roedores", Ambiente = Ambiente.Interno };
        context.Localizacoes.Add(localizacao);

        var localOrigem = new LocalOrigem { Id = 1, Nome = "Biotério Central" };
        context.LocalOrigens.Add(localOrigem);

        var animal = new Animal
        {
            Id = 1,
            NumeroRegistro = "RAT-TEST-001",
            NomePopular = "Rato Wistar 01",
            EspecieId = 1,
            Genero = Genero.Macho,
            FaseDeVida = FaseDeVida.Adulto,
            DataDeEntrada = DateTime.Now.AddDays(-10),
            SituacaoAnimal = Situacao.Vivo,
            Sisfauna = true,
            NumeroChip = "982000123456789",
            TermoDeDoacao = true,
            LocalOrigemId = 1,
            InstalacaoBioterioId = 1
        };
        context.Animals.Add(animal);

        var animalLoc = new AnimalLocalizacao
        {
            AnimalId = 1,
            LocalizacaoId = 1,
            DataCriacao = DateTime.Now
        };
        context.AnimalLocalizacoes.Add(animalLoc);

        var alimentacao = new Alimentacao
        {
            Id = 1,
            AnimalId = 1,
            DataAlimentacao = DateTime.Now.AddDays(-2),
            TotalOfertado = 50,
            TotalConsumido = 50,
            Saldo = 0,
            Status = Alimentacao.StatusAlimentacao.Alimentada
        };
        context.Alimentacoes.Add(alimentacao);

        var consulta = new Consulta
        {
            Id = 1,
            AnimalId = 1,
            DataHoraConsulta = DateTime.Now.AddDays(-1),
            Anamnese = "Checkup de rotina",
            SuspeitaDiagnostica = "Saudável",
            Responsavel = "Dr. Veterinário Teste"
        };
        context.Consultas.Add(consulta);

        var evento = new Evento
        {
            Id = 1,
            Nome = "Aula Prática de Fisiologia",
            TipoEvento = TipoEvento.Interno,
            Status = Status.Agendado,
            DataHoraInicio = DateTime.Now.AddDays(1),
            DataHoraPrevisaoRetorno = DateTime.Now.AddDays(1).AddHours(2),
            Responsavel = "Prof. Silva"
        };
        context.Eventos.Add(evento);

        var eventoAnimal = new EventoAnimal
        {
            EventoId = 1,
            AnimalId = 1
        };
        context.EventosAnimais.Add(eventoAnimal);

        var movimentacao = new MovimentacaoAnimal
        {
            Id = 1,
            AnimalId = 1,
            LocalizacaoId = 1,
            TipoMovimentacao = TipoMovimentacao.Transferencia,
            RF = "TEST123"
        };
        context.MovimentacoesAnimais.Add(movimentacao);

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task ExportPlantel_Excel_ReturnsOk()
    {
        await SeedDataAsync();

        var response = await _client.GetAsync("/api/Relatorios/plantel?formato=Excel");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", response.Content.Headers.ContentType?.MediaType);
        var bytes = await response.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length > 0);
    }

    [Fact]
    public async Task ExportPlantel_Pdf_ReturnsOk()
    {
        await SeedDataAsync();

        var response = await _client.GetAsync("/api/Relatorios/plantel?formato=Pdf");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/pdf", response.Content.Headers.ContentType?.MediaType);
        var bytes = await response.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length > 0);
    }

    [Fact]
    public async Task ExportAlimentacao_Excel_ReturnsOk()
    {
        await SeedDataAsync();

        var response = await _client.GetAsync("/api/Relatorios/alimentacao?formato=Excel");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var bytes = await response.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length > 0);
    }

    [Fact]
    public async Task ExportClinico_Pdf_ReturnsOk()
    {
        await SeedDataAsync();

        var response = await _client.GetAsync("/api/Relatorios/clinico?formato=Pdf");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/pdf", response.Content.Headers.ContentType?.MediaType);
        var bytes = await response.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length > 0);
    }

    [Fact]
    public async Task ExportInstalacoes_WithValidLocation_ReturnsOk()
    {
        await SeedDataAsync();

        var response = await _client.GetAsync("/api/Relatorios/instalacoes?localizacaoId=1&formato=Excel");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var bytes = await response.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length > 0);
    }

    [Fact]
    public async Task ExportInstalacoes_WithoutLocation_ReturnsBadRequest()
    {
        await SeedDataAsync();

        var response = await _client.GetAsync("/api/Relatorios/instalacoes?localizacaoId=0&formato=Excel");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ExportEventos_Pdf_ReturnsOk()
    {
        await SeedDataAsync();

        var response = await _client.GetAsync("/api/Relatorios/eventos?formato=Pdf");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var bytes = await response.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length > 0);
    }

    [Fact]
    public async Task ExportMovimentacoes_Excel_ReturnsOk()
    {
        await SeedDataAsync();

        var response = await _client.GetAsync("/api/Relatorios/movimentacoes?formato=Excel");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var bytes = await response.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length > 0);
    }

    [Fact]
    public async Task ExportSisfauna_ReturnsOk()
    {
        await SeedDataAsync();

        var response = await _client.GetAsync("/api/Relatorios/sisfauna?formato=Excel");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var bytes = await response.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length > 0);
    }
}
