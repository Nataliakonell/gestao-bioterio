using System.Net;
using System.Net.Http.Json;
using Gestao_Bioterio.Api;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.CreatePrescricaoMedicacao;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.SuspendPrescricaoMedicacao;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.UpdatePrescricaoMedicacao;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetPrescricaoMedicacaoDetail;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Gestao_Bioterio.A2ATests;

[Collection("SequentialA2A")]
public class PrescricaoMedicacaoModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public PrescricaoMedicacaoModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioPrescricaoTestDb"));

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

        if (await context.Animals.AnyAsync()) return;

        var grupo = new Grupo { Nome = "Roedores Prescricao Test" };
        context.Groups.Add(grupo);
        await context.SaveChangesAsync();

        var especie = new Especie { Nome = "Rattus norvegicus Prescricao", GrupoId = grupo.Id };
        context.Especies.Add(especie);
        await context.SaveChangesAsync();

        var local = new LocalOrigem { Nome = "Bioterio Central Prescricao" };
        context.LocalOrigens.Add(local);
        await context.SaveChangesAsync();

        var instalacao = new InstalacaoBioterio { Nome = "Sala Teste Prescricao" };
        context.InstalacoesBioterio.Add(instalacao);
        await context.SaveChangesAsync();

        var animal = new Animal
        {
            NumeroRegistro = "ANIMAL-PRESC-01",
            NomePopular = "Rato Teste",
            EspecieId = especie.Id,
            InstalacaoBioterioId = instalacao.Id,
            LocalOrigemId = local.Id,
            DataDeEntrada = DateTime.Now.AddMonths(-1),
            Genero = Genero.Macho,
            FaseDeVida = FaseDeVida.Adulto,
            SituacaoAnimal = Situacao.Vivo,
        };
        context.Animals.Add(animal);

        var med = new Medicacao { PrincipioAtivo = "Enrofloxacina Test", NomeComercial = "Baytril Test", Ativo = true };
        context.Medicacoes.Add(med);

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task Create_ValidData_ReturnsOk()
    {
        await SeedBaseDataAsync();

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
        var animal = await context.Animals.FirstAsync();
        var med = await context.Medicacoes.FirstAsync();

        var cmd = new CreatePrescricaoMedicacaoCommand
        {
            AnimalId = animal.Id,
            MedicacaoId = med.Id,
            VolumeDose = "5 mg/kg",
            ViaAdministracao = ViaAdministracao.Oral,
            QuantidadeDoses = 3,
            IntervaloEntreDosesHoras = 12,
            DataHoraInicio = DateTime.Now,
            Observacao = "Administrar via gavagem",
            Responsavel = "Dr. Veterinario Teste"
        };

        var response = await _client.PostAsJsonAsync("/api/PrescricaoMedicacao", cmd);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CreatePrescricaoMedicacaoResponse>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.True(result.Id > 0);
    }

    [Fact]
    public async Task GetById_ReturnsPrescricaoComAdministracoes()
    {
        await SeedBaseDataAsync();

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
        var animal = await context.Animals.FirstAsync();
        var med = await context.Medicacoes.FirstAsync();

        var cmd = new CreatePrescricaoMedicacaoCommand
        {
            AnimalId = animal.Id,
            MedicacaoId = med.Id,
            VolumeDose = "2 mg/kg",
            ViaAdministracao = ViaAdministracao.Subcutanea,
            QuantidadeDoses = 2,
            IntervaloEntreDosesHoras = 24,
            DataHoraInicio = DateTime.Now,
            Observacao = "Subcutanea",
            Responsavel = "Dr. Teste"
        };

        var postRes = await _client.PostAsJsonAsync("/api/PrescricaoMedicacao", cmd);
        var created = await postRes.Content.ReadFromJsonAsync<CreatePrescricaoMedicacaoResponse>();
        Assert.NotNull(created);

        var getRes = await _client.GetAsync($"/api/PrescricaoMedicacao/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);

        var detail = await getRes.Content.ReadFromJsonAsync<PrescricaoMedicacaoDetailVm>();
        Assert.NotNull(detail);
        Assert.Equal(created.Id, detail.Id);
        Assert.NotNull(detail.Administracoes);
        Assert.Equal(2, detail.Administracoes.Count);
    }

    [Fact]
    public async Task Update_QuandoTodasDosesConcluidas_RetornaErroValidacao()
    {
        await SeedBaseDataAsync();

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
        var animal = await context.Animals.FirstAsync();
        var med = await context.Medicacoes.FirstAsync();

        var cmd = new CreatePrescricaoMedicacaoCommand
        {
            AnimalId = animal.Id,
            MedicacaoId = med.Id,
            VolumeDose = "10 mg/kg",
            ViaAdministracao = ViaAdministracao.Oral,
            QuantidadeDoses = 2,
            IntervaloEntreDosesHoras = 8,
            DataHoraInicio = DateTime.Now,
            Responsavel = "Dr. Teste"
        };

        var postRes = await _client.PostAsJsonAsync("/api/PrescricaoMedicacao", cmd);
        var created = await postRes.Content.ReadFromJsonAsync<CreatePrescricaoMedicacaoResponse>();
        Assert.NotNull(created);

        // Atualizar todas as doses da prescricao para Concluido no banco
        var administracoes = await context.MedicacoesAdministradas
            .Where(a => a.PrescricaoMedicacaoId == created.Id)
            .ToListAsync();
        foreach (var adm in administracoes)
        {
            adm.StatusDose = StatusDose.Concluido;
            adm.DataHoraAdministracao = DateTime.Now;
        }
        await context.SaveChangesAsync();

        // Tentar atualizar a prescricao
        var updateCmd = new UpdatePrescricaoMedicacaoCommand
        {
            Id = created.Id,
            AnimalId = animal.Id,
            MedicacaoId = med.Id,
            VolumeDose = "15 mg/kg",
            ViaAdministracao = ViaAdministracao.Oral,
            QuantidadeDoses = 2,
            IntervaloEntreDosesHoras = 8,
            DataHoraInicio = DateTime.Now,
            Observacao = "Tentativa de alteracao",
            Responsavel = "Dr. Teste"
        };

        var updateRes = await _client.PutAsJsonAsync("/api/PrescricaoMedicacao", updateCmd);
        Assert.Equal(HttpStatusCode.OK, updateRes.StatusCode);

        var result = await updateRes.Content.ReadFromJsonAsync<BaseResponse>();
        Assert.NotNull(result);
        Assert.False(result.Success);
        Assert.Contains("concluídas", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Suspend_QuandoTodasDosesConcluidas_RetornaErroValidacao()
    {
        await SeedBaseDataAsync();

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BioterioDbContext>();
        var animal = await context.Animals.FirstAsync();
        var med = await context.Medicacoes.FirstAsync();

        var cmd = new CreatePrescricaoMedicacaoCommand
        {
            AnimalId = animal.Id,
            MedicacaoId = med.Id,
            VolumeDose = "1 mg/kg",
            ViaAdministracao = ViaAdministracao.Oral,
            QuantidadeDoses = 1,
            IntervaloEntreDosesHoras = 0,
            DataHoraInicio = DateTime.Now,
            Responsavel = "Dr. Teste"
        };

        var postRes = await _client.PostAsJsonAsync("/api/PrescricaoMedicacao", cmd);
        var created = await postRes.Content.ReadFromJsonAsync<CreatePrescricaoMedicacaoResponse>();
        Assert.NotNull(created);

        var adm = await context.MedicacoesAdministradas.FirstAsync(a => a.PrescricaoMedicacaoId == created.Id);
        adm.StatusDose = StatusDose.Concluido;
        adm.DataHoraAdministracao = DateTime.Now;
        await context.SaveChangesAsync();

        var suspendCmd = new SuspendPrescricaoMedicacaoCommand
        {
            Id = created.Id,
            MotivoSuspensao = "Suspensao indevida apos conclusao"
        };

        var suspendRes = await _client.PostAsJsonAsync("/api/PrescricaoMedicacao/suspend", suspendCmd);
        Assert.Equal(HttpStatusCode.OK, suspendRes.StatusCode);

        var result = await suspendRes.Content.ReadFromJsonAsync<SuspendPrescricaoMedicacaoResponse>();
        Assert.NotNull(result);
        Assert.False(result.Success);
        Assert.Contains("todas as doses já foram concluídas", result.Message, StringComparison.OrdinalIgnoreCase);
    }
}
