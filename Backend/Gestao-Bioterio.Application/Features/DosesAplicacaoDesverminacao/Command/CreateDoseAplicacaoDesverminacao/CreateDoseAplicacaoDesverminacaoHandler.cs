using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.CreateDoseAplicacaoDesverminacao
{
    public class CreateDoseAplicacaoDesverminacaoHandler(
        IMapper mapper,
        IDoseAplicacaoDesverminacaoRepository doseRepository,
        IProtocoloDesverminacaoRepository protocoloRepository,
        IAnimalRepository animalRepository,
        IValidator<CreateDoseAplicacaoDesverminacaoCommand> validator
    ) : IRequestHandler<CreateDoseAplicacaoDesverminacaoCommand, CreateDoseAplicacaoDesverminacaoResponse>
    {
        public async Task<CreateDoseAplicacaoDesverminacaoResponse> Handle(CreateDoseAplicacaoDesverminacaoCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateDoseAplicacaoDesverminacaoResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação da dose de desverminação.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var protocolo = await protocoloRepository.GetByIdAsync(request.ProtocoloDesverminacaoId);
            if (protocolo == null)
            {
                response.Success = false;
                response.Message = "Protocolo de desverminação informado não encontrado.";
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

            var dose = new DoseAplicacaoDesverminacao
            {
                ProtocoloDesverminacaoId = request.ProtocoloDesverminacaoId,
                TipoDose = request.TipoDose,
                DataPrevista = request.DataPrevista,
                DataAplicacao = request.DataAplicacao,
                StatusDoseDesverminacao = request.StatusDoseDesverminacao,
                Observacao = request.Observacao,
                Responsavel = request.Responsavel
            };

            dose = await doseRepository.AddAsync(dose);

            if (request.StatusDoseDesverminacao == StatusDoseDesverminacao.Aplicada && dose.DataAplicacao.HasValue)
            {
                if (request.TipoDose == TipoDose.PrimeiraDose)
                {
                    protocolo.StatusProtocolo = StatusProtocolo.AguardandoSegundaDose;
                    
                    var proxima = new DoseAplicacaoDesverminacao
                    {
                        ProtocoloDesverminacaoId = protocolo.Id,
                        TipoDose = TipoDose.SegundaDose,
                        DataPrevista = dose.DataAplicacao.Value.AddDays(15),
                        StatusDoseDesverminacao = StatusDoseDesverminacao.Agendada
                    };
                    protocolo.DataProximaDose = proxima.DataPrevista;
                    await doseRepository.AddAsync(proxima);
                }
                else if (request.TipoDose == TipoDose.SegundaDose)
                {
                    protocolo.StatusProtocolo = StatusProtocolo.ManutencaoAnual;
                    protocolo.CicloInicialConcluido = true;
                    protocolo.DataConclusaoCicloInicial = dose.DataAplicacao;
                    
                    var proxima = new DoseAplicacaoDesverminacao
                    {
                        ProtocoloDesverminacaoId = protocolo.Id,
                        TipoDose = TipoDose.Anual,
                        DataPrevista = dose.DataAplicacao.Value.AddMonths(12),
                        StatusDoseDesverminacao = StatusDoseDesverminacao.Agendada
                    };
                    protocolo.DataProximaDose = proxima.DataPrevista;
                    await doseRepository.AddAsync(proxima);
                }
                else if (request.TipoDose == TipoDose.Anual)
                {
                    protocolo.StatusProtocolo = StatusProtocolo.ManutencaoAnual;
                    protocolo.CicloInicialConcluido = true;
                    
                    var proxima = new DoseAplicacaoDesverminacao
                    {
                        ProtocoloDesverminacaoId = protocolo.Id,
                        TipoDose = TipoDose.Anual,
                        DataPrevista = dose.DataAplicacao.Value.AddMonths(12),
                        StatusDoseDesverminacao = StatusDoseDesverminacao.Agendada
                    };
                    protocolo.DataProximaDose = proxima.DataPrevista;
                    await doseRepository.AddAsync(proxima);
                }
                await protocoloRepository.UpdateAsync(protocolo);
            }

            response.Id = dose.Id;
            response.DoseAplicacaoDesverminacao = mapper.Map<CreateDoseAplicacaoDesverminacaoDto>(dose);
            response.Message = "Dose de desverminação cadastrada com sucesso!";
            return response;
        }
    }
}
