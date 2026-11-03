using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Command.CreateTipoProcedimento
{
    public class CreateTipoProcedimentoValidator : AbstractValidator<CreateTipoProcedimentoCommand>
    {
        private readonly ITipoProcedimentoRepository _repository;

        public CreateTipoProcedimentoValidator(ITipoProcedimentoRepository repository)
        {
            _repository = repository;

            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("O nome é obrigatório.")
                .NotNull()
                .MaximumLength(200).WithMessage("O nome não pode exceder 200 caracteres.");

            RuleFor(e => e)
                .MustAsync(NameUnique)
                .WithMessage("Já existe um tipo de procedimento cadastrado com este nome.");
        }

        private async Task<bool> NameUnique(CreateTipoProcedimentoCommand e, CancellationToken token)
        {
            var items = await _repository.ListAllAsync();
            return !items.Any(x => x.Nome.Equals(e.Nome, StringComparison.OrdinalIgnoreCase));
        }
    }
}
