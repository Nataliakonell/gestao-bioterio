using Gestao_Bioterio.Application.Features.Anexos.Command.CreateAnexo;
using Gestao_Bioterio.Application.Features.Anexos.Queries.GetAllAnexos;
using Gestao_Bioterio.Application.Features.Anexos.Queries.GetAnexoDetail;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net;
using System.Net.Http.Json;

namespace Gestao_Bioterio.A2ATests;

[Collection("SequentialA2A")]
public class AnexoModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AnexoModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioAnexoTestDb"));

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

    private async Task<int> CreateAnexoAsync()
    {
        await SeedBaseDataAsync();
        var content = new MultipartFormDataContent();
        content.Add(new StringContent("1"), "AnimalId");
        content.Add(new StringContent("raio-x-torax-001.pdf"), "NomeArquivoAnexo");
        content.Add(new StringContent("Radiografia de tórax"), "Descricao");

        var response = await _client.PostAsync("/api/Anexo", content);
        var created = await response.Content.ReadFromJsonAsync<CreateAnexoResponse>();
        return created!.Id;
    }

    private async Task AddAnimal2Async()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
        if (context.Animals.Any(a => a.Id == 100)) return;

        var animal2 = new Animal
        {
            Id = 100,
            NumeroRegistro = "MUS-100",
            NomePopular = "Camundongo",
            EspecieId = 1,
            Genero = Genero.Femea,
            FaseDeVida = Gestao_Bioterio.Domain.Entities.FaseDeVida.Jovem,
            DataDeEntrada = DateTime.Now.AddMonths(-2),
            InstalacaoBioterioId = 1,
            SituacaoAnimal = Situacao.Vivo,
            LocalOrigemId = 1
        };
        context.Animals.Add(animal2);
        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        await SeedBaseDataAsync();
        var response = await _client.GetAsync("/api/Anexo");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_FilterByAnimalId_Filters()
    {
        await SeedBaseDataAsync();
        await AddAnimal2Async();

        var content1 = new MultipartFormDataContent();
        content1.Add(new StringContent("1"), "AnimalId");
        content1.Add(new StringContent("anexo-001.pdf"), "NomeArquivoAnexo");
        content1.Add(new StringContent("Anexo do animal 1"), "Descricao");
        await _client.PostAsync("/api/Anexo", content1);

        var content2 = new MultipartFormDataContent();
        content2.Add(new StringContent("100"), "AnimalId");
        content2.Add(new StringContent("anexo-100.pdf"), "NomeArquivoAnexo");
        content2.Add(new StringContent("Anexo do animal 100"), "Descricao");
        await _client.PostAsync("/api/Anexo", content2);

        var response = await _client.GetAsync("/api/Anexo?animalId=100");
        var result = await response.Content.ReadFromJsonAsync<List<AnexoListVm>>();

        Assert.NotNull(result);
        Assert.Single(result!);
        Assert.Equal(100, result[0].AnimalId);
        Assert.Equal("anexo-100.pdf", result[0].NomeArquivoAnexo);
    }

    [Fact]
    public async Task Create_ValidData_ReturnsOk()
    {
        var id = await CreateAnexoAsync();
        Assert.True(id > 0);
    }

    [Fact]
    public async Task CreateAndGet_ReturnsCorrectData()
    {
        var id = await CreateAnexoAsync();

        var getResponse = await _client.GetAsync($"/api/Anexo/{id}");
        var result = await getResponse.Content.ReadFromJsonAsync<AnexoDetailVm>();

        Assert.NotNull(result);
        Assert.Equal(1, result!.AnimalId);
        Assert.Equal("raio-x-torax-001.pdf", result.NomeArquivoAnexo);
        Assert.Equal("Radiografia de tórax", result.Descricao);
    }

    [Fact]
    public async Task GetById_NotFound_ReturnsError()
    {
        var response = await _client.GetAsync("/api/Anexo/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_ValidData_UpdatesCorrectly()
    {
        var id = await CreateAnexoAsync();

        var updateResponse = await _client.PutAsJsonAsync("/api/Anexo", new
        {
            id,
            animalId = 1,
            nomeArquivoAnexo = "laudo-final.pdf",
            descricao = "Laudo final do exame"
        });
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/Anexo/{id}");
        var result = await getResponse.Content.ReadFromJsonAsync<AnexoDetailVm>();
        Assert.Equal("laudo-final.pdf", result!.NomeArquivoAnexo);
    }

    [Fact]
    public async Task Delete_Existing_ReturnsNoContent()
    {
        var id = await CreateAnexoAsync();

        var deleteResponse = await _client.DeleteAsync($"/api/Anexo/{id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task Delete_NotFound_ReturnsError()
    {
        var response = await _client.DeleteAsync("/api/Anexo/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}