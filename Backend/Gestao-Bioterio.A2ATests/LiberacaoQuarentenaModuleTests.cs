using Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.CreateLiberacaoQuarentena;
using Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.UpdateLiberacaoQuarentena;
using Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetLiberacaoQuarentena;
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

namespace Gestao_Bioterio.A2ATests
{
    [Collection("SequentialA2A")]
    public class LiberacaoQuarentenaModuleTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public LiberacaoQuarentenaModuleTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
                builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

                builder.ConfigureServices(services =>
                {
                    services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                    services.AddDbContext<BioterioDbContext>(options =>
                        options.UseInMemoryDatabase("GestaoBioterioQuarentenaTestDb"));

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

            var instalacao = new InstalacaoBioterio { Id = 1, Nome = "Quarentena Sala 1" };
            context.InstalacoesBioterio.Add(instalacao);
            var instalacaoDestino = new InstalacaoBioterio { Id = 2, Nome = "Biotério Geral Sala A" };
            context.InstalacoesBioterio.Add(instalacaoDestino);

            var local = new LocalOrigem { Id = 1, Nome = "Biotério Central" };
            context.LocalOrigens.Add(local);

            await context.SaveChangesAsync();

            var animal = new Animal
            {
                Id = 1,
                NumeroRegistro = "QUAR-001",
                NomePopular = "Rato 01",
                EspecieId = 1,
                Genero = Genero.Macho,
                FaseDeVida = Gestao_Bioterio.Domain.Entities.FaseDeVida.Adulto,
                DataDeEntrada = DateTime.Now.AddMonths(-2),
                InstalacaoBioterioId = 1,
                SituacaoAnimal = Situacao.Vivo,
                LocalOrigemId = 1
            };
            context.Animals.Add(animal);

            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task Create_ValidData_ReturnsOk()
        {
            await SeedBaseDataAsync();
            var cmd = new CreateLiberacaoQuarentenaCommand
            {
                AnimalId = 1,
                DataEntradaQuarentena = DateTime.Today.AddDays(-15),
                DataSaidaQuarentena = DateTime.Today,
                InstalacaoBioterioId = 2
            };

            var res = await _client.PostAsJsonAsync("/api/LiberacaoQuarentena", cmd);
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);

            var json = await res.Content.ReadFromJsonAsync<CreateLiberacaoQuarentenaResponse>();
            Assert.NotNull(json);
            Assert.True(json.Success);
            Assert.True(json.Id > 0);
        }

        [Fact]
        public async Task GetByAnimalId_Existing_ReturnsOk()
        {
            await SeedBaseDataAsync();
            var cmd = new CreateLiberacaoQuarentenaCommand
            {
                AnimalId = 1,
                DataEntradaQuarentena = DateTime.Today.AddDays(-20),
                DataSaidaQuarentena = DateTime.Today,
                InstalacaoBioterioId = 2
            };

            var postRes = await _client.PostAsJsonAsync("/api/LiberacaoQuarentena", cmd);
            postRes.EnsureSuccessStatusCode();

            var getRes = await _client.GetAsync("/api/LiberacaoQuarentena/animal/1");
            Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);

            var vm = await getRes.Content.ReadFromJsonAsync<LiberacaoQuarentenaDetailVm>();
            Assert.NotNull(vm);
            Assert.Equal(1, vm!.AnimalId);
            Assert.Equal(2, vm.InstalacaoBioterioId);
        }

        [Fact]
        public async Task Update_ValidData_UpdatesSuccessfully()
        {
            await SeedBaseDataAsync();
            var cmd = new CreateLiberacaoQuarentenaCommand
            {
                AnimalId = 1,
                DataEntradaQuarentena = DateTime.Today.AddDays(-10),
                DataSaidaQuarentena = DateTime.Today,
                InstalacaoBioterioId = 2
            };

            var postRes = await _client.PostAsJsonAsync("/api/LiberacaoQuarentena", cmd);
            var createJson = await postRes.Content.ReadFromJsonAsync<CreateLiberacaoQuarentenaResponse>();

            var updateCmd = new UpdateLiberacaoQuarentenaCommand
            {
                Id = createJson!.Id,
                AnimalId = 1,
                DataEntradaQuarentena = DateTime.Today.AddDays(-12),
                DataSaidaQuarentena = DateTime.Today,
                InstalacaoBioterioId = 2
            };

            var putRes = await _client.PutAsJsonAsync("/api/LiberacaoQuarentena", updateCmd);
            Assert.Equal(HttpStatusCode.OK, putRes.StatusCode);
        }

        [Fact]
        public async Task GetAll_MultipleForSameAnimal_ReturnsAllInOrder()
        {
            await SeedBaseDataAsync();
            var cmd1 = new CreateLiberacaoQuarentenaCommand
            {
                AnimalId = 1,
                DataEntradaQuarentena = DateTime.Today.AddDays(-30),
                DataSaidaQuarentena = DateTime.Today.AddDays(-15),
                InstalacaoBioterioId = 2
            };
            var res1 = await _client.PostAsJsonAsync("/api/LiberacaoQuarentena", cmd1);
            Assert.Equal(HttpStatusCode.OK, res1.StatusCode);

            var cmd2 = new CreateLiberacaoQuarentenaCommand
            {
                AnimalId = 1,
                DataEntradaQuarentena = DateTime.Today.AddDays(-10),
                DataSaidaQuarentena = DateTime.Today,
                InstalacaoBioterioId = 1
            };
            var res2 = await _client.PostAsJsonAsync("/api/LiberacaoQuarentena", cmd2);
            Assert.Equal(HttpStatusCode.OK, res2.StatusCode);

            var getAllRes = await _client.GetAsync("/api/LiberacaoQuarentena?animalId=1");
            Assert.Equal(HttpStatusCode.OK, getAllRes.StatusCode);

            var list = await getAllRes.Content.ReadFromJsonAsync<List<Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetAllLiberacoesQuarentena.LiberacaoQuarentenaListVm>>();
            Assert.NotNull(list);
            Assert.True(list!.Count >= 2);
            // Must be ordered by DataSaidaQuarentena descending
            Assert.True(list[0].DataSaidaQuarentena >= list[1].DataSaidaQuarentena);
        }
    }
}
