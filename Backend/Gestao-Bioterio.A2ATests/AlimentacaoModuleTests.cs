using System.Net;
using System.Net.Http.Json;
using System.Net.Mime;
using System.Text;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacao;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacoes;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Gestao_Bioterio.A2ATests;

internal class MockAuthHandler : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        var path = request.RequestUri?.AbsolutePath ?? "";
        if (path.EndsWith("/validatetoken"))

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("""{"active":true}""", Encoding.UTF8, MediaTypeNames.Application.Json)
            });
        if (path.EndsWith("/userinfo"))
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("""{"preferred_username":"testuser","RF":"TEST123"}""", Encoding.UTF8, MediaTypeNames.Application.Json)
            });
        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotFound));
    }
}

[Collection("SequentialA2A")]
public class AlimentacaoModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AlimentacaoModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioAlimentacaoTestDb"));

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

        var perfilAdmin = new Perfil { Nome = "Admin", Descricao = "Admin" };
        var usuarioAdmin = new Usuario { RF = "TEST123", Nome = "Usuario Teste", Email = "teste@ucdb.br", Perfil = perfilAdmin };
        var funcionalidade = new Funcionalidade { Nome = "Alimentacao", Descricao = "Alimentação" };
        var permissao = new PerfilPermissao { Perfil = perfilAdmin, Funcionalidade = funcionalidade, NivelAcesso = NivelAcesso.Gerenciar };
        context.Perfis.Add(perfilAdmin);
        context.Usuarios.Add(usuarioAdmin);
        context.Funcionalidades.Add(funcionalidade);
        context.PerfilPermissoes.Add(permissao);

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

        var rotina = new RotinaAnimal
        {
            Id = 1,
            EspecieId = 1,
            TipoRotina = TipoRotina.Alimentacao,
            FaseDeVida = Gestao_Bioterio.Domain.Entities.FaseDeVida.Adulto,
            TipoFrequencia = TipoFrequencia.IntervaloEmDias,
            Frequencia = 1
        };
        context.RotinasAnimais.Add(rotina);

        await context.SaveChangesAsync();
    }

    private async Task<int> CreateAlimentacaoAsync(decimal pesoRefeicao = 30m, int situacaoRefeicao = 1)
    {
        await SeedBaseDataAsync();

        var now = DateTime.Now;
        var payload = new
        {
            animalId = 1,
            dataAlimentacao = now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 250.0m,
            comprimento = 20.0m,
            porcentagemPesoRecomendado = 10.0m,
            pesoRecomendado = 25.0m,
            refeicoes = new[]
            {
                new
                {
                    tipoRefeicao = 1,
                    pesoRefeicao,
                    situacaoRefeicao
                }
            }
        };

        var response = await _client.PostAsJsonAsync("/api/Alimentacao", payload);
        var created = await response.Content.ReadFromJsonAsync<CreateAlimentacaoResponse>();
        return created!.Id;
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        await SeedBaseDataAsync();
        var response = await _client.GetAsync("/api/Alimentacao");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_FilterByAnimalId_ReturnsOnlyThatAnimal()
    {
        await SeedBaseDataAsync();

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();

        if (!context.Animals.Any(a => a.Id == 100))
        {
            var animal2 = new Animal
            {
                Id = 100,
                NumeroRegistro = "FILTER-001",
                NomePopular = "Camundongo",
                EspecieId = 1,
                Genero = Genero.Macho,
                FaseDeVida = FaseDeVida.Adulto,
                DataDeEntrada = DateTime.Now.AddMonths(-2),
                InstalacaoBioterioId = 1,
                SituacaoAnimal = Situacao.Vivo,
                LocalOrigemId = 1
            };
            context.Animals.Add(animal2);
            await context.SaveChangesAsync();
        }

        var now = DateTime.Now;
        var feed2 = new Alimentacao
        {
            AnimalId = 100,
            DataAlimentacao = now,
            PesoRecomendado = 25m,
            TotalOfertado = 25m,
            TotalConsumido = 0m,
            Saldo = -25m,
            Status = Alimentacao.StatusAlimentacao.Pendente
        };
        context.Alimentacoes.Add(feed2);
        await context.SaveChangesAsync();

        var response = await _client.GetAsync("/api/Alimentacao?animalId=100&pageSize=20");
        var result = await response.Content.ReadFromJsonAsync<PaginatedAlimentacaoListVm>();

        Assert.NotNull(result);
        Assert.Single(result!.Items);
        Assert.Equal(100, result.Items[0].AnimalId);
    }

    [Fact]
    public async Task CreateAndGet_ReturnsCorrectData()
    {
        var id = await CreateAlimentacaoAsync();

        var getResponse = await _client.GetAsync($"/api/Alimentacao/{id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var result = await getResponse.Content.ReadFromJsonAsync<AlimentacaoDetailResponse>();
        Assert.NotNull(result);
        Assert.Equal(1, result!.AnimalId);
        Assert.Equal(30.0m, result.TotalOfertado);
    }

    [Fact]
    public async Task CreateAlimentacao_WithoutRefeicoes_ReturnsError()
    {
        await SeedBaseDataAsync();

        var payload = new
        {
            animalId = 1,
            dataAlimentacao = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 250.0m,
            porcentagemPesoRecomendado = 10.0m,
            pesoRecomendado = 25.0m,
            refeicoes = Array.Empty<object>()
        };

        var response = await _client.PostAsJsonAsync("/api/Alimentacao", payload);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("pelo menos uma refeição", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAlimentacao_WithInvalidAnimalId_ReturnsError()
    {
        var payload = new
        {
            animalId = 999,
            dataAlimentacao = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 250.0m,
            porcentagemPesoRecomendado = 10.0m,
            pesoRecomendado = 25.0m,
            refeicoes = new[]
            {
                new
                {
                    tipoRefeicao = 1,
                    pesoRefeicao = 30.0m,
                    situacaoRefeicao = 1
                }
            }
        };

        var response = await _client.PostAsJsonAsync("/api/Alimentacao", payload);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("não encontrado", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAndDelete_ReturnsNoContent()
    {
        var id = await CreateAlimentacaoAsync();

        var deleteResponse = await _client.DeleteAsync($"/api/Alimentacao/{id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task Status_Alimentada_WhenAllRefeicoesConfirmed()
    {
        var payload = new
        {
            animalId = 1,
            dataAlimentacao = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 250.0m,
            porcentagemPesoRecomendado = 10.0m,
            pesoRecomendado = 25.0m,
            refeicoes = new[]
            {
                new
                {
                    tipoRefeicao = 1,
                    pesoRefeicao = 30.0m,
                    situacaoRefeicao = 1
                }
            }
        };

        await SeedBaseDataAsync();
        var response = await _client.PostAsJsonAsync("/api/Alimentacao", payload);
        var created = await response.Content.ReadFromJsonAsync<CreateAlimentacaoResponse>();
        Assert.Equal(1, created!.Alimentacao!.Status);
    }

    [Fact]
    public async Task Status_Pendente_WhenAnyRefeicaoIsPendente()
    {
        var payload = new
        {
            animalId = 1,
            dataAlimentacao = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 250.0m,
            porcentagemPesoRecomendado = 10.0m,
            pesoRecomendado = 25.0m,
            refeicoes = new[]
            {
                new
                {
                    tipoRefeicao = 1,
                    pesoRefeicao = 30.0m,
                    situacaoRefeicao = 0
                }
            }
        };

        await SeedBaseDataAsync();
        var response = await _client.PostAsJsonAsync("/api/Alimentacao", payload);
        var created = await response.Content.ReadFromJsonAsync<CreateAlimentacaoResponse>();
        Assert.Equal(0, created!.Alimentacao!.Status);
    }

    [Fact]
    public async Task ViaSonda_UsesUnidadeML()
    {
        var payload = new
        {
            animalId = 1,
            dataAlimentacao = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 250.0m,
            porcentagemPesoRecomendado = 10.0m,
            pesoRecomendado = 25.0m,
            refeicoes = new[]
            {
                new
                {
                    tipoRefeicao = 11,
                    pesoRefeicao = 30.0m,
                    situacaoRefeicao = 1
                }
            }
        };

        await SeedBaseDataAsync();
        var response = await _client.PostAsJsonAsync("/api/Alimentacao", payload);
        var created = await response.Content.ReadFromJsonAsync<CreateAlimentacaoResponse>();
        Assert.Equal("ml", created!.Alimentacao!.Refeicoes!.First().UnidadeDeMedida);
    }

    [Fact]
    public async Task UpdateAlimentacao_WithRemovedRefeicao_RecalculatesTotais()
    {
        await SeedBaseDataAsync();

        var createPayload = new
        {
            animalId = 1,
            dataAlimentacao = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 250.0m,
            porcentagemPesoRecomendado = 10.0m,
            pesoRecomendado = 25.0m,
            refeicoes = new[]
            {
                new { tipoRefeicao = 1, pesoRefeicao = 30.0m, situacaoRefeicao = 1 },
                new { tipoRefeicao = 2, pesoRefeicao = 20.0m, situacaoRefeicao = 0 }
            }
        };

        var createResponse = await _client.PostAsJsonAsync("/api/Alimentacao", createPayload);
        var created = await createResponse.Content.ReadFromJsonAsync<CreateAlimentacaoResponse>();

        var refeicaoToKeep = created!.Alimentacao!.Refeicoes!.First();

        var updatePayload = new
        {
            id = created.Id,
            animalId = 1,
            dataAlimentacao = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 250.0m,
            porcentagemPesoRecomendado = 10.0m,
            pesoRecomendado = 25.0m,
            refeicoes = new[]
            {
                new
                {
                    id = refeicaoToKeep.Id,
                    tipoRefeicao = 1,
                    pesoRefeicao = 40.0m,
                    situacaoRefeicao = 1
                }
            }
        };

        var updateResponse = await _client.PutAsJsonAsync("/api/Alimentacao", updatePayload);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/Alimentacao/{created.Id}");
        var result = await getResponse.Content.ReadFromJsonAsync<AlimentacaoDetailResponse>();
        Assert.Equal(40.0m, result!.TotalOfertado);
        Assert.Single(result.Refeicoes!);
    }

    [Fact]
    public async Task UpdateAlimentacao_PreservesPesoRecomendado()
    {
        await SeedBaseDataAsync();

        var createPayload = new
        {
            animalId = 1,
            dataAlimentacao = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 250.0m,
            porcentagemPesoRecomendado = 15.0m,
            pesoRecomendado = 37.5m,
            refeicoes = new[]
            {
                new { tipoRefeicao = 1, pesoRefeicao = 40.0m, situacaoRefeicao = 1 }
            }
        };

        var createResponse = await _client.PostAsJsonAsync("/api/Alimentacao", createPayload);
        var created = await createResponse.Content.ReadFromJsonAsync<CreateAlimentacaoResponse>();
        Assert.NotNull(created);

        var getAfterCreate = await _client.GetAsync($"/api/Alimentacao/{created!.Id}");
        var afterCreate = await getAfterCreate.Content.ReadFromJsonAsync<AlimentacaoDetailResponse>();
        Assert.Equal(37.5m, afterCreate!.PesoRecomendado);

        var refeicao = afterCreate.Refeicoes!.First();
        var updatePayload = new
        {
            id = created.Id,
            animalId = 1,
            dataAlimentacao = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 260.0m,
            porcentagemPesoRecomendado = 20.0m,
            pesoRecomendado = 52.0m,
            refeicoes = new[]
            {
                new
                {
                    id = refeicao.Id,
                    tipoRefeicao = 1,
                    pesoRefeicao = 55.0m,
                    situacaoRefeicao = 1
                }
            }
        };

        var updateResponse = await _client.PutAsJsonAsync("/api/Alimentacao", updatePayload);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var getAfterUpdate = await _client.GetAsync($"/api/Alimentacao/{created.Id}");
        var afterUpdate = await getAfterUpdate.Content.ReadFromJsonAsync<AlimentacaoDetailResponse>();
        Assert.Equal(52.0m, afterUpdate!.PesoRecomendado);
        Assert.Equal(20.0m, afterUpdate.PorcentagemPesoRecomendado);
    }

    [Fact]
    public async Task CreateAlimentacao_SavesPesoRecomendado()
    {
        await SeedBaseDataAsync();

        var payload = new
        {
            animalId = 1,
            dataAlimentacao = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            peso = 250.0m,
            porcentagemPesoRecomendado = 10.0m,
            pesoRecomendado = 25.0m,
            refeicoes = new[]
            {
                new { tipoRefeicao = 1, pesoRefeicao = 30.0m, situacaoRefeicao = 1 }
            }
        };

        var response = await _client.PostAsJsonAsync("/api/Alimentacao", payload);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<CreateAlimentacaoResponse>();
        Assert.NotNull(created);
        Assert.Equal(25.0m, created!.Alimentacao!.PesoRecomendado);
        Assert.Equal(10.0m, created.Alimentacao.PorcentagemPesoRecomendado);
    }
}

public class CreateAlimentacaoResponse
{
    public int Id { get; set; }
    public AlimentacaoDetailResponse? Alimentacao { get; set; }
}

public class AlimentacaoDetailResponse
{
    public int Id { get; set; }
    public int AnimalId { get; set; }
    public int Status { get; set; }
    public decimal PesoRecomendado { get; set; }
    public decimal PorcentagemPesoRecomendado { get; set; }
    public decimal TotalOfertado { get; set; }
    public decimal TotalConsumido { get; set; }
    public decimal Saldo { get; set; }
    public List<RefeicaoResponse>? Refeicoes { get; set; }
}

public class RefeicaoResponse
{
    public int Id { get; set; }
    public int AlimentacaoId { get; set; }
    public int TipoRefeicao { get; set; }
    public decimal PesoRefeicao { get; set; }
    public string? UnidadeDeMedida { get; set; }
    public int SituacaoRefeicao { get; set; }
}
