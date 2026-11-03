using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.CreateProtocoloDesverminacao
{
    public class CreateProtocoloDesverminacaoHandler(
        IMapper mapper,
        IProtocoloDesverminacaoRepository protocoloRepository,
        IAnimalRepository animalRepository,
        IValidator<CreateProtocoloDesverminacaoCommand> validator
    ) : IRequestHandler<CreateProtocoloDesverminacaoCommand, CreateProtocoloDesverminacaoResponse>
    {
        public async Task<CreateProtocoloDesverminacaoResponse> Handle(CreateProtocoloDesverminacaoCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateProtocoloDesverminacaoResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação do protocolo de desverminação.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var isVivo = await animalRepository.IsAnimalVivoAsync(request.AnimalId, cancellationToken);
            if (!isVivo)
            {
                response.Success = false;
                response.Message = "Não é permitido registrar protocolo de desverminação para animal com situação 'Óbito' ou 'Reintroduzido'.";
                response.ValidationErrors = new List<string> { response.Message };
                return response;
            }

            var protocolo = new ProtocoloDesverminacao
            {
                AnimalId = request.AnimalId,
                DataEntrada = request.DataEntrada,
                StatusProtocolo = StatusProtocolo.AguardandoPrimeiraDose,
                CicloInicialConcluido = false
            };

            if (!request.TemHistoricoDoses)
            {
                protocolo.Doses.Add(new DoseAplicacaoDesverminacao
                {
                    TipoDose = TipoDose.PrimeiraDose,
                    DataPrevista = request.DataEntrada.AddDays(60),
                    StatusDoseDesverminacao = StatusDoseDesverminacao.Agendada
                });
            }

            protocolo = await protocoloRepository.AddAsync(protocolo);

            response.Id = protocolo.Id;
            response.ProtocoloDesverminacao = mapper.Map<CreateProtocoloDesverminacaoDto>(protocolo);
            response.Message = "Protocolo de desverminação cadastrado com sucesso!";
            return response;
        }
    }
}
