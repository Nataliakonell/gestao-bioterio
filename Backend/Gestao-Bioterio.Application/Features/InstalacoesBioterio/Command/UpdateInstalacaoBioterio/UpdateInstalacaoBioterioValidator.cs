using FluentValidation;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.UpdateInstalacaoBioterio
{
    public class UpdateInstalacaoBioterioValidator : AbstractValidator<UpdateInstalacaoBioterioCommand>
    {
        public UpdateInstalacaoBioterioValidator()
        {
            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("ID da localização inválido.");

            RuleFor(p => p.Nome)
                .MaximumLength(100).WithMessage("O nome da localização não deve exceder 100 caracteres.")
                .When(p => !string.IsNullOrEmpty(p.Nome));
        }
    }
}
