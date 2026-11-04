using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Application.Features.DocumentosEventos.Command.CreateDocumentoEvento;
using Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetAllDocumentoEvento;
using Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetDocumentoEventoDetail;
using Gestao_Bioterio.Application.Features.Eventos.Command.CreateEvento;
using Gestao_Bioterio.Application.Features.Eventos.Command.UpdateEvento;
using Gestao_Bioterio.Application.Features.Eventos.Queries.GetAllEvento;
using Gestao_Bioterio.Application.Features.Eventos.Queries.GetEventoDetail;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xunit;

namespace Gestao_Bioterio.A2ATests
{
    [Collection("SequentialA2A")]
    public class EventoModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public EventoModuleTests(WebApplicationFactory<Program> factory)
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

            SeedDataAsync().Wait();
        }

        private async Task SeedDataAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            if (context.Eventos.Any(e => e.Id == 551)) return;

            context.Localizacoes.Add(new Localizacao
            {
                Id = 549,
                Nome = "Biotério Central UCDB",
                Ambiente = Ambiente.Interno,
                CaminhoHierarquia = "UCDB -> Biotério Central",
                CaminhoIds = "/1/549"
            });

            context.Animals.Add(new Animal
            {
                Id = 552,
                NumeroRegistro = "ANM-552",
                NomePopular = "Sucuri Verde",
                SituacaoAnimal = Situacao.Vivo,
                DataDeEntrada = DateTime.UtcNow
            });

            context.ModelosDocumentos.Add(new ModeloDocumento
            {
                Id = 553,
                Nome = "Formulário de Transporte de Fauna IMASUL",
                TipoDocumento = TipoDocumento.Geral,
                TipoSecao = TipoSecaoTemplate.Body,
                Conteudo = "Modelo de Autorização e Transporte de Animais Silvestres IMASUL",
                Ativo = true
            });

            context.Eventos.Add(new Evento
            {
                Id = 551,
                Nome = "Exposição Externa Shopping Bosque",
                TipoEvento = TipoEvento.Externo,
                DataHoraInicio = DateTime.UtcNow.AddDays(1),
                DataHoraPrevisaoRetorno = DateTime.UtcNow.AddDays(2),
                Responsavel = "Dr. Silva",
                Status = Status.Agendado
            });

            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/Evento");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var list = await response.Content.ReadFromJsonAsync<List<EventoListVm>>();
            Assert.NotNull(list);
            Assert.NotEmpty(list);
        }

        [Fact]
        public async Task GetById_Existing_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/Evento/551");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var item = await response.Content.ReadFromJsonAsync<EventoDetailVm>();
            Assert.NotNull(item);
            Assert.Equal(551, item.Id);
            Assert.Equal("Exposição Externa Shopping Bosque", item.Nome);
        }

        [Fact]
        public async Task GetById_NotFound_ReturnsNotFound()
        {
            var response = await _client.GetAsync("/api/Evento/99999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Create_EventoInterno_ReturnsOk()
        {
            var command = new CreateEventoCommand
            {
                Nome = "Semana Acadêmica de Biologia UCDB",
                TipoEvento = TipoEvento.Interno,
                DataHoraInicio = DateTime.UtcNow.AddDays(1),
                DataHoraPrevisaoRetorno = DateTime.UtcNow.AddDays(2),
                Responsavel = "Prof. Roberto",
                AnimalIds = new List<int> { 552 }
            };

            var response = await _client.PostAsJsonAsync("/api/Evento", command);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<CreateEventoResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.Equal("Semana Acadêmica de Biologia UCDB", result.Evento.Nome);
            Assert.Equal(TipoEvento.Interno, result.Evento.TipoEvento);
        }

        [Fact]
        public async Task Create_EventoExterno_GeraDocumento_ReturnsOk()
        {
            // 1. Cria Evento Externo
            var command = new CreateEventoCommand
            {
                Nome = "Exposição Científica e Feira Ambiental Shopping Bosque",
                TipoEvento = TipoEvento.Externo,
                DataHoraInicio = DateTime.UtcNow.AddDays(3),
                DataHoraPrevisaoRetorno = DateTime.UtcNow.AddDays(5),
                Responsavel = "Bióloga Ana",
                AnimalIds = new List<int> { 552 }
            };

            var response = await _client.PostAsJsonAsync("/api/Evento", command);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<CreateEventoResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.Equal("Exposição Científica e Feira Ambiental Shopping Bosque", result.Evento.Nome);
            Assert.Equal(TipoEvento.Externo, result.Evento.TipoEvento);

            // 2. Por ser evento externo fora da UCDB, gera o documento do evento (DocumentoEvento) conforme a spec
            var docCommand = new CreateDocumentoEventoCommand
            {
                EventoId = result.Id,
                ModeloDocumentoId = 553,
                ConteudoDadosJson = "{\"destinatario\":{\"nome\":\"Shopping Bosque\",\"municipio\":\"Campo Grande\"},\"transporte\":{\"meio\":\"Terrestre\",\"condutor\":\"Motorista UCDB\"}}"
            };

            var docResponse = await _client.PostAsJsonAsync("/api/DocumentoEvento", docCommand);
            Assert.Equal(HttpStatusCode.OK, docResponse.StatusCode);

            var docResult = await docResponse.Content.ReadFromJsonAsync<CreateDocumentoEventoResponse>();
            Assert.NotNull(docResult);
            Assert.True(docResult.Success);
            Assert.Equal(result.Id, docResult.DocumentoEvento.EventoId);

            // 3. Consulta os documentos gerados para o evento
            var getDocsResponse = await _client.GetAsync($"/api/DocumentoEvento?eventoId={result.Id}");
            Assert.Equal(HttpStatusCode.OK, getDocsResponse.StatusCode);

            var docsList = await getDocsResponse.Content.ReadFromJsonAsync<List<DocumentoEventoListVm>>();
            Assert.NotNull(docsList);
            Assert.NotEmpty(docsList);
            Assert.Contains(docsList, d => d.EventoId == result.Id);
        }

        [Fact]
        public async Task Create_InvalidData_ReturnsError()
        {
            var command = new CreateEventoCommand
            {
                Nome = "", // Obrigatório
                TipoEvento = TipoEvento.Interno,
                DataHoraInicio = DateTime.UtcNow.AddDays(3),
                DataHoraPrevisaoRetorno = DateTime.UtcNow.AddDays(2), // Inválido: retorno antes do início
                Responsavel = ""
            };

            var response = await _client.PostAsJsonAsync("/api/Evento", command);
            var result = await response.Content.ReadFromJsonAsync<CreateEventoResponse>();
            Assert.NotNull(result);
            Assert.False(result.Success);
            Assert.NotEmpty(result.ValidationErrors);
        }

        [Fact]
        public async Task Update_ValidData_ReturnsOk()
        {
            var command = new UpdateEventoCommand
            {
                Id = 551,
                Nome = "Exposição Externa Shopping Bosque Atualizada",
                TipoEvento = TipoEvento.Externo,
                DataHoraInicio = DateTime.UtcNow.AddDays(1),
                DataHoraPrevisaoRetorno = DateTime.UtcNow.AddDays(2),
                Responsavel = "Dr. Silva Atualizado",
                Status = Status.EmAndamento
            };

            var response = await _client.PutAsJsonAsync("/api/Evento", command);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<BaseResponse>();
            Assert.NotNull(result);
            Assert.True(result.Success);
        }

        [Fact]
        public async Task Delete_Existing_ReturnsNoContent()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
            var tempEvento = new Evento
            {
                Nome = "Evento para Deletar",
                TipoEvento = TipoEvento.Interno,
                DataHoraInicio = DateTime.UtcNow.AddDays(5),
                DataHoraPrevisaoRetorno = DateTime.UtcNow.AddDays(6),
                Responsavel = "Responsável Temporário",
                Status = Status.Agendado
            };
            context.Eventos.Add(tempEvento);
            await context.SaveChangesAsync();

            var deleteResponse = await _client.DeleteAsync($"/api/Evento/{tempEvento.Id}");
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        }
    }
}
