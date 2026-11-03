using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.CreateLiberacaoQuarentena
{
    public class CreateLiberacaoQuarentenaValidator : AbstractValidator<CreateLiberacaoQuarentenaCommand>
    {
        public CreateLiberacaoQuarentenaValidator(IAnimalRepository animalRepository)
        {
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
