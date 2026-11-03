using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAnimalRotinaStatus;
using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllAnimaisRotinaStatus
{
    public class GetAllAnimaisRotinaStatusQueryHandler(
        IAnimalRepository animalRepository,
        IRotinaAnimalRepository rotinaAnimalRepository,
        IAlimentacaoRepository alimentacaoRepository,
        IBiometriaAnimalRepository biometriaAnimalRepository
    ) : IRequestHandler<GetAllAnimaisRotinaStatusQuery, PaginatedAnimalRotinaStatusVm>
    {
        private static readonly Dictionary<string, DayOfWeek> DiaSemanaMap = new()
        {
            ["Domingo"] = DayOfWeek.Sunday,
            ["Segunda"] = DayOfWeek.Monday,
            ["Terça"] = DayOfWeek.Tuesday,
            ["Quarta"] = DayOfWeek.Wednesday,
            ["Quinta"] = DayOfWeek.Thursday,
            ["Sexta"] = DayOfWeek.Friday,
            ["Sábado"] = DayOfWeek.Saturday
        };

        public async Task<PaginatedAnimalRotinaStatusVm> Handle(GetAllAnimaisRotinaStatusQuery request, CancellationToken cancellationToken)
        {
            var hoje = TimeZoneHelper.GetNowInCampoGrande().Date;

            var animais = await animalRepository.GetAnimalsListAsync(
                especieId: request.EspecieId,
                situacao: request.SituacaoAnimal,
                searchTerm: null, // Busca é aplicada em memória após o cálculo de rotinas para suportar status e datas
                page: 1,
                pageSize: int.MaxValue
            );

            var especieIds = animais.Select(a => a.EspecieId).Distinct().ToList();
            var rotinas = await rotinaAnimalRepository.GetAllWithEspecieAsync();
            var rotinasPorEspecie = rotinas.GroupBy(r => r.EspecieId).ToDictionary(g => g.Key, g => g.ToList());

            var animalIds = animais.Select(a => a.Id).ToList();
            var ultimasAlimentacoes = await alimentacaoRepository.GetUltimasAlimentacoesAsync(animalIds);
            var ultimasBiometrias = await biometriaAnimalRepository.GetUltimasBiometriasAsync(animalIds);
            var alimentacoesSemana = await alimentacaoRepository.GetAlimentacoesSinceAsync(animalIds, hoje.AddDays(-7));

            var items = animais.Select(animal =>
            {
                var rotinasDaEspecie = rotinasPorEspecie.GetValueOrDefault(animal.EspecieId);
                var rotinaAlimentacao = rotinasDaEspecie?.FirstOrDefault(r => 
                    r.TipoRotina == TipoRotina.Alimentacao && 
                    (r.FaseDeVida == animal.FaseDeVida || r.FaseDeVida == FaseDeVida.Todos));
                var rotinaBiometria = rotinasDaEspecie?.FirstOrDefault(r => 
                    r.TipoRotina == TipoRotina.Biometria && 
                    (r.FaseDeVida == animal.FaseDeVida || r.FaseDeVida == FaseDeVida.Todos));

                var ultimaAlimentacao = ultimasAlimentacoes.GetValueOrDefault(animal.Id);
                var ultimaBiometria = ultimasBiometrias.GetValueOrDefault(animal.Id);
                var alimentacoesAnimal = alimentacoesSemana.GetValueOrDefault(animal.Id);

                return new AnimalRotinaStatusVm
                {
                    AnimalId = animal.Id,
                    NumeroRegistro = animal.NumeroRegistro,
                    NomeAnimal = animal.NomePopular,
                    EspecieNome = animal.Especie?.Nome ?? string.Empty,
                    FaseDeVida = animal.FaseDeVida,
                    Alimentacao = CalcularStatusRotina(
                        rotinaAlimentacao,
                        ultimaAlimentacao?.DataAlimentacao,
                        hoje,
                        animal.FaseDeVida,
                        rotinaAlimentacao?.ProtocoloDieta,
                        ultimaAlimentacao?.DataAlimentacao.Date == hoje,
                        alimentacoesAnimal),
                    Biometria = CalcularStatusRotina(
                        rotinaBiometria,
                        ultimaBiometria?.DataBiometria,
                        hoje,
                        animal.FaseDeVida,
                        null,
                        ultimaBiometria?.DataBiometria.Date == hoje)
                };
            }).ToList();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var term = request.Search.Trim().ToLower();
                items = items.Where(i =>
                    i.NumeroRegistro.ToLower().Contains(term) ||
                    (i.NomeAnimal != null && i.NomeAnimal.ToLower().Contains(term)) ||
                    i.EspecieNome.ToLower().Contains(term) ||
                    GetFaseDeVidaLabel(i.FaseDeVida).ToLower().Contains(term) ||
                    (i.Alimentacao != null && GetStatusLabel(i.Alimentacao.Status).ToLower().Contains(term)) ||
                    (i.Alimentacao != null && GetFrequenciaText(i.Alimentacao).ToLower().Contains(term)) ||
                    (i.Alimentacao != null && i.Alimentacao.UltimaData.HasValue && i.Alimentacao.UltimaData.Value.ToString("dd/MM/yyyy").Contains(term)) ||
                    (i.Alimentacao != null && i.Alimentacao.ProximaData.HasValue && i.Alimentacao.ProximaData.Value.ToString("dd/MM/yyyy").Contains(term)) ||
                    (i.Biometria != null && GetStatusLabel(i.Biometria.Status).ToLower().Contains(term)) ||
                    (i.Biometria != null && GetFrequenciaText(i.Biometria).ToLower().Contains(term)) ||
                    (i.Biometria != null && i.Biometria.UltimaData.HasValue && i.Biometria.UltimaData.Value.ToString("dd/MM/yyyy").Contains(term)) ||
                    (i.Biometria != null && i.Biometria.ProximaData.HasValue && i.Biometria.ProximaData.Value.ToString("dd/MM/yyyy").Contains(term))
                ).ToList();
            }

            if (request.FaseDeVida != null && request.FaseDeVida.Any())
            {
                items = items.Where(i => request.FaseDeVida.Contains((int)i.FaseDeVida)).ToList();
            }
            if (request.StatusBiometria != null && request.StatusBiometria.Any())
            {
                items = items.Where(i => i.Biometria != null && request.StatusBiometria.Contains((int)i.Biometria.Status)).ToList();
            }
            if (request.StatusAlimentacao != null && request.StatusAlimentacao.Any())
            {
                items = items.Where(i => i.Alimentacao != null && request.StatusAlimentacao.Contains((int)i.Alimentacao.Status)).ToList();
            }
            if (request.DataBiometriaInicial.HasValue && request.DataBiometriaFinal.HasValue)
            {
                var ini = request.DataBiometriaInicial.Value.Date;
                var fim = request.DataBiometriaFinal.Value.Date;
                items = items.Where(i =>
                    (i.Biometria?.UltimaData.HasValue == true && i.Biometria.UltimaData.Value.Date >= ini && i.Biometria.UltimaData.Value.Date <= fim) ||
                    (i.Biometria?.ProximaData.HasValue == true && i.Biometria.ProximaData.Value.Date >= ini && i.Biometria.ProximaData.Value.Date <= fim)
                ).ToList();
            }
            else if (request.DataBiometriaInicial.HasValue)
            {
                var ini = request.DataBiometriaInicial.Value.Date;
                items = items.Where(i =>
                    (i.Biometria?.UltimaData.HasValue == true && i.Biometria.UltimaData.Value.Date >= ini) ||
                    (i.Biometria?.ProximaData.HasValue == true && i.Biometria.ProximaData.Value.Date >= ini)
                ).ToList();
            }
            else if (request.DataBiometriaFinal.HasValue)
            {
                var fim = request.DataBiometriaFinal.Value.Date;
                items = items.Where(i =>
                    (i.Biometria?.UltimaData.HasValue == true && i.Biometria.UltimaData.Value.Date <= fim) ||
                    (i.Biometria?.ProximaData.HasValue == true && i.Biometria.ProximaData.Value.Date <= fim)
                ).ToList();
            }

            if (request.DataAlimentacaoInicial.HasValue && request.DataAlimentacaoFinal.HasValue)
            {
                var ini = request.DataAlimentacaoInicial.Value.Date;
                var fim = request.DataAlimentacaoFinal.Value.Date;
                items = items.Where(i =>
                    (i.Alimentacao?.UltimaData.HasValue == true && i.Alimentacao.UltimaData.Value.Date >= ini && i.Alimentacao.UltimaData.Value.Date <= fim) ||
                    (i.Alimentacao?.ProximaData.HasValue == true && i.Alimentacao.ProximaData.Value.Date >= ini && i.Alimentacao.ProximaData.Value.Date <= fim)
                ).ToList();
            }
            else if (request.DataAlimentacaoInicial.HasValue)
            {
                var ini = request.DataAlimentacaoInicial.Value.Date;
                items = items.Where(i =>
                    (i.Alimentacao?.UltimaData.HasValue == true && i.Alimentacao.UltimaData.Value.Date >= ini) ||
                    (i.Alimentacao?.ProximaData.HasValue == true && i.Alimentacao.ProximaData.Value.Date >= ini)
                ).ToList();
            }
            else if (request.DataAlimentacaoFinal.HasValue)
            {
                var fim = request.DataAlimentacaoFinal.Value.Date;
                items = items.Where(i =>
                    (i.Alimentacao?.UltimaData.HasValue == true && i.Alimentacao.UltimaData.Value.Date <= fim) ||
                    (i.Alimentacao?.ProximaData.HasValue == true && i.Alimentacao.ProximaData.Value.Date <= fim)
                ).ToList();
            }

            var totalCount = items.Count;

            var summary = new RotinaStatusSummaryVm
            {
                AlimentacaoAtrasado = items.Count(i => i.Alimentacao?.Status == StatusRotina.Atrasado),
                AlimentacaoSemRegistro = items.Count(i => i.Alimentacao?.Status == StatusRotina.SemRegistro),
                AlimentacaoHoje = items.Count(i => i.Alimentacao?.Status == StatusRotina.Hoje),
                AlimentacaoProximo = items.Count(i => i.Alimentacao?.Status == StatusRotina.Proximo),
                AlimentacaoConcluido = items.Count(i => i.Alimentacao?.Status == StatusRotina.Concluido),
                AlimentacaoEmDia = items.Count(i => i.Alimentacao?.Status == StatusRotina.EmDia),
                AlimentacaoNaoAlimentado = items.Count(i => i.Alimentacao?.Status == StatusRotina.NaoAlimentado),

                BiometriaAtrasado = items.Count(i => i.Biometria?.Status == StatusRotina.Atrasado),
                BiometriaSemRegistro = items.Count(i => i.Biometria?.Status == StatusRotina.SemRegistro),
                BiometriaHoje = items.Count(i => i.Biometria?.Status == StatusRotina.Hoje),
                BiometriaProximo = items.Count(i => i.Biometria?.Status == StatusRotina.Proximo),
                BiometriaConcluido = items.Count(i => i.Biometria?.Status == StatusRotina.Concluido),
                BiometriaEmDia = items.Count(i => i.Biometria?.Status == StatusRotina.EmDia),
                BiometriaNaoAlimentado = items.Count(i => i.Biometria?.Status == StatusRotina.NaoAlimentado)
            };

            // Paginação
            var paged = items
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            return new PaginatedAnimalRotinaStatusVm
            {
                Items = paged,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                Summary = summary
            };
        }

        private static RotinaStatusDetalheVm CalcularStatusRotina(
            RotinaAnimal? rotina,
            DateTime? ultimaData,
            DateTime hoje,
            FaseDeVida faseDeVida,
            string? protocoloDieta,
            bool registroHoje,
            List<Alimentacao>? alimentacoesRecentes = null)
        {
            if (rotina == null)
            {
                return new RotinaStatusDetalheVm
                {
                    RotinaCadastrada = false,
                    Status = StatusRotina.SemRegistro,
                    StatusDescricao = "Rotina não configurada para esta espécie/fase de vida."
                };
            }

            if (ultimaData == null)
            {
                return new RotinaStatusDetalheVm
                {
                    RotinaCadastrada = true,
                    Status = StatusRotina.SemRegistro,
                    StatusDescricao = "Nenhum registro encontrado.",
                    TipoFrequencia = rotina.TipoFrequencia,
                    Frequencia = rotina.Frequencia,
                    DiaSemanaProgramado = rotina.DiaSemanaProgramado,
                    ProtocoloDieta = protocoloDieta
                };
            }

            var ultimaDataDate = ultimaData.Value.Date;

            if (rotina.TipoFrequencia == TipoFrequencia.DiasDaSemana)
                return CalcularStatusDiasDaSemana(rotina, ultimaDataDate, hoje, registroHoje, protocoloDieta, alimentacoesRecentes);

            DateTime? proximaData = null;

            switch (rotina.TipoFrequencia)
            {
                case TipoFrequencia.Diaria:
                    proximaData = ultimaDataDate.AddDays(1);
                    break;
                case TipoFrequencia.IntervaloEmDias:
                    if (rotina.Frequencia.HasValue)
                        proximaData = ultimaDataDate.AddDays(rotina.Frequencia.Value);
                    break;
            }

            if (proximaData == null)
            {
                return new RotinaStatusDetalheVm
                {
                    RotinaCadastrada = true,
                    Status = StatusRotina.SemRegistro,
                    StatusDescricao = "Frequência não configurada corretamente.",
                    UltimaData = ultimaData,
                    TipoFrequencia = rotina.TipoFrequencia,
                    Frequencia = rotina.Frequencia,
                    DiaSemanaProgramado = rotina.DiaSemanaProgramado,
                    ProtocoloDieta = protocoloDieta
                };
            }

            var status = CalcularStatus(hoje, proximaData.Value, registroHoje);

            return new RotinaStatusDetalheVm
            {
                RotinaCadastrada = true,
                Status = status,
                StatusDescricao = DescricaoStatus(status),
                UltimaData = ultimaData,
                ProximaData = proximaData.Value,
                TipoFrequencia = rotina.TipoFrequencia,
                Frequencia = rotina.Frequencia,
                DiaSemanaProgramado = rotina.DiaSemanaProgramado,
                ProtocoloDieta = protocoloDieta
            };
        }

        private static RotinaStatusDetalheVm CalcularStatusDiasDaSemana(
            RotinaAnimal rotina,
            DateTime ultimaDataDate,
            DateTime hoje,
            bool registroHoje,
            string? protocoloDieta,
            List<Alimentacao>? alimentacoesRecentes = null)
        {
            var diasSemana = rotina.DiaSemanaProgramado
                ?.Where(d => DiaSemanaMap.ContainsKey(d))
                .Select(d => DiaSemanaMap[d])
                .ToHashSet() ?? new HashSet<DayOfWeek>();

            if (diasSemana.Count == 0)
            {
                return new RotinaStatusDetalheVm
                {
                    RotinaCadastrada = true,
                    Status = StatusRotina.SemRegistro,
                    StatusDescricao = "Dias da semana não configurados.",
                    TipoFrequencia = rotina.TipoFrequencia,
                    Frequencia = rotina.Frequencia,
                    DiaSemanaProgramado = rotina.DiaSemanaProgramado,
                    ProtocoloDieta = protocoloDieta
                };
            }

            // Most recent scheduled day BEFORE today
            DateTime? ultimoDiaProgramado = null;
            for (int i = 1; i <= 7; i++)
            {
                var testDate = hoje.AddDays(-i);
                if (diasSemana.Contains(testDate.DayOfWeek))
                {
                    ultimoDiaProgramado = testDate;
                    break;
                }
            }
            if (ultimoDiaProgramado.HasValue && ultimaDataDate < ultimoDiaProgramado.Value)
            {
                var diasSemanaStatus = CalcularDiasSemanaStatus(rotina, hoje, alimentacoesRecentes);
                return new RotinaStatusDetalheVm
                {
                    RotinaCadastrada = true,
                    Status = StatusRotina.NaoAlimentado,
                    StatusDescricao = "Não alimentado em dia programado.",
                    UltimaData = ultimaDataDate,
                    ProximaData = ultimoDiaProgramado.Value,
                    TipoFrequencia = rotina.TipoFrequencia,
                    Frequencia = rotina.Frequencia,
                    DiaSemanaProgramado = rotina.DiaSemanaProgramado,
                    ProtocoloDieta = protocoloDieta,
                    DiasSemanaStatus = diasSemanaStatus
                };
            }

            // Next scheduled day (today or future)
            DateTime? proximaData = null;
            for (int i = 0; i <= 7; i++)
            {
                var testDate = hoje.AddDays(i);
                if (diasSemana.Contains(testDate.DayOfWeek))
                {
                    proximaData = testDate;
                    break;
                }
            }

            if (!proximaData.HasValue)
            {
                return new RotinaStatusDetalheVm
                {
                    RotinaCadastrada = true,
                    Status = StatusRotina.SemRegistro,
                    StatusDescricao = "Nenhum dia programado encontrado nos próximos 7 dias.",
                    UltimaData = ultimaDataDate,
                    TipoFrequencia = rotina.TipoFrequencia,
                    Frequencia = rotina.Frequencia,
                    DiaSemanaProgramado = rotina.DiaSemanaProgramado,
                    ProtocoloDieta = protocoloDieta
                };
            }

            var status = CalcularStatus(hoje, proximaData.Value, registroHoje);
            var diasSemanaStatusFinal = CalcularDiasSemanaStatus(rotina, hoje, alimentacoesRecentes);

            return new RotinaStatusDetalheVm
            {
                RotinaCadastrada = true,
                Status = status,
                StatusDescricao = DescricaoStatus(status),
                UltimaData = ultimaDataDate,
                ProximaData = proximaData.Value,
                TipoFrequencia = rotina.TipoFrequencia,
                Frequencia = rotina.Frequencia,
                DiaSemanaProgramado = rotina.DiaSemanaProgramado,
                ProtocoloDieta = protocoloDieta,
                DiasSemanaStatus = diasSemanaStatusFinal
            };
        }

        private static List<DiaSemanaStatusVm> CalcularDiasSemanaStatus(
            RotinaAnimal rotina,
            DateTime hoje,
            List<Alimentacao>? alimentacoesRecentes)
        {
            var datasAlimentacao = alimentacoesRecentes
                ?.Select(a => a.DataAlimentacao.Date)
                .ToHashSet() ?? new HashSet<DateTime>();

            int daysSinceMonday = ((int)hoje.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
            var thisWeekMonday = hoje.AddDays(-daysSinceMonday);

            var result = new List<DiaSemanaStatusVm>();
            foreach (var diaNome in rotina.DiaSemanaProgramado ?? new())
            {
                if (!DiaSemanaMap.TryGetValue(diaNome, out var dayOfWeek))
                    continue;

                int targetOffset = ((int)dayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
                var ocorrencia = thisWeekMonday.AddDays(targetOffset);

                string perDayStatus;
                if (ocorrencia.Date < hoje.Date)
                {
                    perDayStatus = datasAlimentacao.Contains(ocorrencia.Date)
                        ? "concluido"
                        : "naoAlimentado";
                }
                else if (ocorrencia.Date == hoje.Date)
                {
                    perDayStatus = datasAlimentacao.Contains(ocorrencia.Date)
                        ? "concluido"
                        : "hoje";
                }
                else
                {
                    perDayStatus = "agendado";
                }

                result.Add(new DiaSemanaStatusVm { Dia = diaNome, Status = perDayStatus });
            }
            return result;
        }

        private static StatusRotina CalcularStatus(DateTime hoje, DateTime proximaData, bool registroHoje)
        {
            if (proximaData.Date < hoje.Date)
                return StatusRotina.Atrasado;

            if (proximaData.Date == hoje.Date)
                return registroHoje ? StatusRotina.Concluido : StatusRotina.Hoje;

            if (proximaData.Date == hoje.Date.AddDays(1))
                return StatusRotina.Proximo;

            return StatusRotina.EmDia;
        }

        private static string DescricaoStatus(StatusRotina status) => status switch
        {
            StatusRotina.SemRegistro => "Sem registro",
            StatusRotina.Atrasado => "Atrasado",
            StatusRotina.Hoje => "Hoje",
            StatusRotina.Concluido => "Concluído",
            StatusRotina.Proximo => "Próximo",
            StatusRotina.EmDia => "Em dia",
            StatusRotina.NaoAlimentado => "Não alimentado",
            _ => string.Empty
        };

        private static string GetStatusLabel(StatusRotina status) => status switch
        {
            StatusRotina.SemRegistro => "Sem registro sem registro",
            StatusRotina.Hoje => "Hoje hoje",
            StatusRotina.Proximo => "Próximo proximo",
            StatusRotina.Concluido => "Concluído concluido",
            StatusRotina.EmDia => "Em dia em dia",
            StatusRotina.Atrasado => "Atrasado atrasada",
            StatusRotina.NaoAlimentado => "Não alimentado nao alimentado Não realizado nao realizado",
            _ => string.Empty
        };

        private static string GetFaseDeVidaLabel(FaseDeVida fase) => fase switch
        {
            FaseDeVida.Filhote => "Filhote filhote",
            FaseDeVida.Jovem => "Jovem jovem",
            FaseDeVida.Adulto => "Adulto adulto",
            _ => string.Empty
        };

        private static string GetFrequenciaText(RotinaStatusDetalheVm info)
        {
            if (info.TipoFrequencia == TipoFrequencia.Diaria) return "Diário diario";
            if (info.TipoFrequencia == TipoFrequencia.IntervaloEmDias) return $"A cada {info.Frequencia} dia(s)";
            if (info.TipoFrequencia == TipoFrequencia.DiasDaSemana) return "Semanal dias da semana";
            return string.Empty;
        }
    }
}
