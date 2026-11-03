using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.UpdateLiberacaoQuarentena
{
    public class UpdateLiberacaoQuarentenaValidator : AbstractValidator<UpdateLiberacaoQuarentenaCommand>
    {
        public UpdateLiberacaoQuarentenaValidator(
            ILiberacaoQuarentenaRepository repository,
            IAnimalRepository animalRepository)
        {
            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("{PropertyName} é obrigatório.")
                .MustAsync(async (id, token) =>
                {
                    var entity = await repository.GetByIdAsync(id);
                    return entity != null;
                }).WithMessage("Registro de liberação de quarentena não encontrado.");

            RuleFor(p => p.AnimalId)
                .GreaterThan(0).WithMessage("{PropertyName} é obrigatório.")
                .MustAsync(async (id, token) =>
                {
                    var animal = await animalRepository.GetByIdAsync(id);
                    return animal != null;
                }).WithMessage("Animal informado não foi encontrado.");

            RuleFor(p => p.DataEntradaQuarentena)
                .NotEmpty().WithMessage("Data de entrada na quarentena é obrigatória.");

            RuleFor(p => p.DataSaidaQuarentena)
                .NotEmpty().WithMessage("Data de saída/liberação da quarentena é obrigatória.");

            RuleFor(p => p)
                .Must(p => p.DataSaidaQuarentena >= p.DataEntradaQuarentena)
                .WithMessage("Data de saída da quarentena não pode ser anterior à data de entrada.")
                .When(p => p.DataEntradaQuarentena != default && p.DataSaidaQuarentena != default);
        }
    }
}
