using Gestao_Bioterio.Application.Features.ModelosDocumento.Command.CreateModeloDocumento;
using Gestao_Bioterio.Application.Features.ModelosDocumento.Command.UpdateModeloDocumento;
using Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetModeloDocumentoByType;
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
public class ModeloDocumentoModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ModeloDocumentoModuleTests(WebApplicationFactory<Program> factory)
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

    [Fact]
    public async Task Create_HeaderTemplate_ReturnsOk()
    {
        var command = new CreateModeloDocumentoCommand
        {
            Nome = "Cabeçalho Oficial UCDB",
            TipoSecao = TipoSecaoTemplate.Header,
            TipoDocumento = TipoDocumento.Geral,
            ConfiguracaoLayoutJson = "{\"esquerda\":{\"tipo\":\"texto\",\"conteudo\":\"UCDB\"},\"meio\":{\"tipo\":\"texto\",\"conteudo\":\"Biotério Central\"},\"direita\":{\"tipo\":\"texto\",\"conteudo\":\"Doc Oficial\"}}",
            Ativo = true
        };

        var response = await _client.PostAsJsonAsync("/api/ModelosDocumento", command);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CreateModeloDocumentoResponse>();
        Assert.NotNull(result);
        Assert.True(result!.Success);
        Assert.True(result.Id > 0);
    }

    [Fact]
    public async Task Create_FooterTemplate_ReturnsOk()
    {
        var command = new CreateModeloDocumentoCommand
        {
            Nome = "Rodapé Padrão",
            TipoSecao = TipoSecaoTemplate.Footer,
            TipoDocumento = TipoDocumento.Geral,
            ConfiguracaoLayoutJson = "{\"esquerda\":{\"tipo\":\"texto\",\"conteudo\":\"Pág 1\"},\"meio\":{\"tipo\":\"texto\",\"conteudo\":\"UCDB 2026\"},\"direita\":{\"tipo\":\"texto\",\"conteudo\":\"Assinatura\"}}",
            Ativo = true
        };

        var response = await _client.PostAsJsonAsync("/api/ModelosDocumento", command);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CreateModeloDocumentoResponse>();
        Assert.NotNull(result);
        Assert.True(result!.Success);
    }

    [Fact]
    public async Task Create_WithoutNome_ReturnsBadRequest()
    {
        var command = new CreateModeloDocumentoCommand
        {
            Nome = "",
            TipoSecao = TipoSecaoTemplate.Body,
            TipoDocumento = TipoDocumento.AltaAmbulatorial,
            Conteudo = "Texto qualquer",
            Ativo = true
        };

        var response = await _client.PostAsJsonAsync("/api/ModelosDocumento", command);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_BodyTemplate_WithHeaderAndFooter_ReturnsOk()
    {
        // 1. Create Header
        var headerRes = await _client.PostAsJsonAsync("/api/ModelosDocumento", new CreateModeloDocumentoCommand
        {
            Nome = "Header Para Teste " + Guid.NewGuid(),
            TipoSecao = TipoSecaoTemplate.Header,
            TipoDocumento = TipoDocumento.Geral,
            Ativo = true
        });
        var headerResult = await headerRes.Content.ReadFromJsonAsync<CreateModeloDocumentoResponse>();

        // 2. Create Footer
        var footerRes = await _client.PostAsJsonAsync("/api/ModelosDocumento", new CreateModeloDocumentoCommand
        {
            Nome = "Footer Para Teste " + Guid.NewGuid(),
            TipoSecao = TipoSecaoTemplate.Footer,
            TipoDocumento = TipoDocumento.Geral,
            Ativo = true
        });
        var footerResult = await footerRes.Content.ReadFromJsonAsync<CreateModeloDocumentoResponse>();

        // 3. Create Body
        var bodyCommand = new CreateModeloDocumentoCommand
        {
            Nome = "Template Alta Ambulatorial Teste",
            TipoSecao = TipoSecaoTemplate.Body,
            TipoDocumento = TipoDocumento.AltaAmbulatorial,
            Conteudo = "# Documento de Alta Ambulatorial\nData: [FUN_DATA_AGORA]\nResponsável: [FUN_NOME_RESPOSAVEL]",
            HeaderTemplateId = headerResult!.Id,
            FooterTemplateId = footerResult!.Id,
            Ativo = true
        };

        var bodyRes = await _client.PostAsJsonAsync("/api/ModelosDocumento", bodyCommand);
        Assert.Equal(HttpStatusCode.OK, bodyRes.StatusCode);

        var bodyResult = await bodyRes.Content.ReadFromJsonAsync<CreateModeloDocumentoResponse>();
        Assert.NotNull(bodyResult);
        Assert.True(bodyResult!.Success);

        // 4. Get by Tipo
        var getRes = await _client.GetAsync("/api/ModelosDocumento/tipo/AltaAmbulatorial");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);
        var getResult = await getRes.Content.ReadFromJsonAsync<ModeloDocumentoVm>();
        Assert.NotNull(getResult);
        Assert.Equal("Template Alta Ambulatorial Teste", getResult!.Nome);
        Assert.NotNull(getResult.HeaderTemplate);
        Assert.NotNull(getResult.FooterTemplate);
    }

    [Fact]
    public async Task GetById_Existing_ReturnsCorrectData()
    {
        var createRes = await _client.PostAsJsonAsync("/api/ModelosDocumento", new CreateModeloDocumentoCommand
        {
            Nome = "Template Para GetById",
            TipoSecao = TipoSecaoTemplate.Body,
            TipoDocumento = TipoDocumento.LiberacaoQuarentena,
            Conteudo = "Conteudo de quarentena",
            Ativo = true
        });
        var created = await createRes.Content.ReadFromJsonAsync<CreateModeloDocumentoResponse>();

        var getRes = await _client.GetAsync($"/api/ModelosDocumento/{created!.Id}");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);

        var result = await getRes.Content.ReadFromJsonAsync<ModeloDocumentoVm>();
        Assert.NotNull(result);
        Assert.Equal("Template Para GetById", result!.Nome);
        Assert.Equal(TipoSecaoTemplate.Body, result.TipoSecao);
    }

    [Fact]
    public async Task GetById_NotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/ModelosDocumento/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_ValidData_UpdatesCorrectly()
    {
        var createRes = await _client.PostAsJsonAsync("/api/ModelosDocumento", new CreateModeloDocumentoCommand
        {
            Nome = "Template Para Atualizar",
            TipoSecao = TipoSecaoTemplate.Body,
            TipoDocumento = TipoDocumento.Geral,
            Conteudo = "Conteudo Inicial",
            Ativo = true
        });
        var created = await createRes.Content.ReadFromJsonAsync<CreateModeloDocumentoResponse>();

        var updateCommand = new UpdateModeloDocumentoCommand
        {
            Id = created!.Id,
            Nome = "Template Atualizado com Sucesso",
            TipoSecao = TipoSecaoTemplate.Body,
            TipoDocumento = TipoDocumento.AltaAmbulatorial,
            Conteudo = "Conteudo Atualizado",
            Ativo = false
        };

        var updateRes = await _client.PutAsJsonAsync("/api/ModelosDocumento", updateCommand);
        Assert.Equal(HttpStatusCode.OK, updateRes.StatusCode);

        var getRes = await _client.GetAsync($"/api/ModelosDocumento/{created.Id}");
        var updated = await getRes.Content.ReadFromJsonAsync<ModeloDocumentoVm>();
        Assert.NotNull(updated);
        Assert.Equal("Template Atualizado com Sucesso", updated!.Nome);
        Assert.Equal("Conteudo Atualizado", updated.Conteudo);
        Assert.False(updated.Ativo);
    }

    [Fact]
    public async Task GetAll_FilterByTipoSecao_ReturnsCorrectItems()
    {
        var response = await _client.GetAsync("/api/ModelosDocumento?tipoSecao=Header");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var list = await response.Content.ReadFromJsonAsync<List<ModeloDocumentoVm>>();
        Assert.NotNull(list);
        Assert.All(list!, item => Assert.Equal(TipoSecaoTemplate.Header, item.TipoSecao));
    }

    [Fact]
    public async Task Delete_Existing_ReturnsNoContent()
    {
        var createRes = await _client.PostAsJsonAsync("/api/ModelosDocumento", new CreateModeloDocumentoCommand
        {
            Nome = "Template Para Deletar",
            TipoSecao = TipoSecaoTemplate.Body,
            TipoDocumento = TipoDocumento.Geral,
            Ativo = true
        });
        var created = await createRes.Content.ReadFromJsonAsync<CreateModeloDocumentoResponse>();

        var deleteRes = await _client.DeleteAsync($"/api/ModelosDocumento/{created!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteRes.StatusCode);

        var getRes = await _client.GetAsync($"/api/ModelosDocumento/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getRes.StatusCode);
    }

    [Fact]
    public async Task Delete_NotFound_ReturnsError()
    {
        var response = await _client.DeleteAsync("/api/ModelosDocumento/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
