using FluentValidation;

using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Command.CreateMedicacao
{
    public class CreateMedicacaoValidator : AbstractValidator<CreateMedicacaoCommand>
    {
        private readonly IMedicacaoRepository _medicacaoRepository;

        public CreateMedicacaoValidator(IMedicacaoRepository medicacaoRepository)
        {
            _medicacaoRepository = medicacaoRepository;

            RuleFor(x => x.PrincipioAtivo)
                .NotEmpty().WithMessage("Princípio Ativo é obrigatório.")
                .MaximumLength(255).WithMessage("Princípio Ativo deve ter no máximo 255 caracteres.");

            RuleFor(x => x.NomeComercial)
                .NotEmpty().WithMessage("Nome Comercial é obrigatório.")
                .MaximumLength(255).WithMessage("Nome Comercial deve ter no máximo 255 caracteres.");

            RuleFor(x => x)
                .MustAsync(MedicacaoUnica).WithMessage("Esta medicação (Princípio Ativo + Nome Comercial) já está cadastrada.");
        }

        private async Task<bool> MedicacaoUnica(CreateMedicacaoCommand command, CancellationToken cancellationToken)
        {
            var isUnique = await _medicacaoRepository.IsUniqueAsync(command.PrincipioAtivo, command.NomeComercial);
            return isUnique;
        }
    }
}