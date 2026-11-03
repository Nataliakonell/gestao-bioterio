using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.CreatePrescricaoMedicacao
{
    public class CreatePrescricaoMedicacaoHandler(
        IMapper mapper,
        IPrescricaoMedicacaoRepository prescricaoMedicacaoRepository,
        IAnimalRepository animalRepository,
        IValidator<CreatePrescricaoMedicacaoCommand> validator
    ) : IRequestHandler<CreatePrescricaoMedicacaoCommand, CreatePrescricaoMedicacaoResponse>
    {
        public async Task<CreatePrescricaoMedicacaoResponse> Handle(CreatePrescricaoMedicacaoCommand request, CancellationToken cancellationToken)
        {
            var response = new CreatePrescricaoMedicacaoResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação do cadastro de prescrição de medicação.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var isVivo = await animalRepository.IsAnimalVivoAsync(request.AnimalId, cancellationToken);
            if (!isVivo)
            {
                response.Success = false;
                response.Message = "Não é permitido registrar prescrição de medicação para animal com situação 'Óbito' ou 'Reintroduzido'.";
                response.ValidationErrors = new List<string> { response.Message };
                return response;
            }

            var prescricao = new PrescricaoMedicacao
            {
                AnimalId = request.AnimalId,
                MedicacaoId = request.MedicacaoId,
                VolumeDose = request.VolumeDose,
                ViaAdministracao = request.ViaAdministracao,
                QuantidadeDoses = request.QuantidadeDoses,
                IntervaloEntreDosesHoras = request.IntervaloEntreDosesHoras,
                DataHoraInicio = request.DataHoraInicio,
                Observacao = request.Observacao ?? string.Empty,
                Responsavel = request.Responsavel ?? string.Empty,
                StatusPrescricao = StatusPrescricao.Ativa
            };

            for (int i = 0; i < request.QuantidadeDoses; i++)
            {
                prescricao.Administracoes.Add(new MedicacaoAdministrada
                {
                    DataHoraPrevista = request.DataHoraInicio.AddHours(i * request.IntervaloEntreDosesHoras),
                    DataHoraAdministracao = null,
                    Observacao = null,
                    Responsavel = string.Empty,
                    StatusDose = StatusDose.Agendada
                });
            }

            prescricao = await prescricaoMedicacaoRepository.AddAsync(prescricao);

            response.Id = prescricao.Id;
            response.Prescricao = mapper.Map<CreatePrescricaoMedicacaoDto>(prescricao);
            response.Message = "Prescrição de medicação cadastrada com sucesso!";
            return response;
        }
    }
}
