using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Consultas.Queries.GetVisaoGeralClinica;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class ConsultaRepository(BioterioDbContext context) : BaseRepository<Consulta>(context), IConsultaRepository
    {
        public async Task<List<Consulta>> GetConsultasByAnimalAsync(int animalId)
        {
            return await _context.Consultas
                .AsNoTracking()
                .Include(c => c.Animal)
                .Include(c => c.InstalacaoBioterio)
                .Where(c => c.AnimalId == animalId)
                .OrderByDescending(c => c.DataHoraConsulta)
                .ToListAsync();
        }

        public async Task<int> GetConsultasCountAsync(string? searchTerm = null, int? animalId = null)
        {
            var query = _context.Consultas.AsNoTracking().AsQueryable();

            if (animalId.HasValue && animalId.Value > 0)
            {
                query = query.Where(c => c.AnimalId == animalId.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim().ToLower();
                query = query.Where(c => c.Anamnese.ToLower().Contains(term));
            }

            return await query.CountAsync();
        }

        public async Task<IReadOnlyList<Consulta>> GetConsultasPaginatedAsync(string? searchTerm = null, int page = 1, int pageSize = 10, int? animalId = null)
        {
            var query = _context.Consultas
                .AsNoTracking()
                .Include(c => c.Animal)
                .Include(c => c.InstalacaoBioterio)
                .AsQueryable();

            if (animalId.HasValue && animalId.Value > 0)
            {
                query = query.Where(c => c.AnimalId == animalId.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim().ToLower();
                query = query.Where(c => c.Anamnese.ToLower().Contains(term));
            }

            return await query
                .OrderByDescending(c => c.DataHoraConsulta)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<Consulta?> GetConsultaWithDetailsAsync(int id)
        {
            return await _context.Consultas
                .AsNoTracking()
                .Include(c => c.Animal)
                .Include(c => c.InstalacaoBioterio)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<VisaoGeralClinicaResponse> GetVisaoGeralClinicaAsync(GetVisaoGeralClinicaQuery query, CancellationToken cancellationToken = default)
        {
            var animalsQuery = _context.Animals
                .AsNoTracking()
                .Include(a => a.Especie)
                .Include(a => a.InstalacaoBioterio)
                .Include(a => a.AnimalLocalizacao)
                    .ThenInclude(al => al.Localizacao)
                .AsQueryable();

            if (query.EspecieId.HasValue && query.EspecieId.Value > 0)
            {
                animalsQuery = animalsQuery.Where(a => a.EspecieId == query.EspecieId.Value);
            }

            var animals = await animalsQuery.ToListAsync(cancellationToken);

            // Carrega os atendimentos com AsNoTracking
            var consultas = await _context.Consultas.AsNoTracking().ToListAsync(cancellationToken);
            var prescricoes = await _context.PrescricoesMedicacao.AsNoTracking().Include(p => p.Medicacao).ToListAsync(cancellationToken);
            var evolucoes = await _context.Evolucoes.AsNoTracking().ToListAsync(cancellationToken);
            var procedimentos = await _context.Procedimentos.AsNoTracking().Include(p => p.TipoProcedimento).ToListAsync(cancellationToken);
            var exames = await _context.SolicitacoesExame.AsNoTracking().ToListAsync(cancellationToken);
            var altas = await _context.AltaAmbulatoriais.AsNoTracking().ToListAsync(cancellationToken);
            var quarentenas = await _context.LiberacoesQuarentena.AsNoTracking().ToListAsync(cancellationToken);
            var obitos = await _context.RegistrosObito.AsNoTracking().ToListAsync(cancellationToken);
            var anexos = await _context.Anexos.AsNoTracking().ToListAsync(cancellationToken);

            var items = new List<VisaoGeralClinicaItemVm>();

            foreach (var a in animals)
            {
                var eventosAnimal = new List<ResumoUltimoAtendimentoDto>();

                foreach (var c in consultas.Where(x => x.AnimalId == a.Id))
                {
                    eventosAnimal.Add(new ResumoUltimoAtendimentoDto
                    {
                        Id = c.Id,
                        Tipo = "Consulta",
                        TipoLabel = "Consulta",
                        DataHora = c.DataHoraConsulta,
                        Responsavel = !string.IsNullOrWhiteSpace(c.Responsavel) ? c.Responsavel : (!string.IsNullOrWhiteSpace(c.RF) ? c.RF : "Responsável"),
                        Resumo = !string.IsNullOrWhiteSpace(c.Anamnese) ? c.Anamnese : (!string.IsNullOrWhiteSpace(c.SuspeitaDiagnostica) ? c.SuspeitaDiagnostica : "Consulta clínica registrada")
                    });
                }

                foreach (var p in prescricoes.Where(x => x.AnimalId == a.Id))
                {
                    var medNome = p.Medicacao != null ? (!string.IsNullOrWhiteSpace(p.Medicacao.NomeComercial) ? p.Medicacao.NomeComercial : p.Medicacao.PrincipioAtivo) : "Medicação";
                    eventosAnimal.Add(new ResumoUltimoAtendimentoDto
                    {
                        Id = p.Id,
                        Tipo = "PrescricaoMedicacao",
                        TipoLabel = "Prescrição de Medicação",
                        DataHora = p.DataHoraInicio != default ? p.DataHoraInicio : p.DataCriacao,
                        Responsavel = !string.IsNullOrWhiteSpace(p.Responsavel) ? p.Responsavel : (!string.IsNullOrWhiteSpace(p.RF) ? p.RF : "Responsável"),
                        Resumo = $"{medNome} ({p.VolumeDose}) - {p.QuantidadeDoses} dose(s)"
                    });
                }

                foreach (var e in evolucoes.Where(x => x.AnimalId == a.Id))
                {
                    eventosAnimal.Add(new ResumoUltimoAtendimentoDto
                    {
                        Id = e.Id,
                        Tipo = "Evolucao",
                        TipoLabel = "Evolução Clínica",
                        DataHora = e.DataHoraRegistro != default ? e.DataHoraRegistro : e.DataCriacao,
                        Responsavel = !string.IsNullOrWhiteSpace(e.Responsavel) ? e.Responsavel : (!string.IsNullOrWhiteSpace(e.RF) ? e.RF : "Responsável"),
                        Resumo = !string.IsNullOrWhiteSpace(e.Descricao) ? e.Descricao : "Evolução clínica registrada"
                    });
                }

                foreach (var pr in procedimentos.Where(x => x.AnimalId == a.Id))
                {
                    eventosAnimal.Add(new ResumoUltimoAtendimentoDto
                    {
                        Id = pr.Id,
                        Tipo = "Procedimento",
                        TipoLabel = "Procedimento",
                        DataHora = pr.DataCriacao,
                        Responsavel = !string.IsNullOrWhiteSpace(pr.Responsavel) ? pr.Responsavel : (!string.IsNullOrWhiteSpace(pr.RF) ? pr.RF : "Responsável"),
                        Resumo = pr.TipoProcedimento != null ? $"{pr.TipoProcedimento.Nome}: {pr.Descricao}" : pr.Descricao
                    });
                }

                foreach (var ex in exames.Where(x => x.AnimalId == a.Id))
                {
                    eventosAnimal.Add(new ResumoUltimoAtendimentoDto
                    {
                        Id = ex.Id,
                        Tipo = "SolicitacaoExame",
                        TipoLabel = "Solicitação de Exame",
                        DataHora = ex.DataCriacao,
                        Responsavel = !string.IsNullOrWhiteSpace(ex.Responsavel) ? ex.Responsavel : (!string.IsNullOrWhiteSpace(ex.RF) ? ex.RF : "Responsável"),
                        Resumo = $"Exame: {ex.TipoExame} - Região: {ex.RegiaoAnatomica}"
                    });
                }

                foreach (var alt in altas.Where(x => x.AnimalId == a.Id))
                {
                    eventosAnimal.Add(new ResumoUltimoAtendimentoDto
                    {
                        Id = alt.Id,
                        Tipo = "AltaAmbulatorial",
                        TipoLabel = "Alta Ambulatorial",
                        DataHora = alt.DataAltaClinica != default ? alt.DataAltaClinica : alt.DataCriacao,
                        Responsavel = !string.IsNullOrWhiteSpace(alt.Responsavel) ? alt.Responsavel : (!string.IsNullOrWhiteSpace(alt.RF) ? alt.RF : "Responsável"),
                        Resumo = !string.IsNullOrWhiteSpace(alt.ObservacoesClinicas) ? alt.ObservacoesClinicas : "Alta ambulatorial concedida"
                    });
                }

                foreach (var q in quarentenas.Where(x => x.AnimalId == a.Id))
                {
                    eventosAnimal.Add(new ResumoUltimoAtendimentoDto
                    {
                        Id = q.Id,
                        Tipo = "LiberacaoQuarentena",
                        TipoLabel = "Liberação de Quarentena",
                        DataHora = q.DataSaidaQuarentena != default ? q.DataSaidaQuarentena : q.DataCriacao,
                        Responsavel = !string.IsNullOrWhiteSpace(q.Responsavel) ? q.Responsavel : (!string.IsNullOrWhiteSpace(q.RF) ? q.RF : "Responsável"),
                        Resumo = "Animal liberado do isolamento / quarentena"
                    });
                }

                foreach (var o in obitos.Where(x => x.AnimalId == a.Id))
                {
                    eventosAnimal.Add(new ResumoUltimoAtendimentoDto
                    {
                        Id = o.Id,
                        Tipo = "RegistroObito",
                        TipoLabel = "Registro de Óbito",
                        DataHora = o.DataObito != default ? o.DataObito : o.DataCriacao,
                        Responsavel = !string.IsNullOrWhiteSpace(o.RF) ? o.RF : "Responsável",
                        Resumo = !string.IsNullOrWhiteSpace(o.Observacoes) ? o.Observacoes : "Óbito registrado"
                    });
                }

                foreach (var an in anexos.Where(x => x.AnimalId == a.Id))
                {
                    eventosAnimal.Add(new ResumoUltimoAtendimentoDto
                    {
                        Id = an.Id,
                        Tipo = "Anexo",
                        TipoLabel = "Anexo Clínico",
                        DataHora = an.DataCriacao,
                        Responsavel = !string.IsNullOrWhiteSpace(an.Responsavel) ? an.Responsavel : (!string.IsNullOrWhiteSpace(an.RF) ? an.RF : "Responsável"),
                        Resumo = !string.IsNullOrWhiteSpace(an.Descricao) ? an.Descricao : (an.NomeArquivoAnexo ?? "Documento anexo")
                    });
                }

                if (eventosAnimal.Count == 0) continue;

                var ultimo = eventosAnimal.OrderByDescending(x => x.DataHora).First();

                string statusClinico = "Em Observação";
                if (a.SituacaoAnimal == Situacao.Obito || obitos.Any(x => x.AnimalId == a.Id))
                {
                    statusClinico = "Óbito";
                }
                else if (prescricoes.Any(x => x.AnimalId == a.Id && x.StatusPrescricao == StatusPrescricao.Ativa))
                {
                    statusClinico = "Em Tratamento";
                }
                else if (ultimo.Tipo == "AltaAmbulatorial")
                {
                    statusClinico = "Alta Ambulatorial";
                }
                else if (ultimo.Tipo == "LiberacaoQuarentena")
                {
                    statusClinico = "Liberado";
                }

                string loc = a.AnimalLocalizacao?.Localizacao?.CaminhoHierarquia
                             ?? a.AnimalLocalizacao?.Localizacao?.Nome
                             ?? a.InstalacaoBioterio?.Nome
                             ?? "-";

                items.Add(new VisaoGeralClinicaItemVm
                {
                    AnimalId = a.Id,
                    NumeroRegistro = a.NumeroRegistro,
                    NomePopular = a.NomePopular,
                    EspecieId = a.EspecieId,
                    EspecieNome = a.Especie?.Nome ?? string.Empty,
                    FaseDeVida = (int)a.FaseDeVida,
                    FaseDeVidaNome = a.FaseDeVida.ToString(),
                    GeneroNome = a.Genero.ToString(),
                    Localizacao = loc,
                    SituacaoAnimal = (int)a.SituacaoAnimal,
                    SituacaoAnimalNome = a.SituacaoAnimal.ToString(),
                    StatusClinico = statusClinico,
                    TotalAtendimentos = eventosAnimal.Count,
                    UltimoAtendimento = ultimo
                });
            }

            // Filtro por Tipo de Atendimento
            if (!string.IsNullOrWhiteSpace(query.TipoAtendimento))
            {
                items = items.Where(i => i.UltimoAtendimento != null && string.Equals(i.UltimoAtendimento.Tipo, query.TipoAtendimento.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Filtro por Data
            if (query.DataInicio.HasValue)
            {
                items = items.Where(i => i.UltimoAtendimento != null && i.UltimoAtendimento.DataHora >= query.DataInicio.Value).ToList();
            }
            if (query.DataFim.HasValue)
            {
                items = items.Where(i => i.UltimoAtendimento != null && i.UltimoAtendimento.DataHora <= query.DataFim.Value).ToList();
            }

            // Filtro de Busca Textual
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var term = query.Search.Trim().ToLower();
                items = items.Where(i =>
                    (i.NumeroRegistro != null && i.NumeroRegistro.ToLower().Contains(term)) ||
                    (i.NomePopular != null && i.NomePopular.ToLower().Contains(term)) ||
                    (i.EspecieNome != null && i.EspecieNome.ToLower().Contains(term)) ||
                    (i.UltimoAtendimento != null && i.UltimoAtendimento.Responsavel.ToLower().Contains(term)) ||
                    (i.UltimoAtendimento != null && i.UltimoAtendimento.Resumo.ToLower().Contains(term))
                ).ToList();
            }

            // Ordena sempre pelo último atendimento mais recente
            items = items.OrderByDescending(i => i.UltimoAtendimento?.DataHora).ToList();

            var destaque = items.FirstOrDefault();

            var totalCount = items.Count;
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;

            var pagedItems = items.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            return new VisaoGeralClinicaResponse
            {
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                DestaqueUltimoAtendimentoGeral = destaque,
                Items = pagedItems
            };
        }
    }
}
