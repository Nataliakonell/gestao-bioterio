using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Anexos.Command.UpdateAnexo
{
    public class UpdateAnexoValidator : AbstractValidator<UpdateAnexoCommand>
    {
        private readonly IAnimalRepository _animalRepository;

        public UpdateAnexoValidator(IAnimalRepository animalRepository)
        {
            _animalRepository = animalRepository;

            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("O id do anexo é obrigatório.");

            RuleFor(x => x.AnimalId)
                .GreaterThan(0)
                .WithMessage("Animal é obrigatório.")
                .MustAsync(AnimalExists)
                .WithMessage("O animal informado não existe.");

            RuleFor(x => x.NomeArquivoAnexo)
                .MaximumLength(200)
                .WithMessage("O nome do arquivo deve ter no máximo 200 caracteres.");

            RuleFor(x => x.Descricao)
                .MaximumLength(2000)
                .WithMessage("A descrição deve ter no máximo 2000 caracteres.");
        }

        private async Task<bool> AnimalExists(int animalId, CancellationToken cancellationToken)
        {
            var animal = await _animalRepository.GetByIdAsync(animalId);
            return animal != null;
        }
    }
}