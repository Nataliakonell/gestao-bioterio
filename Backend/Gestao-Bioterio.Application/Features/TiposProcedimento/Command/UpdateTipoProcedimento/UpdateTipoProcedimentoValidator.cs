using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Command.UpdateTipoProcedimento
{
    public class UpdateTipoProcedimentoValidator : AbstractValidator<UpdateTipoProcedimentoCommand>
    {
        private readonly ITipoProcedimentoRepository _repository;

        public UpdateTipoProcedimentoValidator(ITipoProcedimentoRepository repository)
        {
            _repository = repository;

            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("O id é obrigatório.");

            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("O nome é obrigatório.")
                .NotNull()
                .MaximumLength(200).WithMessage("O nome não pode exceder 200 caracteres.");

            RuleFor(e => e)
                .MustAsync(NameUnique)
                .WithMessage("Já existe um tipo de procedimento cadastrado com este nome.");
        }

        private async Task<bool> NameUnique(UpdateTipoProcedimentoCommand e, CancellationToken token)
        {
            var items = await _repository.ListAllAsync();
            return !items.Any(x => x.Id != e.Id && x.Nome.Equals(e.Nome, StringComparison.OrdinalIgnoreCase));
        }
    }
}
