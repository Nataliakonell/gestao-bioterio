using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class RelatorioReadRepository : IRelatorioReadRepository
    {
        private readonly BioterioDbContext _context;

        public RelatorioReadRepository(BioterioDbContext context)
        {
            _context = context;
        }

        public async Task<List<RelatorioPlantelItemDto>> GetRelatorioPlantelAsync(
            int? grupoId,
            int? especieId,
            int? situacao,
            int? genero,
            int? faseDeVida,
            DateTime? dataEntradaInicio,
            DateTime? dataEntradaFim,
            CancellationToken ct = default)
        {
            var query = _context.Animals
                .AsNoTracking()
                .Include(a => a.Especie)
                    .ThenInclude(e => e!.Grupo)
                .Include(a => a.AnimalLocalizacao)
                    .ThenInclude(al => al!.Localizacao)
                .Include(a => a.InstalacaoBioterio)
                .AsQueryable();

            if (grupoId.HasValue)
                query = query.Where(a => a.Especie != null && a.Especie.GrupoId == grupoId.Value);

            if (especieId.HasValue)
                query = query.Where(a => a.EspecieId == especieId.Value);

            if (situacao.HasValue)
            {
                var sitEnum = (Situacao)situacao.Value;
                query = query.Where(a => a.SituacaoAnimal == sitEnum);
            }

            if (genero.HasValue)
            {
                var genEnum = (Genero)genero.Value;
                query = query.Where(a => a.Genero == genEnum);
            }

            if (faseDeVida.HasValue)
            {
                var faseEnum = (FaseDeVida)faseDeVida.Value;
                query = query.Where(a => a.FaseDeVida == faseEnum);
            }

            if (dataEntradaInicio.HasValue)
                query = query.Where(a => a.DataDeEntrada >= dataEntradaInicio.Value);

            if (dataEntradaFim.HasValue)
                query = query.Where(a => a.DataDeEntrada <= dataEntradaFim.Value);

            var items = await query
                .OrderBy(a => a.NumeroRegistro)
                .ToListAsync(ct);

            return items.Select(a => new RelatorioPlantelItemDto
            {
                NumeroRegistro = a.NumeroRegistro,
                NomePopular = a.NomePopular,
                Especie = a.Especie?.Nome ?? "-",
                Grupo = a.Especie?.Grupo?.Nome ?? "-",
                Sexo = a.Genero.ToString(),
                FaseDeVida = a.FaseDeVida.ToString(),
                Situacao = a.SituacaoAnimal.ToString(),
                Localizacao = a.AnimalLocalizacao?.Localizacao?.Nome ?? a.InstalacaoBioterio?.Nome ?? "-",
                DataDeEntrada = a.DataDeEntrada.ToString("dd/MM/yyyy"),
                Sisfauna = a.Sisfauna ? "Sim" : "Não",
                NumeroChip = string.IsNullOrWhiteSpace(a.NumeroChip) ? "-" : a.NumeroChip
            }).ToList();
        }

        public async Task<List<RelatorioAlimentarItemDto>> GetRelatorioAlimentarAsync(
            DateTime? dataInicio,
            DateTime? dataFim,
            int? especieId,
            int? consumo,
            string? responsavel,
            CancellationToken ct = default)
        {
            var query = _context.Alimentacoes
                .AsNoTracking()
                .Include(a => a.Animal)
                    .ThenInclude(an => an.Especie)
                .Include(a => a.Refeicoes)
                .AsQueryable();

            if (dataInicio.HasValue)
                query = query.Where(a => a.DataAlimentacao >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(a => a.DataAlimentacao <= dataFim.Value);

            if (especieId.HasValue)
                query = query.Where(a => a.Animal != null && a.Animal.EspecieId == especieId.Value);

            if (!string.IsNullOrWhiteSpace(responsavel))
            {
                var resp = responsavel.ToLower();
                query = query.Where(a => a.RF != null && a.RF.ToLower().Contains(resp));
            }

            var alimentacoes = await query
                .OrderByDescending(a => a.DataAlimentacao)
                .ToListAsync(ct);

            var result = new List<RelatorioAlimentarItemDto>();

            foreach (var a in alimentacoes)
            {
                if (a.Refeicoes == null || !a.Refeicoes.Any())
                {
                    result.Add(new RelatorioAlimentarItemDto
                    {
                        Data = a.DataAlimentacao.ToString("dd/MM/yyyy"),
                        Animal = a.Animal != null ? $"{a.Animal.NumeroRegistro} - {a.Animal.NomePopular}" : "-",
                        Especie = a.Animal?.Especie?.Nome ?? "-",
                        Refeicao = "Sem refeições",
                        QuantidadeOfertada = a.TotalOfertado.ToString("0.##"),
                        QuantidadeConsumidaSaldo = $"{a.TotalConsumido:0.##} (Saldo: {a.Saldo:0.##})",
                        StatusConsumo = a.Status.ToString(),
                        Responsavel = a.RF ?? "-",
                        Observacoes = a.Observacoes ?? "-"
                    });
                }
                else
                {
                    foreach (var refItem in a.Refeicoes)
                    {
                        if (consumo.HasValue && consumo.Value > 0)
                        {
                            if ((int)refItem.SituacaoRefeicao != consumo.Value)
                                continue;
                        }

                        result.Add(new RelatorioAlimentarItemDto
                        {
                            Data = a.DataAlimentacao.ToString("dd/MM/yyyy"),
                            Animal = a.Animal != null ? $"{a.Animal.NumeroRegistro} - {a.Animal.NomePopular}" : "-",
                            Especie = a.Animal?.Especie?.Nome ?? "-",
                            Refeicao = $"{refItem.TipoRefeicao} ({refItem.PesoRefeicao:0.##} {refItem.UnidadeDeMedida})",
                            QuantidadeOfertada = a.TotalOfertado.ToString("0.##"),
                            QuantidadeConsumidaSaldo = $"{a.TotalConsumido:0.##} (Saldo: {a.Saldo:0.##})",
                            StatusConsumo = refItem.SituacaoRefeicao.ToString(),
                            Responsavel = a.RF ?? "-",
                            Observacoes = a.Observacoes ?? "-"
                        });
                    }
                }
            }

            return result;
        }

        public async Task<List<RelatorioClinicoItemDto>> GetRelatorioClinicoAsync(
            DateTime? dataInicio,
            DateTime? dataFim,
            int? tipoClinico,
            int? animalId,
            string? veterinario,
            CancellationToken ct = default)
        {
            var result = new List<RelatorioClinicoItemDto>();

            // 1 = Consultas, 2 = Alta, 3 = Liberacao, 4 = Medicacoes, 5 = Exames, 6 = Evolucoes, 7 = Procedimentos
            bool incluirTodas = !tipoClinico.HasValue || tipoClinico.Value == 0;

            // Map de animais para lookup rápido
            var todosAnimais = await _context.Animals
                .AsNoTracking()
                .Include(a => a.Especie)
                .ToDictionaryAsync(a => a.Id, ct);

            // 1. Consultas
            if (incluirTodas || tipoClinico == 1)
            {
                var q = _context.Consultas.AsNoTracking().AsQueryable();
                if (dataInicio.HasValue) q = q.Where(c => c.DataHoraConsulta >= dataInicio.Value);
                if (dataFim.HasValue) q = q.Where(c => c.DataHoraConsulta <= dataFim.Value);
                if (animalId.HasValue) q = q.Where(c => c.AnimalId == animalId.Value);
                if (!string.IsNullOrWhiteSpace(veterinario)) q = q.Where(c => (c.Responsavel != null && c.Responsavel.Contains(veterinario)) || (c.RF != null && c.RF.Contains(veterinario)));

                var consultas = await q.ToListAsync(ct);
                result.AddRange(consultas.Select(c =>
                {
                    todosAnimais.TryGetValue(c.AnimalId, out var an);
                    return new RelatorioClinicoItemDto
                    {
                        DataHora = c.DataHoraConsulta.ToString("dd/MM/yyyy HH:mm"),
                        NumeroRegistro = an?.NumeroRegistro ?? "-",
                        AnimalNomeEspecie = an != null ? $"{an.NomePopular} ({an.Especie?.Nome ?? "-"})" : "-",
                        TipoAtendimento = "Consulta",
                        DescricaoDiagnostico = $"Anamnese: {c.Anamnese} | Suspeita: {c.SuspeitaDiagnostica}",
                        Responsavel = c.Responsavel ?? c.RF ?? "-",
                        StatusParecer = "Realizada"
                    };
                }));
            }

            // 2. Altas Ambulatoriais
            if (incluirTodas || tipoClinico == 2)
            {
                var q = _context.AltaAmbulatoriais.AsNoTracking().AsQueryable();
                if (dataInicio.HasValue) q = q.Where(c => c.DataAltaClinica >= dataInicio.Value);
                if (dataFim.HasValue) q = q.Where(c => c.DataAltaClinica <= dataFim.Value);
                if (animalId.HasValue) q = q.Where(c => c.AnimalId == animalId.Value);
                if (!string.IsNullOrWhiteSpace(veterinario)) q = q.Where(c => (c.Responsavel != null && c.Responsavel.Contains(veterinario)) || (c.RF != null && c.RF.Contains(veterinario)));

                var altas = await q.ToListAsync(ct);
                result.AddRange(altas.Select(c =>
                {
                    todosAnimais.TryGetValue(c.AnimalId, out var an);
                    return new RelatorioClinicoItemDto
                    {
                        DataHora = c.DataAltaClinica.ToString("dd/MM/yyyy HH:mm"),
                        NumeroRegistro = an?.NumeroRegistro ?? "-",
                        AnimalNomeEspecie = an != null ? $"{an.NomePopular} ({an.Especie?.Nome ?? "-"})" : "-",
                        TipoAtendimento = "Alta Ambulatorial",
                        DescricaoDiagnostico = $"Procedimentos/Medicações: {c.ProcedimentosMedicacoes} | Obs: {c.ObservacoesClinicas}",
                        Responsavel = c.Responsavel ?? c.RF ?? "-",
                        StatusParecer = "Alta Concedida"
                    };
                }));
            }

            // 3. Liberação Quarentena
            if (incluirTodas || tipoClinico == 3)
            {
                var q = _context.LiberacoesQuarentena.AsNoTracking().AsQueryable();
                if (dataInicio.HasValue) q = q.Where(c => c.DataSaidaQuarentena >= dataInicio.Value);
                if (dataFim.HasValue) q = q.Where(c => c.DataSaidaQuarentena <= dataFim.Value);
                if (animalId.HasValue) q = q.Where(c => c.AnimalId == animalId.Value);
                if (!string.IsNullOrWhiteSpace(veterinario)) q = q.Where(c => (c.Responsavel != null && c.Responsavel.Contains(veterinario)) || (c.RF != null && c.RF.Contains(veterinario)));

                var libs = await q.ToListAsync(ct);
                result.AddRange(libs.Select(c =>
                {
                    todosAnimais.TryGetValue(c.AnimalId, out var an);
                    return new RelatorioClinicoItemDto
                    {
                        DataHora = c.DataSaidaQuarentena.ToString("dd/MM/yyyy HH:mm"),
                        NumeroRegistro = an?.NumeroRegistro ?? "-",
                        AnimalNomeEspecie = an != null ? $"{an.NomePopular} ({an.Especie?.Nome ?? "-"})" : "-",
                        TipoAtendimento = "Liberação Quarentena",
                        DescricaoDiagnostico = $"Entrada: {c.DataEntradaQuarentena:dd/MM/yyyy} - Saída: {c.DataSaidaQuarentena:dd/MM/yyyy}",
                        Responsavel = c.Responsavel ?? c.RF ?? "-",
                        StatusParecer = "Liberado"
                    };
                }));
            }

            // 4. Medicações Prescritas
            if (incluirTodas || tipoClinico == 4)
            {
                var q = _context.PrescricoesMedicacao.AsNoTracking()
                    .Include(c => c.Medicacao)
                    .AsQueryable();
                if (dataInicio.HasValue) q = q.Where(c => c.DataHoraInicio >= dataInicio.Value);
                if (dataFim.HasValue) q = q.Where(c => c.DataHoraInicio <= dataFim.Value);
                if (animalId.HasValue) q = q.Where(c => c.AnimalId == animalId.Value);
                if (!string.IsNullOrWhiteSpace(veterinario)) q = q.Where(c => (c.Responsavel != null && c.Responsavel.Contains(veterinario)) || (c.RF != null && c.RF.Contains(veterinario)));

                var meds = await q.ToListAsync(ct);
                result.AddRange(meds.Select(c =>
                {
                    todosAnimais.TryGetValue(c.AnimalId, out var an);
                    var medNome = c.Medicacao != null ? $"{c.Medicacao.PrincipioAtivo} ({c.Medicacao.NomeComercial})" : "-";
                    return new RelatorioClinicoItemDto
                    {
                        DataHora = c.DataHoraInicio.ToString("dd/MM/yyyy HH:mm"),
                        NumeroRegistro = an?.NumeroRegistro ?? "-",
                        AnimalNomeEspecie = an != null ? $"{an.NomePopular} ({an.Especie?.Nome ?? "-"})" : "-",
                        TipoAtendimento = "Prescrição Medicação",
                        DescricaoDiagnostico = $"Medicação: {medNome} | Dose: {c.VolumeDose} | Via: {c.ViaAdministracao} | Doses: {c.QuantidadeDoses}",
                        Responsavel = c.Responsavel ?? c.RF ?? "-",
                        StatusParecer = c.StatusPrescricao.ToString()
                    };
                }));
            }

            // 5. Exames
            if (incluirTodas || tipoClinico == 5)
            {
                var q = _context.SolicitacoesExame.AsNoTracking().AsQueryable();
                if (dataInicio.HasValue) q = q.Where(c => c.DataCriacao >= dataInicio.Value);
                if (dataFim.HasValue) q = q.Where(c => c.DataCriacao <= dataFim.Value);
                if (animalId.HasValue) q = q.Where(c => c.AnimalId == animalId.Value);
                if (!string.IsNullOrWhiteSpace(veterinario)) q = q.Where(c => (c.Responsavel != null && c.Responsavel.Contains(veterinario)) || (c.RF != null && c.RF.Contains(veterinario)));

                var exames = await q.ToListAsync(ct);
                result.AddRange(exames.Select(c =>
                {
                    todosAnimais.TryGetValue(c.AnimalId, out var an);
                    return new RelatorioClinicoItemDto
                    {
                        DataHora = c.DataCriacao.ToString("dd/MM/yyyy"),
                        NumeroRegistro = an?.NumeroRegistro ?? "-",
                        AnimalNomeEspecie = an != null ? $"{an.NomePopular} ({an.Especie?.Nome ?? "-"})" : "-",
                        TipoAtendimento = "Solicitação Exame",
                        DescricaoDiagnostico = $"Tipo: {c.TipoExame} | Região: {c.RegiaoAnatomica} | Suspeita: {c.SuspeitaClinica}",
                        Responsavel = c.Responsavel ?? c.RF ?? "-",
                        StatusParecer = c.Status.ToString()
                    };
                }));
            }

            // 6. Evoluções
            if (incluirTodas || tipoClinico == 6)
            {
                var q = _context.Evolucoes.AsNoTracking().AsQueryable();
                if (dataInicio.HasValue) q = q.Where(c => c.DataHoraRegistro >= dataInicio.Value);
                if (dataFim.HasValue) q = q.Where(c => c.DataHoraRegistro <= dataFim.Value);
                if (animalId.HasValue) q = q.Where(c => c.AnimalId == animalId.Value);
                if (!string.IsNullOrWhiteSpace(veterinario)) q = q.Where(c => (c.Responsavel != null && c.Responsavel.Contains(veterinario)) || (c.RF != null && c.RF.Contains(veterinario)));

                var evs = await q.ToListAsync(ct);
                result.AddRange(evs.Select(c =>
                {
                    todosAnimais.TryGetValue(c.AnimalId, out var an);
                    return new RelatorioClinicoItemDto
                    {
                        DataHora = c.DataHoraRegistro.ToString("dd/MM/yyyy HH:mm"),
                        NumeroRegistro = an?.NumeroRegistro ?? "-",
                        AnimalNomeEspecie = an != null ? $"{an.NomePopular} ({an.Especie?.Nome ?? "-"})" : "-",
                        TipoAtendimento = "Evolução Clínica",
                        DescricaoDiagnostico = c.Descricao,
                        Responsavel = c.Responsavel ?? c.RF ?? "-",
                        StatusParecer = "Registrado"
                    };
                }));
            }

            // 7. Procedimentos
            if (incluirTodas || tipoClinico == 7)
            {
                var q = _context.Procedimentos.AsNoTracking()
                    .Include(c => c.TipoProcedimento)
                    .AsQueryable();
                if (dataInicio.HasValue) q = q.Where(c => c.DataCriacao >= dataInicio.Value);
                if (dataFim.HasValue) q = q.Where(c => c.DataCriacao <= dataFim.Value);
                if (animalId.HasValue) q = q.Where(c => c.AnimalId == animalId.Value);
                if (!string.IsNullOrWhiteSpace(veterinario)) q = q.Where(c => (c.Responsavel != null && c.Responsavel.Contains(veterinario)) || (c.RF != null && c.RF.Contains(veterinario)));

                var procs = await q.ToListAsync(ct);
                result.AddRange(procs.Select(c =>
                {
                    todosAnimais.TryGetValue(c.AnimalId, out var an);
                    return new RelatorioClinicoItemDto
                    {
                        DataHora = c.DataCriacao.ToString("dd/MM/yyyy HH:mm"),
                        NumeroRegistro = an?.NumeroRegistro ?? "-",
                        AnimalNomeEspecie = an != null ? $"{an.NomePopular} ({an.Especie?.Nome ?? "-"})" : "-",
                        TipoAtendimento = $"Procedimento ({c.TipoProcedimento?.Nome ?? "-"})",
                        DescricaoDiagnostico = c.Descricao,
                        Responsavel = c.Responsavel ?? c.RF ?? "-",
                        StatusParecer = "Realizado"
                    };
                }));
            }

            return result.OrderByDescending(r => r.DataHora).ToList();
        }

        public async Task<List<RelatorioInstalacaoItemDto>> GetRelatorioInstalacoesAsync(
            int localizacaoId,
            bool incluirSublocais,
            int? especieId,
            CancellationToken ct = default)
        {
            var targetLocalizacao = await _context.Localizacoes
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == localizacaoId, ct);

            if (targetLocalizacao == null)
                return new List<RelatorioInstalacaoItemDto>();

            var localizacaoIds = new List<int> { localizacaoId };

            if (incluirSublocais)
            {
                var subIds = await _context.Localizacoes
                    .AsNoTracking()
                    .Where(l => l.LocalizacaoPaiId == localizacaoId || 
                                (l.CaminhoIds != null && l.CaminhoIds.Contains($"/{localizacaoId}/")))
                    .Select(l => l.Id)
                    .ToListAsync(ct);
                localizacaoIds.AddRange(subIds);
            }

            var query = _context.AnimalLocalizacoes
                .AsNoTracking()
                .Include(al => al.Localizacao)
                .Include(al => al.Animal)
                    .ThenInclude(a => a.Especie)
                .Where(al => localizacaoIds.Contains(al.LocalizacaoId))
                .AsQueryable();

            if (especieId.HasValue)
                query = query.Where(al => al.Animal != null && al.Animal.EspecieId == especieId.Value);

            var items = await query.ToListAsync(ct);

            return items.Select(al => new RelatorioInstalacaoItemDto
            {
                Localizacao = al.Localizacao?.Nome ?? "-",
                Ambiente = al.Localizacao?.Ambiente.ToString() ?? "-",
                Animal = al.Animal != null ? $"{al.Animal.NumeroRegistro} - {al.Animal.NomePopular}" : "-",
                Especie = al.Animal?.Especie?.Nome ?? "-",
                Sexo = al.Animal?.Genero.ToString() ?? "-",
                FaseDeVida = al.Animal?.FaseDeVida.ToString() ?? "-",
                DataAlocacao = al.DataCriacao.ToString("dd/MM/yyyy")
            }).ToList();
        }

        public async Task<List<RelatorioEventoItemDto>> GetRelatorioEventosAsync(
            DateTime? dataInicio,
            DateTime? dataFim,
            int? tipoEvento,
            int? status,
            CancellationToken ct = default)
        {
            var query = _context.Eventos
                .AsNoTracking()
                .AsQueryable();

            if (dataInicio.HasValue)
                query = query.Where(e => e.DataHoraInicio >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(e => e.DataHoraInicio <= dataFim.Value);

            if (tipoEvento.HasValue && tipoEvento.Value > 0)
            {
                var teEnum = (TipoEvento)tipoEvento.Value;
                query = query.Where(e => e.TipoEvento == teEnum);
            }

            if (status.HasValue && status.Value > 0)
            {
                var stEnum = (Status)status.Value;
                query = query.Where(e => e.Status == stEnum);
            }

            var eventos = await query.OrderByDescending(e => e.DataHoraInicio).ToListAsync(ct);
            var eventoIds = eventos.Select(e => e.Id).ToList();

            var eventoAnimais = await _context.EventosAnimais
                .AsNoTracking()
                .Where(ea => eventoIds.Contains(ea.EventoId))
                .ToListAsync(ct);

            var animalIds = eventoAnimais.Select(ea => ea.AnimalId).Distinct().ToList();
            var animaisMap = await _context.Animals
                .AsNoTracking()
                .Where(a => animalIds.Contains(a.Id))
                .ToDictionaryAsync(a => a.Id, a => a.NumeroRegistro, ct);

            var grupoAnimais = eventoAnimais
                .GroupBy(ea => ea.EventoId)
                .ToDictionary(
                    g => g.Key, 
                    g => g.Select(x => animaisMap.TryGetValue(x.AnimalId, out var num) ? num : "").Where(s => !string.IsNullOrEmpty(s)).ToList()
                );

            return eventos.Select(e =>
            {
                var animaisDoEvento = grupoAnimais.ContainsKey(e.Id) ? grupoAnimais[e.Id] : new List<string>();
                return new RelatorioEventoItemDto
                {
                    NomeEvento = e.Nome,
                    TipoEvento = e.TipoEvento.ToString(),
                    Status = e.Status.ToString(),
                    Periodo = $"{e.DataHoraInicio:dd/MM/yyyy HH:mm} a {e.DataHoraPrevisaoRetorno:dd/MM/yyyy HH:mm}",
                    Responsavel = e.Responsavel,
                    QuantidadeAnimais = animaisDoEvento.Count,
                    Animais = animaisDoEvento.Count > 0 ? string.Join(", ", animaisDoEvento) : "Nenhum animal"
                };
            }).ToList();
        }

        public async Task<List<RelatorioMovimentacaoItemDto>> GetRelatorioMovimentacoesAsync(
            DateTime? dataInicio,
            DateTime? dataFim,
            int? animalId,
            int? tipoMovimentacao,
            int? localizacaoId,
            CancellationToken ct = default)
        {
            var query = _context.MovimentacoesAnimais
                .AsNoTracking()
                .AsQueryable();

            if (dataInicio.HasValue)
                query = query.Where(m => m.DataCriacao >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(m => m.DataCriacao <= dataFim.Value);

            if (animalId.HasValue)
                query = query.Where(m => m.AnimalId == animalId.Value);

            if (tipoMovimentacao.HasValue && tipoMovimentacao.Value > 0)
            {
                var tmEnum = (TipoMovimentacao)tipoMovimentacao.Value;
                query = query.Where(m => m.TipoMovimentacao == tmEnum);
            }

            if (localizacaoId.HasValue)
                query = query.Where(m => m.LocalizacaoId == localizacaoId.Value);

            var movimentacoes = await query.OrderByDescending(m => m.DataCriacao).ToListAsync(ct);

            var animalIds = movimentacoes.Select(m => m.AnimalId).Distinct().ToList();
            var animaisMap = await _context.Animals
                .AsNoTracking()
                .Include(a => a.Especie)
                .Where(a => animalIds.Contains(a.Id))
                .ToDictionaryAsync(a => a.Id, ct);

            var localizacaoIds = movimentacoes.Select(m => m.LocalizacaoId).Distinct().ToList();
            var locaisMap = await _context.Localizacoes
                .AsNoTracking()
                .Where(l => localizacaoIds.Contains(l.Id))
                .ToDictionaryAsync(l => l.Id, l => l.Nome, ct);

            var eventoIds = movimentacoes.Where(m => m.EventoId.HasValue).Select(m => m.EventoId!.Value).Distinct().ToList();
            var eventosMap = await _context.Eventos
                .AsNoTracking()
                .Where(e => eventoIds.Contains(e.Id))
                .ToDictionaryAsync(e => e.Id, e => e.Nome, ct);

            return movimentacoes.Select(m =>
            {
                animaisMap.TryGetValue(m.AnimalId, out var animal);
                locaisMap.TryGetValue(m.LocalizacaoId, out var localNome);
                string eventoNome = "-";
                if (m.EventoId.HasValue && eventosMap.TryGetValue(m.EventoId.Value, out var ev))
                {
                    eventoNome = ev;
                }

                return new RelatorioMovimentacaoItemDto
                {
                    DataHora = m.DataCriacao.ToString("dd/MM/yyyy HH:mm"),
                    Animal = animal != null ? $"{animal.NumeroRegistro} - {animal.NomePopular}" : $"ID #{m.AnimalId}",
                    Especie = animal?.Especie?.Nome ?? "-",
                    TipoMovimentacao = m.TipoMovimentacao.ToString(),
                    LocalizacaoDestino = localNome ?? $"ID #{m.LocalizacaoId}",
                    Evento = eventoNome,
                    ResponsavelRF = m.RF ?? "-"
                };
            }).ToList();
        }

        public async Task<List<RelatorioSisfaunaItemDto>> GetRelatorioSisfaunaAsync(
            int? anoReferencia,
            DateTime? dataEntradaInicio,
            DateTime? dataEntradaFim,
            int? especieId,
            bool somenteAtivos,
            CancellationToken ct = default)
        {
            var query = _context.Animals
                .AsNoTracking()
                .Include(a => a.Especie)
                .Include(a => a.LocalOrigem)
                .Where(a => a.Sisfauna == true)
                .AsQueryable();

            if (anoReferencia.HasValue)
            {
                var inicioAno = new DateTime(anoReferencia.Value, 1, 1);
                var fimAno = new DateTime(anoReferencia.Value, 12, 31, 23, 59, 59);
                query = query.Where(a => a.DataDeEntrada <= fimAno);
            }

            if (dataEntradaInicio.HasValue)
                query = query.Where(a => a.DataDeEntrada >= dataEntradaInicio.Value);

            if (dataEntradaFim.HasValue)
                query = query.Where(a => a.DataDeEntrada <= dataEntradaFim.Value);

            if (especieId.HasValue)
                query = query.Where(a => a.EspecieId == especieId.Value);

            if (somenteAtivos)
                query = query.Where(a => a.SituacaoAnimal == Situacao.Vivo);

            var items = await query.OrderBy(a => a.NumeroRegistro).ToListAsync(ct);

            return items.Select(a => new RelatorioSisfaunaItemDto
            {
                NumeroRegistro = a.NumeroRegistro,
                NumeroChip = string.IsNullOrWhiteSpace(a.NumeroChip) ? "-" : a.NumeroChip,
                Especie = a.Especie?.Nome ?? "-",
                Sexo = a.Genero.ToString(),
                FaseDeVida = a.FaseDeVida.ToString(),
                LocalOrigem = a.LocalOrigem?.Nome ?? "-",
                DataEntrada = a.DataDeEntrada.ToString("dd/MM/yyyy"),
                Situacao = a.SituacaoAnimal.ToString(),
                TermoDoacao = a.TermoDeDoacao ? "Sim" : "Não"
            }).ToList();
        }
    }
}
