using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.UpdateRotinaAnimal
{
    public class UpdateRotinaAnimalHandler
        (IMapper mapper,
        IRotinaAnimalRepository rotinaAnimalRepository,
        IValidator<UpdateRotinaAnimalCommand> validator
    ) : IRequestHandler<UpdateRotinaAnimalCommand, UpdateRotinaAnimalResponse>
    {
        public async Task<UpdateRotinaAnimalResponse> Handle(UpdateRotinaAnimalCommand command, CancellationToken cancellationToken)
        {
            var response = new UpdateRotinaAnimalResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização da rotina da espécie.";
                return response;
            }

            var existing = await rotinaAnimalRepository.GetRotinasByEspecieTipoAsync(command.EspecieId, command.TipoRotina);

            foreach (var item in existing)
            {
                await rotinaAnimalRepository.DeleteAsync(item);
            }

            var rotinasCadastradas = new List<RotinaAnimal>();
            foreach (var fase in command.Fases)
            {
                var rotina = new RotinaAnimal
                {
                    EspecieId = command.EspecieId,
                    TipoRotina = command.TipoRotina,
                    ProtocoloDieta = fase.ProtocoloDieta,
                    FaseDeVida = fase.FaseDeVida,
                    TipoFrequencia = fase.TipoFrequencia,
                    Frequencia = fase.Frequencia,
                    DiaSemanaProgramado = fase.DiaSemanaProgramado
                };
                rotina = await rotinaAnimalRepository.AddAsync(rotina);
                rotinasCadastradas.Add(rotina);
            }

            response.Rotinas = mapper.Map<List<UpdateRotinaAnimalDto>>(rotinasCadastradas);
            response.Message = "Rotina(s) atualizada(s) com sucesso!";
            return response;
        }
    }
}