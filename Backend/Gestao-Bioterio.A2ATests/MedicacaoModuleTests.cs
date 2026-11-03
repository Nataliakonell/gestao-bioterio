using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Application.Features.Medicacoes.Command.CreateMedicacao;
using Gestao_Bioterio.Application.Features.Medicacoes.Queries.GetAllMedicacoes;
using Gestao_Bioterio.Application.Features.Medicacoes.Queries.GetMedicacaoLookup;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Gestao_Bioterio.A2ATests;

[Collection("SequentialA2A")]
public class MedicacaoModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public MedicacaoModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioTestDb"));

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

        if (await context.Medicacoes.AnyAsync()) return;

        context.Medicacoes.AddRange(
            new Medicacao { PrincipioAtivo = "Dipirona Test", NomeComercial = "Novalgina Test", Ativo = true },
            new Medicacao { PrincipioAtivo = "Meloxicam Test", NomeComercial = "Metacam Test", Ativo = true }
        );

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        await SeedBaseDataAsync();

        var response = await _client.GetAsync("/api/Medicacao");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var medicacoes = await response.Content.ReadFromJsonAsync<List<MedicacaoListVm>>();
        Assert.NotNull(medicacoes);
        Assert.True(medicacoes.Count >= 2);
    }

    [Fact]
    public async Task GetLookup_ReturnsOk()
    {
        await SeedBaseDataAsync();

        var response = await _client.GetAsync("/api/Medicacao/lookup");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var lookup = await response.Content.ReadFromJsonAsync<List<MedicacaoLookupVm>>();
        Assert.NotNull(lookup);
        Assert.True(lookup.Count >= 2);
    }

    [Fact]
    public async Task Create_ValidData_ReturnsOk()
    {
        await SeedBaseDataAsync();

        var command = new CreateMedicacaoCommand
        {
            PrincipioAtivo = "Ibuprofeno Test",
            NomeComercial = "Advil Test"
        };

        var response = await _client.PostAsJsonAsync("/api/Medicacao", command);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<CreateMedicacaoResponse>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.True(result.Id > 0);
        Assert.Equal("Ibuprofeno Test", result.Medicacao.PrincipioAtivo);
        Assert.Equal("Advil Test", result.Medicacao.NomeComercial);
    }

    [Fact]
    public async Task Create_DuplicateData_ReturnsError()
    {
        await SeedBaseDataAsync();

        var command = new CreateMedicacaoCommand
        {
            PrincipioAtivo = "dipirona test", // case-insensitive check
            NomeComercial = "novalgina test"
        };

        var response = await _client.PostAsJsonAsync("/api/Medicacao", command);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<CreateMedicacaoResponse>();
        Assert.NotNull(result);
        Assert.False(result.Success);
        Assert.NotNull(result.ValidationErrors);
        Assert.NotEmpty(result.ValidationErrors);
    }

    [Fact]
    public async Task Create_MissingFields_ReturnsError()
    {
        await SeedBaseDataAsync();

        var command = new CreateMedicacaoCommand
        {
            PrincipioAtivo = "",
            NomeComercial = ""
        };

        var response = await _client.PostAsJsonAsync("/api/Medicacao", command);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<CreateMedicacaoResponse>();
        Assert.NotNull(result);
        Assert.False(result.Success);
        Assert.NotNull(result.ValidationErrors);
        Assert.NotEmpty(result.ValidationErrors);
    }
}
