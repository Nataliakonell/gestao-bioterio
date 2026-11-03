using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.CreateMedicacaoAdministrada
{
    public class CreateMedicacaoAdministradaHandler(
        IMapper mapper,
        IMedicacaoAdministradaRepository medicacaoAdministradaRepository,
        IPrescricaoMedicacaoRepository prescricaoMedicacaoRepository,
        IAnimalRepository animalRepository,
        IValidator<CreateMedicacaoAdministradaCommand> validator
    ) : IRequestHandler<CreateMedicacaoAdministradaCommand, CreateMedicacaoAdministradaResponse>
    {
        public async Task<CreateMedicacaoAdministradaResponse> Handle(CreateMedicacaoAdministradaCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateMedicacaoAdministradaResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação do cadastro de administração de medicação.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var prescricao = await prescricaoMedicacaoRepository.GetByIdAsync(request.PrescricaoMedicacaoId);
            if (prescricao != null)
            {
                if (prescricao.StatusPrescricao == StatusPrescricao.Suspensa)
                {
                    response.Success = false;
                    response.Message = "Não é possível administrar esta medicação porque a prescrição está suspensa.";
                    return response;
                }

                var isVivo = await animalRepository.IsAnimalVivoAsync(prescricao.AnimalId, cancellationToken);
                if (!isVivo)
                {
                    response.Success = false;
                    response.Message = "Não é possível administrar esta medicação porque o animal associado encontra-se com situação 'Óbito' ou 'Reintroduzido'.";
                    response.ValidationErrors = new List<string> { response.Message };
                    return response;
                }
            }

            var administracao = new MedicacaoAdministrada
            {
                PrescricaoMedicacaoId = request.PrescricaoMedicacaoId,
                DataHoraAdministracao = request.DataHoraAdministracao,
                DataHoraPrevista = request.DataHoraPrevista,
                Observacao = request.Observacao ?? string.Empty,
                Responsavel = request.Responsavel,
                StatusDose = request.StatusDose
            };

            administracao = await medicacaoAdministradaRepository.AddAsync(administracao);

            response.Id = administracao.Id;
            response.Administracao = mapper.Map<CreateMedicacaoAdministradaDto>(administracao);
            response.Message = "Administração de medicação cadastrada com sucesso!";
            return response;
        }
    }
}
