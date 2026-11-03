using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.UpdateDoseAplicacaoDesverminacao
{
    public class UpdateDoseAplicacaoDesverminacaoHandler(
        IDoseAplicacaoDesverminacaoRepository doseRepository,
        IProtocoloDesverminacaoRepository protocoloRepository,
        IAnimalRepository animalRepository,
        IValidator<UpdateDoseAplicacaoDesverminacaoCommand> validator
    ) : IRequestHandler<UpdateDoseAplicacaoDesverminacaoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateDoseAplicacaoDesverminacaoCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse("Erro na validação da atualização da dose de desverminação.", false);

            var dose = await doseRepository.GetByIdAsync(request.Id);
            if (dose == null)
                throw new NotFoundException(nameof(DoseAplicacaoDesverminacao), request.Id);

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var protocolo = await protocoloRepository.GetByIdAsync(request.ProtocoloDesverminacaoId);
            if (protocolo == null)
            {
                response.Success = false;
                response.Message = "Protocolo de desverminação não encontrado.";
                return response;
            }

            var isVivo = await animalRepository.IsAnimalVivoAsync(protocolo.AnimalId, cancellationToken);
            if (!isVivo)
            {
                response.Success = false;
                response.Message = "Não é permitido registrar dose de desverminação para animal com situação 'Óbito' ou 'Reintroduzido'.";
                response.ValidationErrors = new List<string> { response.Message };
                return response;
            }

            dose.ProtocoloDesverminacaoId = request.ProtocoloDesverminacaoId;
            dose.TipoDose = request.TipoDose;
            dose.DataPrevista = request.DataPrevista;
            dose.DataAplicacao = request.DataAplicacao;
            dose.StatusDoseDesverminacao = request.StatusDoseDesverminacao;
            dose.Observacao = request.Observacao;
            dose.Responsavel = request.Responsavel;

            await doseRepository.UpdateAsync(dose);

            if (request.StatusDoseDesverminacao == StatusDoseDesverminacao.Aplicada && dose.DataAplicacao.HasValue)
            {
                // Buscar todas as doses do protocolo para verificar se a próxima já existe
                var todasDoses = await doseRepository.GetDosesByProtocoloAsync(request.ProtocoloDesverminacaoId);

                if (request.TipoDose == TipoDose.PrimeiraDose)
                {
                    protocolo.StatusProtocolo = StatusProtocolo.AguardandoSegundaDose;
                    protocolo.DataProximaDose = dose.DataAplicacao.Value.AddDays(15);

                    // Criar 2ª dose somente se ainda não existe
                    var jaTemSegunda = todasDoses.Any(d => d.TipoDose == TipoDose.SegundaDose && d.StatusDoseDesverminacao != StatusDoseDesverminacao.Aplicada);
                    if (!jaTemSegunda)
                    {
                        var proxima = new DoseAplicacaoDesverminacao
                        {
                            ProtocoloDesverminacaoId = protocolo.Id,
                            TipoDose = TipoDose.SegundaDose,
                            DataPrevista = dose.DataAplicacao.Value.AddDays(15),
                            StatusDoseDesverminacao = StatusDoseDesverminacao.Agendada
                        };
                        await doseRepository.AddAsync(proxima);
                    }
                }
                else if (request.TipoDose == TipoDose.SegundaDose)
                {
                    protocolo.StatusProtocolo = StatusProtocolo.ManutencaoAnual;
                    protocolo.CicloInicialConcluido = true;
                    protocolo.DataConclusaoCicloInicial = dose.DataAplicacao;
                    protocolo.DataProximaDose = dose.DataAplicacao.Value.AddMonths(12);

                    // Criar dose anual somente se ainda não existe
                    var jaTemAnual = todasDoses.Any(d => d.TipoDose == TipoDose.Anual && d.StatusDoseDesverminacao != StatusDoseDesverminacao.Aplicada);
                    if (!jaTemAnual)
                    {
                        var proxima = new DoseAplicacaoDesverminacao
                        {
                            ProtocoloDesverminacaoId = protocolo.Id,
                            TipoDose = TipoDose.Anual,
                            DataPrevista = dose.DataAplicacao.Value.AddMonths(12),
                            StatusDoseDesverminacao = StatusDoseDesverminacao.Agendada
                        };
                        await doseRepository.AddAsync(proxima);
                    }
                }
                else if (request.TipoDose == TipoDose.Anual)
                {
                    protocolo.StatusProtocolo = StatusProtocolo.ManutencaoAnual;
                    protocolo.CicloInicialConcluido = true;
                    protocolo.DataProximaDose = dose.DataAplicacao.Value.AddMonths(12);

                    // Criar próxima dose anual somente se ainda não existe
                    var jaTemProximaAnual = todasDoses.Any(d => d.TipoDose == TipoDose.Anual && d.Id != request.Id && d.StatusDoseDesverminacao != StatusDoseDesverminacao.Aplicada);
                    if (!jaTemProximaAnual)
                    {
                        var proxima = new DoseAplicacaoDesverminacao
                        {
                            ProtocoloDesverminacaoId = protocolo.Id,
                            TipoDose = TipoDose.Anual,
                            DataPrevista = dose.DataAplicacao.Value.AddMonths(12),
                            StatusDoseDesverminacao = StatusDoseDesverminacao.Agendada
                        };
                        await doseRepository.AddAsync(proxima);
                    }
                }
                await protocoloRepository.UpdateAsync(protocolo);
            }

            response.Success = true;
            response.Message = "Dose de desverminação atualizada com sucesso!";
            return response;
        }
    }
}
