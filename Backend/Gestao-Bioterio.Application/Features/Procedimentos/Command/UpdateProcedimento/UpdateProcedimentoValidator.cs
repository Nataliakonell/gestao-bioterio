using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Command.UpdateProcedimento
{
    public class UpdateProcedimentoValidator : AbstractValidator<UpdateProcedimentoCommand>
    {
        private readonly IAnimalRepository _animalRepository;

        public UpdateProcedimentoValidator(IAnimalRepository animalRepository)
        {
            _animalRepository = animalRepository;

            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("O id do procedimento é obrigatório.");

            RuleFor(x => x.AnimalId)
                .GreaterThan(0)
                .WithMessage("Animal é obrigatório.")
                .MustAsync(AnimalExists)
                .WithMessage("O animal informado não existe.");

            RuleFor(x => x.TipoProcedimentoId)
                .GreaterThan(0)
                .WithMessage("O tipo de procedimento é obrigatório.");

            RuleFor(x => x.Descricao)
                .NotEmpty()
                .WithMessage("A descrição do procedimento é obrigatória.")
                .MaximumLength(2000)
                .WithMessage("A descrição do procedimento deve ter no máximo 2000 caracteres.");
        }

        private async Task<bool> AnimalExists(int animalId, CancellationToken cancellationToken)
        {
            var animal = await _animalRepository.GetByIdAsync(animalId);
            return animal != null;
        }
    }
}