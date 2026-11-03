using FluentValidation;

using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Command.UpdateMedicacao
{
    public class UpdateMedicacaoValidator : AbstractValidator<UpdateMedicacaoCommand>
    {
        private readonly IMedicacaoRepository _medicacaoRepository;

        public UpdateMedicacaoValidator(IMedicacaoRepository medicacaoRepository)
        {
            _medicacaoRepository = medicacaoRepository;

            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Id é obrigatório.");

            RuleFor(x => x.PrincipioAtivo)
                .NotEmpty().WithMessage("Princípio Ativo é obrigatório.")
                .MaximumLength(255).WithMessage("Princípio Ativo deve ter no máximo 255 caracteres.");

            RuleFor(x => x.NomeComercial)
                .NotEmpty().WithMessage("Nome Comercial é obrigatório.")
                .MaximumLength(255).WithMessage("Nome Comercial deve ter no máximo 255 caracteres.");

            RuleFor(x => x)
                .MustAsync(MedicacaoUnica).WithMessage("Esta medicação (Princípio Ativo + Nome Comercial) já está cadastrada.");
        }

        private async Task<bool> MedicacaoUnica(UpdateMedicacaoCommand command, CancellationToken cancellationToken)
        {
            var isUnique = await _medicacaoRepository.IsUniqueAsync(command.PrincipioAtivo, command.NomeComercial, command.Id);
            return isUnique;
        }
    }
}