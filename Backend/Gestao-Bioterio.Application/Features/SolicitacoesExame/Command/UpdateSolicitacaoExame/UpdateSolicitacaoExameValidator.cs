using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.UpdateSolicitacaoExame
{
    public class UpdateSolicitacaoExameValidator : AbstractValidator<UpdateSolicitacaoExameCommand>
    {
        private readonly IAnimalRepository _animalRepository;

        public UpdateSolicitacaoExameValidator(IAnimalRepository animalRepository)
        {
            _animalRepository = animalRepository;

            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Solicitação de exame é obrigatória.");

            RuleFor(x => x.AnimalId)
                .GreaterThan(0)
                .WithMessage("Animal é obrigatório.")
                .MustAsync(AnimalExists)
                .WithMessage("O animal informado não existe.");

            RuleFor(x => x.TipoExame)
                .IsInEnum()
                .WithMessage("Tipo de exame inválido.");

            RuleFor(x => x.RegiaoAnatomica)
                .NotEmpty()
                .WithMessage("Região anatômica é obrigatória.")
                .MaximumLength(2000)
                .WithMessage("Região anatômica deve ter no máximo 2000 caracteres.");

            RuleFor(x => x.SinaisClinicos)
                .MaximumLength(2000)
                .WithMessage("Sinais clínicos devem ter no máximo 2000 caracteres.");

            RuleFor(x => x.SuspeitaClinica)
                .MaximumLength(2000)
                .WithMessage("Suspeita clínica deve ter no máximo 2000 caracteres.");

            RuleFor(x => x.Observacao)
                .MaximumLength(2000)
                .WithMessage("Observação deve ter no máximo 2000 caracteres.");
        }

        private async Task<bool> AnimalExists(int animalId, CancellationToken cancellationToken)
        {
            var animal = await _animalRepository.GetByIdAsync(animalId);
            return animal != null;
        }
    }
}