using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.UpdateAnimalLocalizacao
{
    public class UpdateAnimalLocalizacaoHandler(
        IMapper mapper,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IValidator<UpdateAnimalLocalizacaoCommand> validator
    ) : IRequestHandler<UpdateAnimalLocalizacaoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateAnimalLocalizacaoCommand command, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização da localização do animal.";
                return response;
            }

            var entity = await animalLocalizacaoRepository.GetByIdAsync(command.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(AnimalLocalizacao), command.Id);
            }

            entity.AnimalId = command.AnimalId;
            entity.LocalizacaoId = command.LocalizacaoId;

            await animalLocalizacaoRepository.UpdateAsync(entity);

            response.Success = true;
            response.Message = "Localização do animal atualizada com sucesso!";
            return response;
        }
    }
}
