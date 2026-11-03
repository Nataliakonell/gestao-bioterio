using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Command.UpdateLocalOrigem
{
    public class UpdateLocalOrigemValidator : AbstractValidator<UpdateLocalOrigemCommand>
    {
        private readonly ILocalOrigemRepository _localOrigemRepository;

        public UpdateLocalOrigemValidator(ILocalOrigemRepository localOrigemRepository)
        {
            _localOrigemRepository = localOrigemRepository;

            RuleFor(p => p.Id)
                .NotEmpty().WithMessage("{PropertyName} é obrigatório.");

            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("{PropertyName} é obrigatório.")
                .NotNull()
                .MaximumLength(100).WithMessage("{PropertyName} não deve exceder 100 caracteres.")
                .MustAsync(NomeUnique).WithMessage("Este local já está cadastrado.");
        }

        private async Task<bool> NomeUnique(UpdateLocalOrigemCommand e, string nome, CancellationToken token)
        {
            return await _localOrigemRepository.IsNomeUnique(nome, e.Id);
        }
    }
}
