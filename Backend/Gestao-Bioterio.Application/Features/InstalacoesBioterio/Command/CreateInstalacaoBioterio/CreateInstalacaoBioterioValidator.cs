using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.CreateInstalacaoBioterio
{
    public class CreateInstalacaoBioterioValidator : AbstractValidator<CreateInstalacaoBioterioCommand>
    {
        private readonly IInstalacaoBioterioRepository _locationRepository;

        public CreateInstalacaoBioterioValidator(IInstalacaoBioterioRepository instalacaoBioterioRepository)
        {
            instalacaoBioterioRepository = instalacaoBioterioRepository;

            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("O nome da instalação é obrigatório.")
                .NotNull()
                .MaximumLength(100).WithMessage("O nome da instalação não deve exceder 100 caracteres.");
        }
    }
}
