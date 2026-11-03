using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.UpdateMovimentacaoAnimal
{
    public class UpdateMovimentacaoAnimalHandler(
        IMovimentacaoAnimalRepository movimentacaoAnimalRepository,
        IValidator<UpdateMovimentacaoAnimalCommand> validator
    ) : IRequestHandler<UpdateMovimentacaoAnimalCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateMovimentacaoAnimalCommand command, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização da movimentação.";
                return response;
            }

            var entity = await movimentacaoAnimalRepository.GetByIdAsync(command.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(MovimentacaoAnimal), command.Id);
            }

            entity.AnimalId = command.AnimalId;
            entity.LocalizacaoId = command.LocalizacaoId;
            entity.EventoId = command.EventoId;
            entity.TipoMovimentacao = command.TipoMovimentacao;

            await movimentacaoAnimalRepository.UpdateAsync(entity);

            response.Success = true;
            response.Message = "Movimentação atualizada com sucesso!";
            return response;
        }
    }
}
