using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAnimalRotinaStatus
{
    public class GetAnimalRotinaStatusQueryHandler : IRequestHandler<GetAnimalRotinaStatusQuery, AnimalRotinaStatusVm>
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

        private readonly IAnimalRepository _animalRepository;
        private readonly IRotinaAnimalRepository _rotinaAnimalRepository;
        private readonly IAlimentacaoRepository _alimentacaoRepository;
        private readonly IBiometriaAnimalRepository _biometriaAnimalRepository;

        public GetAnimalRotinaStatusQueryHandler(
            IAnimalRepository animalRepository,
            IRotinaAnimalRepository rotinaAnimalRepository,
            IAlimentacaoRepository alimentacaoRepository,
            IBiometriaAnimalRepository biometriaAnimalRepository)
        {
            _animalRepository = animalRepository;
            _rotinaAnimalRepository = rotinaAnimalRepository;
            _alimentacaoRepository = alimentacaoRepository;
            _biometriaAnimalRepository = biometriaAnimalRepository;
        }

        public async Task<AnimalRotinaStatusVm> Handle(GetAnimalRotinaStatusQuery request, CancellationToken cancellationToken)
        {
            var animal = await _animalRepository.GetAnimalWithDetailsAsync(request.AnimalId);
            if (animal == null)
                throw new NotFoundException(nameof(Animal), request.AnimalId);
            
            var hoje = TimeZoneHelper.GetNowInCampoGrande().Date;

            var rotinas = await _rotinaAnimalRepository.GetRotinasByEspecieAsync(animal.EspecieId);

            var rotinaAlimentacao = rotinas.FirstOrDefault(r =>
                r.TipoRotina == TipoRotina.Alimentacao &&
                (r.FaseDeVida == animal.FaseDeVida || r.FaseDeVida == FaseDeVida.Todos));

            var rotinaBiometria = rotinas.FirstOrDefault(r =>
                r.TipoRotina == TipoRotina.Biometria &&
                (r.FaseDeVida == animal.FaseDeVida || r.FaseDeVida == FaseDeVida.Todos));

            var ultimaAlimentacao = await _alimentacaoRepository.GetUltimaAlimentacaoAsync(request.AnimalId);
            var ultimaBiometria = await _biometriaAnimalRepository.GetUltimaBiometriaAsync(request.AnimalId);
            var hojeSemana = hoje.AddDays(-7);
            var alimentacoesRecentes = (await _alimentacaoRepository.GetAlimentacoesSinceAsync(new[] { request.AnimalId }, hojeSemana))
                .GetValueOrDefault(request.AnimalId);

            var vm = new AnimalRotinaStatusVm
            {
                AnimalId = animal.Id,
                NumeroRegistro = animal.NumeroRegistro,
                NomeAnimal = animal.NomePopular,
                EspecieNome = animal.Especie?.Nome ?? string.Empty,
                FaseDeVida = animal.FaseDeVida,
                Alimentacao = CalcularStatusRotina(
                rotina: rotinaAlimentacao,
                ultimaData: ultimaAlimentacao?.DataAlimentacao,
                hoje: hoje,
                protocoloDieta: rotinaAlimentacao?.ProtocoloDieta,
                registroHoje: ultimaAlimentacao?.DataAlimentacao.Date == hoje,
                alimentacoesRecentes: alimentacoesRecentes),
                Biometria = CalcularStatusRotina(
                    rotina: rotinaBiometria,
                    ultimaData: ultimaBiometria?.DataBiometria,
                    hoje: hoje,
                    protocoloDieta: null,
                    registroHoje: ultimaBiometria?.DataBiometria.Date == hoje)
            };

            return vm;
        }

        private static RotinaStatusDetalheVm CalcularStatusRotina(
            RotinaAnimal? rotina,
            DateTime? ultimaData,
            DateTime hoje,
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
            StatusRotina.Atrasado    => "Atrasado",
            StatusRotina.Hoje        => "Hoje",
            StatusRotina.Concluido   => "Concluído",
            StatusRotina.Proximo     => "Próximo",
            StatusRotina.EmDia       => "Em dia",
            StatusRotina.NaoAlimentado => "Não alimentado",
            _ => string.Empty
        };
    }
}
