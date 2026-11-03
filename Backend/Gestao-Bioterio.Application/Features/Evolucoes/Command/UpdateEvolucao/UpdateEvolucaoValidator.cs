using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Command.UpdateEvolucao
{
    public class UpdateEvolucaoValidator : AbstractValidator<UpdateEvolucaoCommand>
    {
        private readonly IAnimalRepository _animalRepository;

        public UpdateEvolucaoValidator(IAnimalRepository animalRepository)
        {
            _animalRepository = animalRepository;

            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("O id da evolução é obrigatório.");

            RuleFor(x => x.AnimalId)
                .GreaterThan(0)
                .WithMessage("Animal é obrigatório.")
                .MustAsync(AnimalExists)
                .WithMessage("O animal informado não existe.");

            RuleFor(x => x.Descricao)
                .NotEmpty()
                .WithMessage("A descrição da evolução é obrigatória.");

            RuleFor(x => x.DataHoraRegistro)
                .NotEmpty()
                .WithMessage("A data e hora do registro são obrigatórias.");

            RuleFor(x => x.Responsavel)
                .NotEmpty()
                .WithMessage("O responsável pela evolução é obrigatório.");
        }

        private async Task<bool> AnimalExists(int animalId, CancellationToken cancellationToken)
        {
            var animal = await _animalRepository.GetByIdAsync(animalId);
            return animal != null;
        }
    }
}